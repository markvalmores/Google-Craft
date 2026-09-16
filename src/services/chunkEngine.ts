// Google Craft Dynamic Chunk Engine: Seamless Continuous Map Streaming & Memory Optimization
import * as THREE from 'three';
import { Landmark } from './googleMapsService';

export const CHUNK_SIZE = 24; // 24x24 blocks per chunk

export interface VoxelRecord {
  x: number;
  y: number;
  z: number;
  type: string;
}

export interface ActiveChunk {
  chunkX: number;
  chunkZ: number;
  meshes: THREE.Mesh[];
}

export class ChunkEngine {
  // Archive holding saved block state for every visited chunk (persists player edits)
  private chunkArchive = new Map<string, VoxelRecord[]>();
  // Active Three.js meshes currently present in the scene
  private activeChunks = new Map<string, ActiveChunk>();
  // Cache of disposed chunks to track memory saved
  private totalDisposedChunks: number = 0;

  private scene: THREE.Scene | null = null;
  private sharedGeometry: THREE.BoxGeometry;
  private materialsMap: Map<string, THREE.Material>;

  constructor(sharedGeometry: THREE.BoxGeometry, materialsMap: Map<string, THREE.Material>) {
    this.sharedGeometry = sharedGeometry;
    this.materialsMap = materialsMap;
  }

  public setScene(scene: THREE.Scene) {
    this.scene = scene;
  }

  public getChunkKey(chunkX: number, chunkZ: number): string {
    return `${chunkX},${chunkZ}`;
  }

  public getChunkCoords(worldX: number, worldZ: number): { chunkX: number; chunkZ: number } {
    return {
      chunkX: Math.floor((worldX + CHUNK_SIZE / 2) / CHUNK_SIZE),
      chunkZ: Math.floor((worldZ + CHUNK_SIZE / 2) / CHUNK_SIZE)
    };
  }

  public getMemorySavedMb(): number {
    // Estimated ~0.35 MB per unrendered/culled chunk (mesh geometries, materials, GPU buffers)
    return Math.round(this.totalDisposedChunks * 0.35 * 10) / 10;
  }

  public getLoadedChunksCount(): number {
    return this.activeChunks.size;
  }

  // Record a user-placed or destroyed block into the chunk archive
  public recordBlockModification(x: number, y: number, z: number, type: string | null) {
    const { chunkX, chunkZ } = this.getChunkCoords(x, z);
    const key = this.getChunkKey(chunkX, chunkZ);
    let records = this.chunkArchive.get(key);
    if (!records) {
      records = [];
      this.chunkArchive.set(key, records);
    }

    // Remove existing block record at this coordinate if any
    const existingIdx = records.findIndex(r => r.x === x && r.y === y && r.z === z);
    if (existingIdx !== -1) {
      records.splice(existingIdx, 1);
    }

    // If placed, add new record
    if (type !== null) {
      records.push({ x, y, z, type });
    }
  }

  // Unload chunks that are out of sight to save memory
  public cullOutOfViewChunks(centerChunkX: number, centerChunkZ: number, radius: number = 2) {
    if (!this.scene) return;

    for (const [key, chunk] of this.activeChunks.entries()) {
      const dx = Math.abs(chunk.chunkX - centerChunkX);
      const dz = Math.abs(chunk.chunkZ - centerChunkZ);

      // If beyond view radius, delete entire chunk from Three.js scene to save memory
      if (dx > radius || dz > radius) {
        chunk.meshes.forEach(mesh => {
          this.scene?.remove(mesh);
        });
        this.activeChunks.delete(key);
        this.totalDisposedChunks++;
      }
    }
  }

  // Load or generate chunks around player
  public updatePlayerChunks(
    playerX: number,
    playerZ: number,
    landmark: Landmark,
    viewRadius: number,
    onBlockAdded: (x: number, y: number, z: number, type: string, mesh: THREE.Mesh) => void
  ) {
    if (!this.scene) return;

    const { chunkX: centerCX, chunkZ: centerCZ } = this.getChunkCoords(playerX, playerZ);

    // 1. Cull distant chunks to conserve memory
    this.cullOutOfViewChunks(centerCX, centerCZ, viewRadius);

    // 2. Load or instantiate contiguous chunks
    for (let cx = centerCX - viewRadius; cx <= centerCX + viewRadius; cx++) {
      for (let cz = centerCZ - viewRadius; cz <= centerCZ + viewRadius; cz++) {
        const key = this.getChunkKey(cx, cz);

        // Chunk (0, 0) is reserved for the initial core landmark
        if (cx === 0 && cz === 0) continue;

        if (!this.activeChunks.has(key)) {
          this.loadOrGenerateChunk(cx, cz, landmark, onBlockAdded);
        }
      }
    }
  }

  // Generate contiguous terrain connected to the landmark
  private loadOrGenerateChunk(
    chunkX: number,
    chunkZ: number,
    landmark: Landmark,
    onBlockAdded: (x: number, y: number, z: number, type: string, mesh: THREE.Mesh) => void
  ) {
    if (!this.scene) return;
    const key = this.getChunkKey(chunkX, chunkZ);

    let voxelRecords: VoxelRecord[];

    // If chunk was previously visited, restore the saved voxel state!
    if (this.chunkArchive.has(key)) {
      voxelRecords = this.chunkArchive.get(key)!;
    } else {
      // Procedurally generate contiguous real-world terrain for this chunk
      voxelRecords = this.generateContiguousTerrain(chunkX, chunkZ, landmark);
      this.chunkArchive.set(key, voxelRecords);
    }

    const chunkMeshes: THREE.Mesh[] = [];

    // Create meshes and add to scene
    voxelRecords.forEach(v => {
      const mat = this.materialsMap.get(v.type) || this.materialsMap.get('stone')!;
      const mesh = new THREE.Mesh(this.sharedGeometry, mat);
      mesh.position.set(v.x, v.y, v.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { isBlock: true, x: v.x, y: v.y, z: v.z, type: v.type, chunkKey: key };

      this.scene?.add(mesh);
      chunkMeshes.push(mesh);
      onBlockAdded(v.x, v.y, v.z, v.type, mesh);
    });

    this.activeChunks.set(key, {
      chunkX,
      chunkZ,
      meshes: chunkMeshes
    });
  }

  // Generates terrain that matches the real-world geography of the landmark
  private generateContiguousTerrain(chunkX: number, chunkZ: number, landmark: Landmark): VoxelRecord[] {
    const records: VoxelRecord[] = [];
    const startX = chunkX * CHUNK_SIZE - Math.floor(CHUNK_SIZE / 2);
    const startZ = chunkZ * CHUNK_SIZE - Math.floor(CHUNK_SIZE / 2);

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const x = startX + lx;
        const z = startZ + lz;

        // Specialized geography based on landmark site
        if (landmark.id === 'eiffel_tower') {
          // Paris: River Seine meandering Northwest to Southeast
          const riverLine = x * 0.7 - z - 30;
          const isRiver = Math.abs(riverLine) < 8;
          const isQuay = Math.abs(riverLine) >= 8 && Math.abs(riverLine) <= 10;
          const isBoulevard = Math.abs(x % 28) <= 2 || Math.abs(z % 28) <= 2;

          if (isRiver) {
            // River Seine water
            records.push({ x, y: -1, z, type: 'water' });
            records.push({ x, y: -2, z, type: 'sand' });
          } else if (isQuay) {
            // Stone embankment quays
            records.push({ x, y: 0, z, type: 'stone' });
            records.push({ x, y: -1, z, type: 'cobblestone' });
            if ((lx + lz) % 6 === 0) {
              records.push({ x, y: 1, z, type: 'glowstone' }); // Parisian street lamp
            }
          } else if (isBoulevard) {
            // Parisian Cobblestone Boulevard
            records.push({ x, y: 0, z, type: 'cobblestone' });
            records.push({ x, y: -1, z, type: 'stone' });
          } else {
            // Parisian limestone buildings and park lawns
            const isPark = Math.abs(x) < 45 && z > 0;
            if (isPark) {
              records.push({ x, y: 0, z, type: 'grass' });
              records.push({ x, y: -1, z, type: 'dirt' });
              // Trees
              if (lx === 4 && lz === 4) {
                records.push({ x, y: 1, z, type: 'oak_planks' });
                records.push({ x, y: 2, z, type: 'oak_planks' });
                records.push({ x, y: 3, z, type: 'oak_leaves' });
                records.push({ x: x + 1, y: 3, z, type: 'oak_leaves' });
                records.push({ x: x - 1, y: 3, z, type: 'oak_leaves' });
              }
            } else {
              // Haussmannian apartment blocks
              records.push({ x, y: 0, z, type: 'quartz' });
              records.push({ x, y: -1, z, type: 'stone' });
              if (lx >= 2 && lx <= 8 && lz >= 2 && lz <= 8) {
                for (let hy = 1; hy <= 5; hy++) {
                  const isWindow = hy === 2 || hy === 4;
                  records.push({ x, y: hy, z, type: isWindow ? 'glass' : 'quartz' });
                }
              }
            }
          }
        } else if (landmark.id === 'giza_pyramid') {
          // Cairo / Giza: Rolling desert sand dunes & ancient causeways
          const duneHeight = Math.floor(Math.sin(x * 0.08) * Math.cos(z * 0.08) * 3);
          const isCauseway = Math.abs(x - z) <= 2;

          for (let y = -1; y <= duneHeight; y++) {
            records.push({ x, y, z, type: isCauseway ? 'sandstone' : 'sand' });
          }
          if (isCauseway && (lx + lz) % 8 === 0) {
            records.push({ x, y: duneHeight + 1, z, type: 'gold_block' });
          }
        } else if (landmark.id === 'taj_mahal') {
          // Agra: Yamuna River & Charbagh gardens
          const isYamuna = z < -30;
          if (isYamuna) {
            records.push({ x, y: -1, z, type: 'water' });
            records.push({ x, y: -2, z, type: 'sand' });
          } else {
            const isChannel = Math.abs(x) <= 1 || Math.abs(z - 15) <= 1;
            if (isChannel) {
              records.push({ x, y: 0, z, type: 'water' });
              records.push({ x, y: -1, z, type: 'sandstone' });
            } else {
              records.push({ x, y: 0, z, type: 'grass' });
              records.push({ x, y: -1, z, type: 'dirt' });
            }
          }
        } else {
          // Standard real-world contiguous natural terrain
          const isRoad = Math.abs(x % 24) <= 1 || Math.abs(z % 24) <= 1;
          const block = isRoad ? 'cobblestone' : (landmark.category === 'Bridge' ? 'water' : 'grass');
          records.push({ x, y: 0, z, type: block });
          records.push({ x, y: -1, z, type: 'stone' });
        }
      }
    }

    return records;
  }

  // Clear all chunks (when teleporting to a completely new landmark)
  public clearAll() {
    if (this.scene) {
      this.activeChunks.forEach(chunk => {
        chunk.meshes.forEach(m => this.scene?.remove(m));
      });
    }
    this.activeChunks.clear();
    this.chunkArchive.clear();
    this.totalDisposedChunks = 0;
  }
}
