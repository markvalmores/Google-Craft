// 3D Voxel World Engine with Three.js, Landmark Generators, Minecraft Avatars & Block Building
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Landmark, BlockArchitecturalInfo, getVoxelArchitecturalInfo, SpawnPoint, getDefaultSpawnPoint, getRandomSpawnPoint } from '../services/googleMapsService';
import { MinecraftSkin } from '../services/skins';
import { soundEngine } from '../services/soundEngine';
import { GameServer } from '../services/serverNetwork';
import { MiniMapHUD } from './MiniMapHUD';
import { VoxelTooltipHUD } from './VoxelTooltipHUD';
import { ChunkEngine } from '../services/chunkEngine';
import { weatherSeasonService, WeatherType, WeatherSeasonState } from '../services/weatherSeasonService';
import { hardwareOptimizer, PerformanceSettings } from '../services/hardwareOptimizer';
import { MobileTouchControls } from './MobileTouchControls';
import { GamepadControllerHUD } from './GamepadControllerHUD';
import { SpawnPointsSelectorModal } from './SpawnPointsSelectorModal';
import { DeveloperCreditsModal } from './DeveloperCreditsModal';

export type CameraPerspective = 'first_person' | 'third_person_back' | 'third_person_front';

export interface VoxelBlock {
  x: number;
  y: number;
  z: number;
  type: string;
}

export interface RemotePlayer {
  id: string;
  name: string;
  skin: MinecraftSkin;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  mesh?: THREE.Group;
}

export interface BlockTypeInfo {
  id: string;
  name: string;
  color: number;
  roughness: number;
  emissive?: number;
  transparent?: boolean;
  opacity?: number;
  icon: string;
}

export const BLOCK_PALETTE: BlockTypeInfo[] = [
  { id: 'stone', name: 'Stone', color: 0x7a7a7a, roughness: 0.9, icon: '🪨' },
  { id: 'cobblestone', name: 'Cobblestone', color: 0x5e5e5e, roughness: 1.0, icon: '🧱' },
  { id: 'oak_planks', name: 'Oak Planks', color: 0x9c7446, roughness: 0.8, icon: '🪵' },
  { id: 'bricks', name: 'Bricks', color: 0x9b4632, roughness: 0.9, icon: '🧱' },
  { id: 'quartz', name: 'Quartz Block', color: 0xefede8, roughness: 0.3, icon: '🏛️' },
  { id: 'sandstone', name: 'Sandstone', color: 0xd9c288, roughness: 0.9, icon: '🏜️' },
  { id: 'gold_block', name: 'Gold Block', color: 0xf5cf38, roughness: 0.2, emissive: 0x332200, icon: '🪙' },
  { id: 'diamond_block', name: 'Diamond Block', color: 0x4fe6df, roughness: 0.1, emissive: 0x113333, icon: '💎' },
  { id: 'glowstone', name: 'Glowstone', color: 0xffdf6d, roughness: 0.5, emissive: 0xffaa00, icon: '💡' },
  { id: 'redstone_lamp', name: 'Redstone Lamp', color: 0xbf360c, roughness: 0.5, emissive: 0xff3d00, icon: '🔴' },
  { id: 'obsidian', name: 'Obsidian', color: 0x1c142b, roughness: 0.2, icon: '🔮' },
  { id: 'glass', name: 'Glass', color: 0xd6f0ff, roughness: 0.1, transparent: true, opacity: 0.6, icon: '🪟' },
  { id: 'grass', name: 'Grass Block', color: 0x529134, roughness: 0.9, icon: '🌱' },
  { id: 'oak_leaves', name: 'Oak Leaves', color: 0x367a24, roughness: 0.8, icon: '🍃' },
  { id: 'water', name: 'Water', color: 0x2462b8, roughness: 0.1, transparent: true, opacity: 0.7, icon: '💧' },
  { id: 'tnt', name: 'TNT', color: 0xcc292b, roughness: 0.7, icon: '🧨' },
];

interface VoxelWorldProps {
  currentLandmark: Landmark;
  currentSkin: MinecraftSkin;
  currentServer: GameServer;
  username: string;
  isOpeningTrailer: boolean;
  onBlockPlaced?: () => void;
  onBlockBroken?: () => void;
  onOpenInventory?: () => void;
  onToggleMap?: () => void;
  onOpenWeather?: () => void;
  onOpenPerformance?: () => void;
  onOpenOccasions?: () => void;
  onOpenCredits?: () => void;
}

export const VoxelWorld: React.FC<VoxelWorldProps> = ({
  currentLandmark,
  currentSkin,
  currentServer,
  username,
  isOpeningTrailer,
  onBlockPlaced,
  onBlockBroken,
  onOpenInventory,
  onToggleMap,
  onOpenWeather,
  onOpenPerformance,
  onOpenOccasions,
  onOpenCredits
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBlockIdx, setSelectedBlockIdx] = useState(0);
  const [cameraMode, setCameraMode] = useState<CameraPerspective>('first_person');
  const [isFlying, setIsFlying] = useState(false);
  
  // Landmark Spawn Location & Points
  const initialSpawn = getDefaultSpawnPoint(currentLandmark);
  const [currentSpawnPoint, setCurrentSpawnPoint] = useState<SpawnPoint>(initialSpawn);
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  const [coordsHUD, setCoordsHUD] = useState({
    x: Math.round(initialSpawn.x),
    y: Math.round(initialSpawn.y),
    z: Math.round(initialSpawn.z),
    fps: 60
  });
  const [crosshairActive, setCrosshairActive] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>(currentLandmark.recommendedTime || 'day');

  // Weather state
  const [weatherState, setWeatherState] = useState<WeatherSeasonState>(weatherSeasonService.getCurrentState());
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Architectural Dossier Tooltip on Hover / Raycast
  const [hoveredArchInfo, setHoveredArchInfo] = useState<BlockArchitecturalInfo | null>(null);
  const [hoveredBlockType, setHoveredBlockType] = useState<string>('');
  const [hoveredBlockCoords, setHoveredBlockCoords] = useState<{ x: number; y: number; z: number } | null>(null);

  // Dynamic Continuous Path & Chunk Memory Management
  const [currentChunk, setCurrentChunk] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const [loadedChunksCount, setLoadedChunksCount] = useState<number>(1);
  const [memorySavedMb, setMemorySavedMb] = useState<number>(0);
  const chunkEngineRef = useRef<ChunkEngine | null>(null);
  const horizonMeshRef = useRef<THREE.Mesh | null>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarMeshRef = useRef<THREE.Group | null>(null);
  const avatarPartsRef = useRef<{
    head: THREE.Mesh;
    leftArm: THREE.Mesh;
    rightArm: THREE.Mesh;
    leftLeg: THREE.Mesh;
    rightLeg: THREE.Mesh;
    cape?: THREE.Mesh;
  } | null>(null);

  // Instanced / Group block storage
  const blocksMapRef = useRef<Map<string, { x: number; y: number; z: number; type: string; mesh: THREE.Mesh }>>(new Map());
  const highlightBoxRef = useRef<THREE.LineSegments | null>(null);
  const remotePlayersRef = useRef<Map<string, RemotePlayer>>(new Map());

  // Input state
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const playerPos = useRef(new THREE.Vector3(initialSpawn.x, initialSpawn.y, initialSpawn.z));
  const playerVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const cameraYaw = useRef(initialSpawn.yaw);
  const cameraPitch = useRef(initialSpawn.pitch);
  const isPointerLocked = useRef(false);
  const isMining = useRef(false);
  const miningProgress = useRef(0);
  const miningTarget = useRef<{ key: string; mesh: THREE.Mesh; x: number; y: number; z: number } | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Weather particle systems
  const weatherParticlesRef = useRef<THREE.Points | null>(null);
  const fireworksParticlesRef = useRef<THREE.Points[]>([]);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Material cache & box geometry
  const materialsCache = useRef<Map<string, THREE.Material>>(new Map());
  const blockGeom = useRef<THREE.BoxGeometry>(new THREE.BoxGeometry(1, 1, 1));

  // Initialize Material for block
  const getBlockMaterial = useCallback((typeId: string): THREE.Material => {
    if (materialsCache.current.has(typeId)) {
      return materialsCache.current.get(typeId)!;
    }

    const info = BLOCK_PALETTE.find(b => b.id === typeId) || BLOCK_PALETTE[0];
    const mat = new THREE.MeshStandardMaterial({
      color: info.color,
      roughness: info.roughness,
      emissive: info.emissive || 0x000000,
      emissiveIntensity: info.emissive ? 0.8 : 0,
      transparent: info.transparent || false,
      opacity: info.opacity !== undefined ? info.opacity : 1.0,
      flatShading: true,
    });

    materialsCache.current.set(typeId, mat);
    return mat;
  }, []);

  // Check touch capability on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(isTouch);
    }
  }, []);

  // Sync player spawn point whenever landmark changes
  useEffect(() => {
    const spawn = getDefaultSpawnPoint(currentLandmark);
    playerPos.current.set(spawn.x, spawn.y, spawn.z);
    playerVelocity.current.set(0, 0, 0);
    cameraYaw.current = spawn.yaw;
    cameraPitch.current = spawn.pitch;
    setCurrentSpawnPoint(spawn);
    setCoordsHUD({
      x: Math.round(spawn.x),
      y: Math.round(spawn.y),
      z: Math.round(spawn.z),
      fps: 60
    });
  }, [currentLandmark]);

  // Teleport to chosen spawn point
  const teleportToSpawnPoint = (sp: SpawnPoint) => {
    playerPos.current.set(sp.x, sp.y, sp.z);
    playerVelocity.current.set(0, 0, 0);
    cameraYaw.current = sp.yaw;
    cameraPitch.current = sp.pitch;
    setCurrentSpawnPoint(sp);
    setCoordsHUD(prev => ({
      ...prev,
      x: Math.round(sp.x),
      y: Math.round(sp.y),
      z: Math.round(sp.z)
    }));
    soundEngine.playTeleport();
  };

  const teleportRandomSpawn = () => {
    const sp = getRandomSpawnPoint(currentLandmark);
    teleportToSpawnPoint(sp);
  };

  // Cycle camera perspectives: 1st -> 3rd Back -> 3rd Front
  const cycleCameraMode = () => {
    soundEngine.playClick();
    setCameraMode(prev => {
      if (prev === 'first_person') return 'third_person_back';
      if (prev === 'third_person_back') return 'third_person_front';
      return 'first_person';
    });
  };

  // Update weather state regularly
  useEffect(() => {
    const checkWeather = () => {
      const current = weatherSeasonService.getCurrentState();
      setWeatherState(current);
      soundEngine.setRainActive(current.weather === 'rain' || current.weather === 'thunder');
    };
    checkWeather();
    const interval = window.setInterval(checkWeather, 15000);
    return () => clearInterval(interval);
  }, []);

  // Procedural Landmark Generator
  const generateLandmark = useCallback((landmark: Landmark, scene: THREE.Scene) => {
    // Clear previous blocks
    blocksMapRef.current.forEach(({ mesh }) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
    });
    blocksMapRef.current.clear();

    const addBlock = (x: number, y: number, z: number, type: string) => {
      const key = `${x},${y},${z}`;
      if (blocksMapRef.current.has(key)) return;

      const mat = getBlockMaterial(type);
      const mesh = new THREE.Mesh(blockGeom.current, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      blocksMapRef.current.set(key, { x, y, z, type, mesh });
    };

    // Ground Bedrock & Grass Plaza
    const groundRadius = 32;
    for (let x = -groundRadius; x <= groundRadius; x++) {
      for (let z = -groundRadius; z <= groundRadius; z++) {
        if (x * x + z * z <= groundRadius * groundRadius) {
          const groundBlock = (landmark.id === 'giza_pyramid' || landmark.category === 'Ancient Monument') ? 'sandstone' :
            (landmark.id === 'north_pole_xmas' ? 'quartz' :
            (landmark.id === 'times_square' ? 'stone' :
            (landmark.id === 'halloween_cemetery' ? 'grass' :
            (landmark.id === 'mount_calvary_holy_week' ? 'sandstone' : 'grass'))));
          addBlock(x, 0, z, groundBlock);
        }
      }
    }

    // Specific landmark architecture builders
    switch (landmark.id) {
      // 1. Holy Week Mount Calvary / Golgotha with the 3 Crosses
      case 'mount_calvary_holy_week': {
        // High rocky hill of Calvary
        for (let y = 1; y <= 7; y++) {
          const r = Math.max(2, 16 - y * 2);
          for (let x = -r; x <= r; x++) {
            for (let z = -r; z <= r; z++) {
              if (x * x + z * z <= r * r + (Math.sin(x * 0.5) * 2)) {
                addBlock(x, y, z, y % 2 === 0 ? 'stone' : 'cobblestone');
              }
            }
          }
        }

        // The 3 Crosses on Mount Calvary
        // Center Cross: Lord Jesus Christ
        for (let y = 8; y <= 16; y++) {
          addBlock(0, y, 0, 'oak_planks');
        }
        for (let x = -3; x <= 3; x++) {
          addBlock(x, 14, 0, 'oak_planks');
        }
        // Divine Halo / Golden Crown atop Center Cross
        addBlock(0, 17, 0, 'gold_block');
        addBlock(0, 18, 0, 'glowstone');

        // Left Cross: The Penitent Thief (St. Dismas)
        for (let y = 8; y <= 13; y++) {
          addBlock(-6, y, 0, 'oak_planks');
        }
        for (let x = -8; x <= -4; x++) {
          addBlock(x, 12, 0, 'oak_planks');
        }

        // Right Cross: The Unrepentant Thief (Gestas)
        for (let y = 8; y <= 13; y++) {
          addBlock(6, y, 0, 'oak_planks');
        }
        for (let x = 4; x <= 8; x++) {
          addBlock(x, 12, 0, 'oak_planks');
        }

        // Garden Tomb with Stone Rolled Away
        for (let y = 1; y <= 4; y++) {
          for (let z = 8; z <= 13; z++) {
            addBlock(10, y, z, 'stone');
            addBlock(14, y, z, 'stone');
            addBlock(12, 4, z, 'stone');
          }
        }
        // Rolled Stone
        addBlock(9, 1, 10, 'cobblestone');
        addBlock(9, 2, 10, 'cobblestone');
        addBlock(9, 1, 11, 'cobblestone');
        addBlock(9, 2, 11, 'cobblestone');

        // Olive Trees around hillside
        const treeCoords = [[-12, -8], [12, -8], [-10, 8], [-14, 0]];
        treeCoords.forEach(([tx, tz]) => {
          for (let ty = 1; ty <= 4; ty++) addBlock(tx, ty, tz, 'oak_planks');
          for (let lx = -2; lx <= 2; lx++) {
            for (let lz = -2; lz <= 2; lz++) {
              for (let ly = 4; ly <= 6; ly++) {
                if (Math.abs(lx) + Math.abs(lz) <= 3) addBlock(tx + lx, ly, tz + lz, 'oak_leaves');
              }
            }
          }
        });
        break;
      }

      // 2. North Pole Christmas Winter Workshop & 25m Tree
      case 'north_pole_xmas': {
        // Towering 25m Decorated Christmas Tree
        for (let y = 1; y <= 24; y++) {
          addBlock(0, y, 0, 'oak_planks');
          const layerR = Math.max(1, Math.floor((26 - y) * 0.35));
          if (y >= 4) {
            for (let x = -layerR; x <= layerR; x++) {
              for (let z = -layerR; z <= layerR; z++) {
                if (x * x + z * z <= layerR * layerR) {
                  const isBauble = (x + y + z) % 7 === 0;
                  addBlock(x, y, z, isBauble ? 'redstone_lamp' : (y % 4 === 0 ? 'diamond_block' : 'oak_leaves'));
                }
              }
            }
          }
        }
        // Glowing Star of Bethlehem Apex
        addBlock(0, 25, 0, 'gold_block');
        addBlock(0, 26, 0, 'glowstone');

        // Gift Present Voxels under tree
        const gifts = [
          [-3, 1, -3, 'gold_block'], [-2, 1, -4, 'diamond_block'],
          [3, 1, 3, 'redstone_lamp'], [2, 1, 4, 'tnt'],
          [-3, 1, 2, 'quartz'], [4, 1, -2, 'gold_block']
        ];
        gifts.forEach(([gx, gy, gz, gt]) => addBlock(Number(gx), Number(gy), Number(gz), String(gt)));

        // Santa's Log Workshop Cabin
        for (let y = 1; y <= 6; y++) {
          for (let x = 10; x <= 18; x++) {
            for (let z = -4; z <= 4; z++) {
              if (x === 10 || x === 18 || z === -4 || z === 4) {
                if (!(x === 10 && z === 0 && y <= 3)) { // Doorway
                  addBlock(x, y, z, y % 2 === 0 ? 'oak_planks' : 'bricks');
                }
              }
            }
          }
        }
        // Cabin Roof & Fireplace Chimney
        for (let rx = 9; rx <= 19; rx++) {
          for (let rz = -5; rz <= 5; rz++) {
            addBlock(rx, 7, rz, 'quartz');
          }
        }
        for (let cy = 7; cy <= 10; cy++) addBlock(16, cy, 3, 'bricks');
        addBlock(16, 11, 3, 'glowstone'); // Chimney smoke/fire glow
        break;
      }

      // 3. New Year Celebration: Tokyo Shinto Shrine, Torii Gate & Fireworks
      case 'japan_new_year': {
        // Monumental Vermilion Red Torii Gate
        for (let y = 1; y <= 14; y++) {
          addBlock(-6, y, 0, 'redstone_lamp');
          addBlock(6, y, 0, 'redstone_lamp');
        }
        // Crossbeams
        for (let x = -8; x <= 8; x++) {
          addBlock(x, 11, 0, 'redstone_lamp');
          addBlock(x, 14, 0, 'obsidian'); // Top black beam
          addBlock(x, 15, 0, 'obsidian');
        }
        addBlock(0, 12, 0, 'gold_block'); // Shinto plaque

        // Pagoda Shrine in background
        for (let y = 1; y <= 16; y++) {
          const w = y > 12 ? 3 : (y > 8 ? 5 : 7);
          for (let x = 12; x <= 12 + w; x++) {
            for (let z = -w / 2; z <= w / 2; z++) {
              if (x === 12 || x === 12 + w || Math.abs(z) === Math.floor(w / 2)) {
                addBlock(x, y, Math.round(z), y % 4 === 0 ? 'gold_block' : 'oak_planks');
              }
            }
          }
        }

        // Cherry Blossom (Sakura) Trees
        const sakuraCoords = [[-10, -8], [-10, 8], [4, -10], [4, 10]];
        sakuraCoords.forEach(([sx, sz]) => {
          for (let sy = 1; sy <= 5; sy++) addBlock(sx, sy, sz, 'oak_planks');
          for (let lx = -3; lx <= 3; lx++) {
            for (let lz = -3; lz <= 3; lz++) {
              for (let ly = 5; ly <= 8; ly++) {
                if (Math.abs(lx) + Math.abs(lz) <= 4) addBlock(sx + lx, ly, sz + lz, 'redstone_lamp');
              }
            }
          }
        });
        break;
      }

      // 4. Valentine's Day: Paris Love Locks Bridge & Glowing Hearts
      case 'paris_valentines': {
        // Seine River Water Channel
        for (let x = -24; x <= 24; x++) {
          for (let z = -5; z <= 5; z++) {
            addBlock(x, 0, z, 'water');
          }
        }
        // Pont des Arts Wooden Pedestrian Bridge
        for (let z = -7; z <= 7; z++) {
          for (let x = -4; x <= 4; x++) {
            addBlock(x, 1, z, 'oak_planks');
            if (x === -4 || x === 4) {
              addBlock(x, 2, z, 'gold_block'); // Love locks railing
            }
          }
        }
        // Monumental Sculpted Glowing Heart
        const heartPoints = [
          [-2, 6, 0], [-1, 7, 0], [0, 7, 0], [1, 7, 0], [2, 6, 0],
          [-3, 8, 0], [-2, 9, 0], [-1, 9, 0], [0, 8, 0], [1, 9, 0], [2, 9, 0], [3, 8, 0]
        ];
        heartPoints.forEach(([hx, hy, hz]) => {
          addBlock(hx, hy, hz, 'redstone_lamp');
          addBlock(hx, hy, hz + 1, 'gold_block');
        });
        break;
      }

      // 5. Halloween Gothic Cemetery & Haunted Crypt
      case 'halloween_cemetery': {
        // Stone Mausoleum Crypt
        for (let y = 1; y <= 7; y++) {
          for (let x = -5; x <= 5; x++) {
            for (let z = -14; z <= -6; z++) {
              if (Math.abs(x) === 5 || z === -14 || z === -6) {
                if (!(z === -6 && Math.abs(x) <= 1 && y <= 4)) {
                  addBlock(x, y, z, y % 2 === 0 ? 'cobblestone' : 'stone');
                }
              }
            }
          }
        }
        // Crypt roof
        for (let x = -6; x <= 6; x++) {
          for (let z = -15; z <= -5; z++) {
            addBlock(x, 8, z, 'obsidian');
          }
        }

        // Weathered Tombstones & Crosses
        const graves = [
          [-8, -2], [-8, 4], [-4, 2], [-4, 6],
          [4, -2], [4, 4], [8, 2], [8, 6]
        ];
        graves.forEach(([gx, gz], idx) => {
          addBlock(gx, 1, gz, 'cobblestone');
          addBlock(gx, 2, gz, 'stone');
          if (idx % 2 === 0) {
            addBlock(gx, 3, gz, 'stone');
            addBlock(gx - 1, 3, gz, 'stone');
            addBlock(gx + 1, 3, gz, 'stone');
          }
          // Glowing Jack-o'-Lantern beside tombstone
          addBlock(gx + 1, 1, gz + 1, 'glowstone');
        });
        break;
      }

      // 6. Times Square Manhattan NYC
      case 'times_square': {
        // Broadway / 7th Ave Asphalt
        for (let x = -8; x <= 8; x++) {
          for (let z = -25; z <= 25; z++) {
            addBlock(x, 0, z, (Math.abs(x) <= 3 && z % 4 === 0) ? 'gold_block' : 'stone');
          }
        }

        // West Skyscraper with Neon Billboards
        for (let y = 1; y <= 35; y++) {
          for (let x = -16; x <= -9; x++) {
            for (let z = -12; z <= 12; z++) {
              if (x === -9 || x === -16 || z === -12 || z === 12) {
                // High-Luminosity Billboard Screens
                const isBillboard = (x === -9 && y >= 6 && y <= 28 && Math.abs(z) <= 10);
                const blockChoice = isBillboard ?
                  ((y + z) % 3 === 0 ? 'glowstone' : ((y + z) % 3 === 1 ? 'redstone_lamp' : 'diamond_block')) :
                  (y % 3 === 0 ? 'quartz' : 'glass');
                addBlock(x, y, z, blockChoice);
              }
            }
          }
        }

        // East Skyscraper with Neon Billboards
        for (let y = 1; y <= 38; y++) {
          for (let x = 9; x <= 16; x++) {
            for (let z = -12; z <= 12; z++) {
              if (x === 9 || x === 16 || z === -12 || z === 12) {
                const isBillboard = (x === 9 && y >= 8 && y <= 30 && Math.abs(z) <= 10);
                const blockChoice = isBillboard ?
                  ((y + z) % 2 === 0 ? 'redstone_lamp' : 'glowstone') :
                  (y % 2 === 0 ? 'quartz' : 'glass');
                addBlock(x, y, z, blockChoice);
              }
            }
          }
        }

        // TKTS Red Glass Observation Grandstand
        for (let y = 1; y <= 8; y++) {
          const zStart = 10 + y * 2;
          for (let x = -4; x <= 4; x++) {
            addBlock(x, y, zStart, 'redstone_lamp');
          }
        }
        break;
      }

      // Eiffel Tower Default
      case 'eiffel_tower':
      default: {
        const baseRadius = 14;
        const pillars = [
          [-baseRadius, -baseRadius],
          [baseRadius, -baseRadius],
          [-baseRadius, baseRadius],
          [baseRadius, baseRadius]
        ];

        pillars.forEach(([px, pz]) => {
          for (let y = 1; y <= 8; y++) {
            const shift = y * 0.6;
            const x = px > 0 ? px - shift : px + shift;
            const z = pz > 0 ? pz - shift : pz + shift;
            addBlock(Math.round(x), y, Math.round(z), 'cobblestone');
            addBlock(Math.round(x) + 1, y, Math.round(z), 'stone');
            addBlock(Math.round(x), y, Math.round(z) + 1, 'stone');
          }
        });

        // 1st Platform
        for (let px = -9; px <= 9; px++) {
          for (let pz = -9; pz <= 9; pz++) {
            if (Math.abs(px) === 9 || Math.abs(pz) === 9 || Math.abs(px) <= 2 || Math.abs(pz) <= 2) {
              addBlock(px, 9, pz, 'quartz');
            }
          }
        }

        // 2nd Platform
        for (let px = -4; px <= 4; px++) {
          for (let pz = -4; pz <= 4; pz++) {
            addBlock(px, 16, pz, 'quartz');
          }
        }

        // Towering Spire
        for (let y = 17; y <= 35; y++) {
          addBlock(0, y, 0, y % 2 === 0 ? 'stone' : 'cobblestone');
          if (y % 4 === 0) {
            addBlock(1, y, 0, 'quartz');
            addBlock(-1, y, 0, 'quartz');
            addBlock(0, y, 1, 'quartz');
            addBlock(0, y, -1, 'quartz');
          }
        }
        // Glowing Beacon
        addBlock(0, 36, 0, 'glowstone');
        addBlock(0, 37, 0, 'diamond_block');
        break;
      }
    }

    // Reset player spawn position above ground
    playerPos.current.set(0, 15, 25);
    cameraYaw.current = Math.PI;
  }, [getBlockMaterial]);

  // Create Avatar Mesh (3rd person)
  const createAvatarMesh = useCallback((skin: MinecraftSkin): THREE.Group => {
    const group = new THREE.Group();
    const hex = (col: string) => parseInt(col.replace('#', '0x'), 16);

    // Head
    const headGeom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMat = new THREE.MeshStandardMaterial({ color: hex(skin.headColor), roughness: 0.8, flatShading: true });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = 1.6;
    head.castShadow = true;
    group.add(head);

    // Eyes
    const eyeGeom = new THREE.BoxGeometry(0.12, 0.08, 0.02);
    const eyeMat = new THREE.MeshBasicMaterial({ color: hex(skin.eyeColor) });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.2, 1.6, 0.41);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.2, 1.6, 0.41);
    group.add(leftEye, rightEye);

    // Torso
    const torsoGeom = new THREE.BoxGeometry(0.8, 0.85, 0.45);
    const torsoMat = new THREE.MeshStandardMaterial({ color: hex(skin.bodyColor), roughness: 0.8, flatShading: true });
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = 0.85;
    torso.castShadow = true;
    group.add(torso);

    // Arms
    const armGeom = new THREE.BoxGeometry(0.35, 0.8, 0.35);
    const armMat = new THREE.MeshStandardMaterial({ color: hex(skin.armsColor), roughness: 0.8, flatShading: true });
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.6, 0.85, 0);
    leftArm.castShadow = true;

    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.6, 0.85, 0);
    rightArm.castShadow = true;
    group.add(leftArm, rightArm);

    // Legs
    const legGeom = new THREE.BoxGeometry(0.35, 0.85, 0.35);
    const legMat = new THREE.MeshStandardMaterial({ color: hex(skin.legsColor), roughness: 0.8, flatShading: true });
    const leftLeg = new THREE.Mesh(legGeom, legMat);
    leftLeg.position.set(-0.2, 0.42, 0);
    leftLeg.castShadow = true;

    const rightLeg = new THREE.Mesh(legGeom, legMat);
    rightLeg.position.set(0.2, 0.42, 0);
    rightLeg.castShadow = true;
    group.add(leftLeg, rightLeg);

    // Cape
    let capeMesh: THREE.Mesh | undefined;
    if (skin.hasCape && skin.capeColor) {
      const capeGeom = new THREE.BoxGeometry(0.7, 1.1, 0.05);
      const capeMat = new THREE.MeshStandardMaterial({ color: hex(skin.capeColor), roughness: 0.5 });
      capeMesh = new THREE.Mesh(capeGeom, capeMat);
      capeMesh.position.set(0, 0.8, -0.28);
      capeMesh.rotation.x = 0.15;
      group.add(capeMesh);
    }

    avatarPartsRef.current = {
      head,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      cape: capeMesh
    };

    return group;
  }, []);

  // Main Three.js Setup & Animation Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.012);

    // Camera
    const camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer with hardware optimization
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    hardwareOptimizer.applyToRenderer(renderer);
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    sunLight.position.set(40, 70, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Highlight wireframe box for targeted block
    const wireGeom = new THREE.EdgesGeometry(blockGeom.current);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const highlightBox = new THREE.LineSegments(wireGeom, wireMat);
    highlightBox.visible = false;
    scene.add(highlightBox);
    highlightBoxRef.current = highlightBox;

    // Avatar mesh for 3rd person
    const avatar = createAvatarMesh(currentSkin);
    avatar.visible = cameraMode !== 'first_person';
    scene.add(avatar);
    avatarMeshRef.current = avatar;

    // Weather Particle System (Rain / Snow / Leaves)
    const particleCount = 1200;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 80;
      particlePositions[i + 1] = Math.random() * 50;
      particlePositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x90caf9,
      size: 0.35,
      transparent: true,
      opacity: 0.75
    });
    const weatherParticles = new THREE.Points(particleGeom, particleMat);
    weatherParticles.visible = true;
    scene.add(weatherParticles);
    weatherParticlesRef.current = weatherParticles;

    // Procedural landmark generator
    generateLandmark(currentLandmark, scene);

    // BroadcastChannel for cross-tab multiplayer sync
    try {
      broadcastChannelRef.current = new BroadcastChannel('google_craft_voxel_network');
      broadcastChannelRef.current.onmessage = (e) => {
        const data = e.data;
        if (data.type === 'block_placed') {
          const { x, y, z, blockType } = data;
          const key = `${x},${y},${z}`;
          if (!blocksMapRef.current.has(key)) {
            const mat = getBlockMaterial(blockType);
            const mesh = new THREE.Mesh(blockGeom.current, mat);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            blocksMapRef.current.set(key, { x, y, z, type: blockType, mesh });
          }
        } else if (data.type === 'block_broken') {
          const { x, y, z } = data;
          const key = `${x},${y},${z}`;
          const existing = blocksMapRef.current.get(key);
          if (existing) {
            scene.remove(existing.mesh);
            existing.mesh.geometry.dispose();
            blocksMapRef.current.delete(key);
          }
        }
      };
    } catch (_) {}

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let walkCycle = 0;
    let lastTime = performance.now();
    let fireworkTimer = 0;

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Telemetry benchmark
      const frameData = hardwareOptimizer.recordFrame();

      // Keyboard movement
      const moveSpeed = isFlying ? 18 * delta : 8.5 * delta;
      const forward = (keysPressed.current['KeyW'] ? 1 : 0) - (keysPressed.current['KeyS'] ? 1 : 0);
      const strafe = (keysPressed.current['KeyD'] ? 1 : 0) - (keysPressed.current['KeyA'] ? 1 : 0);
      const isMoving = forward !== 0 || strafe !== 0;

      if (isMoving) {
        const sinYaw = Math.sin(cameraYaw.current);
        const cosYaw = Math.cos(cameraYaw.current);

        playerPos.current.x += (forward * sinYaw + strafe * cosYaw) * moveSpeed;
        playerPos.current.z += (forward * cosYaw - strafe * sinYaw) * moveSpeed;

        if (!isFlying) {
          walkCycle += delta * 12;
          if (Math.sin(walkCycle) > 0.95 && Math.sin(walkCycle - delta * 12) <= 0.95) {
            soundEngine.playStep('grass');
          }
        }
      }

      // Vertical movement & flying
      if (isFlying) {
        if (keysPressed.current['Space']) playerPos.current.y += moveSpeed;
        if (keysPressed.current['ShiftLeft'] || keysPressed.current['KeyC']) playerPos.current.y -= moveSpeed;
        playerPos.current.y = Math.max(1, playerPos.current.y);
      } else {
        if (keysPressed.current['Space'] && playerPos.current.y <= 1.05) {
          playerVelocity.current.y = 8.5;
          soundEngine.playJump();
        }
        playerVelocity.current.y -= 22 * delta; // Gravity
        playerPos.current.y += playerVelocity.current.y * delta;
        if (playerPos.current.y <= 1.0) {
          playerPos.current.y = 1.0;
          playerVelocity.current.y = 0;
        }
      }

      // Camera Perspective Rig
      const is3rdPerson = cameraMode !== 'first_person';
      if (avatarMeshRef.current) {
        avatarMeshRef.current.visible = is3rdPerson;
      }

      if (cameraMode === 'third_person_back') {
        // 3rd Person View (Trailing Camera Behind Player)
        const dist = 4.8;
        const cx = playerPos.current.x - Math.sin(cameraYaw.current) * dist * Math.cos(cameraPitch.current);
        const cy = playerPos.current.y + 1.8 + Math.sin(cameraPitch.current) * dist;
        const cz = playerPos.current.z - Math.cos(cameraYaw.current) * dist * Math.cos(cameraPitch.current);
        camera.position.set(cx, cy, cz);
        camera.lookAt(playerPos.current.x, playerPos.current.y + 1.2, playerPos.current.z);

        if (avatarMeshRef.current) {
          avatarMeshRef.current.position.set(playerPos.current.x, playerPos.current.y, playerPos.current.z);
          avatarMeshRef.current.rotation.y = cameraYaw.current;

          // Limb animations
          if (avatarPartsRef.current) {
            const legSwing = Math.sin(walkCycle) * 0.6;
            avatarPartsRef.current.leftLeg.rotation.x = isMoving ? legSwing : 0;
            avatarPartsRef.current.rightLeg.rotation.x = isMoving ? -legSwing : 0;
            avatarPartsRef.current.leftArm.rotation.x = isMoving ? -legSwing : 0;
            avatarPartsRef.current.rightArm.rotation.x = isMoving ? legSwing : 0;
            avatarPartsRef.current.head.rotation.x = cameraPitch.current * 0.5;
          }
        }
      } else if (cameraMode === 'third_person_front') {
        // 3rd Person Front (Selfie View facing player)
        const dist = 4.2;
        const cx = playerPos.current.x + Math.sin(cameraYaw.current) * dist * Math.cos(cameraPitch.current);
        const cy = playerPos.current.y + 1.8 - Math.sin(cameraPitch.current) * dist;
        const cz = playerPos.current.z + Math.cos(cameraYaw.current) * dist * Math.cos(cameraPitch.current);
        camera.position.set(cx, cy, cz);
        camera.lookAt(playerPos.current.x, playerPos.current.y + 1.3, playerPos.current.z);

        if (avatarMeshRef.current) {
          avatarMeshRef.current.position.set(playerPos.current.x, playerPos.current.y, playerPos.current.z);
          avatarMeshRef.current.rotation.y = cameraYaw.current;

          // Limb animations
          if (avatarPartsRef.current) {
            const legSwing = Math.sin(walkCycle) * 0.6;
            avatarPartsRef.current.leftLeg.rotation.x = isMoving ? legSwing : 0;
            avatarPartsRef.current.rightLeg.rotation.x = isMoving ? -legSwing : 0;
            avatarPartsRef.current.leftArm.rotation.x = isMoving ? -legSwing : 0;
            avatarPartsRef.current.rightArm.rotation.x = isMoving ? legSwing : 0;
            avatarPartsRef.current.head.rotation.x = -cameraPitch.current * 0.5;
          }
        }
      } else {
        // 1st Person Perspective
        camera.position.set(playerPos.current.x, playerPos.current.y + 1.6, playerPos.current.z);
        const targetX = playerPos.current.x + Math.sin(cameraYaw.current) * Math.cos(cameraPitch.current);
        const targetY = playerPos.current.y + 1.6 + Math.sin(cameraPitch.current);
        const targetZ = playerPos.current.z + Math.cos(cameraYaw.current) * Math.cos(cameraPitch.current);
        camera.lookAt(targetX, targetY, targetZ);
      }

      // Weather Particles Animation
      if (weatherParticlesRef.current) {
        const positions = weatherParticlesRef.current.geometry.attributes.position.array as Float32Array;
        const activeWeather = weatherSeasonService.getCurrentState().weather;

        for (let i = 0; i < positions.length; i += 3) {
          if (activeWeather === 'rain' || activeWeather === 'thunder') {
            positions[i + 1] -= delta * 35; // Fast rain
          } else if (activeWeather === 'snow') {
            positions[i + 1] -= delta * 8; // Gentle snow
            positions[i] += Math.sin(time * 0.002 + i) * 0.05;
          } else if (activeWeather === 'autumn') {
            positions[i + 1] -= delta * 6; // Drifting autumn leaves
            positions[i] += Math.cos(time * 0.001 + i) * 0.08;
          } else {
            // Sunny / Starry
            positions[i + 1] -= delta * 2;
          }

          if (positions[i + 1] < 0) {
            positions[i + 1] = 45;
            positions[i] = playerPos.current.x + (Math.random() - 0.5) * 80;
            positions[i + 2] = playerPos.current.z + (Math.random() - 0.5) * 80;
          }
        }
        weatherParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // New Year Japan / Festive Fireworks
      if (currentLandmark.id === 'japan_new_year') {
        fireworkTimer += delta;
        if (fireworkTimer > 2.5) {
          fireworkTimer = 0;
          soundEngine.playFirework();
        }
      }

      // Raycast for target block
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const meshes: THREE.Mesh[] = [];
      blocksMapRef.current.forEach(({ mesh }) => meshes.push(mesh));
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0 && intersects[0].distance < 8) {
        const hit = intersects[0];
        const hitMesh = hit.object as THREE.Mesh;
        highlightBox.position.copy(hitMesh.position);
        highlightBox.visible = true;
        setCrosshairActive(true);

        const bx = Math.round(hitMesh.position.x);
        const by = Math.round(hitMesh.position.y);
        const bz = Math.round(hitMesh.position.z);
        const key = `${bx},${by},${bz}`;
        const blockData = blocksMapRef.current.get(key);

        if (blockData) {
          setHoveredBlockType(blockData.type);
          setHoveredBlockCoords({ x: bx, y: by, z: bz });
          const arch = getVoxelArchitecturalInfo(currentLandmark, blockData.type, bx, by, bz);
          setHoveredArchInfo(arch);
        }

        if (isMining.current) {
          miningProgress.current += delta;
          if (miningProgress.current >= 0.35) {
            // Break block
            scene.remove(hitMesh);
            hitMesh.geometry.dispose();
            blocksMapRef.current.delete(key);
            highlightBox.visible = false;
            setHoveredArchInfo(null);
            soundEngine.playBreak(blockData?.type || 'stone');
            if (onBlockBroken) onBlockBroken();

            try {
              broadcastChannelRef.current?.postMessage({
                type: 'block_broken',
                x: bx,
                y: by,
                z: bz
              });
            } catch (_) {}

            miningProgress.current = 0;
            isMining.current = false;
          }
        }
      } else {
        highlightBox.visible = false;
        setCrosshairActive(false);
        setHoveredArchInfo(null);
      }

      // Update HUD Coordinates
      setCoordsHUD({
        x: Math.round(playerPos.current.x),
        y: Math.round(playerPos.current.y),
        z: Math.round(playerPos.current.z),
        fps: frameData.fps
      });

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      // Hotbar 1-9
      if (e.code >= 'Digit1' && e.code <= 'Digit9') {
        const slot = parseInt(e.code.replace('Digit', ''), 10) - 1;
        setSelectedBlockIdx(slot);
        soundEngine.playClick();
      }
      if (e.code === 'KeyF') {
        setIsFlying(prev => !prev);
        soundEngine.playClick();
      }
      if (e.code === 'F5' || e.code === 'KeyV') {
        e.preventDefault();
        cycleCameraMode();
      }
      if (e.code === 'KeyE') {
        if (onOpenInventory) onOpenInventory();
      }
      if (e.code === 'KeyM') {
        if (onToggleMap) onToggleMap();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    // Pointer Lock & Mouse Listeners
    const handleMouseDown = (e: MouseEvent) => {
      if (!isPointerLocked.current) {
        container.requestPointerLock?.();
        isPointerLocked.current = true;
        return;
      }

      // Left Click = Mine / Break
      if (e.button === 0) {
        isMining.current = true;
        miningProgress.current = 0;
      }
      // Right Click = Place Block
      else if (e.button === 2) {
        e.preventDefault();
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const meshes: THREE.Mesh[] = [];
        blocksMapRef.current.forEach(({ mesh }) => meshes.push(mesh));
        const intersects = raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0 && intersects[0].distance < 8 && intersects[0].face) {
          const hit = intersects[0];
          const normal = hit.face.normal;
          const newX = Math.round(hit.object.position.x + normal.x);
          const newY = Math.round(hit.object.position.y + normal.y);
          const newZ = Math.round(hit.object.position.z + normal.z);
          const newKey = `${newX},${newY},${newZ}`;

          if (!blocksMapRef.current.has(newKey)) {
            const blockType = BLOCK_PALETTE[selectedBlockIdx]?.id || 'stone';
            const mat = getBlockMaterial(blockType);
            const mesh = new THREE.Mesh(blockGeom.current, mat);
            mesh.position.set(newX, newY, newZ);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            blocksMapRef.current.set(newKey, { x: newX, y: newY, z: newZ, type: blockType, mesh });
            soundEngine.playPlace(blockType);
            if (onBlockPlaced) onBlockPlaced();

            try {
              broadcastChannelRef.current?.postMessage({
                type: 'block_placed',
                x: newX,
                y: newY,
                z: newZ,
                blockType
              });
            } catch (_) {}
          }
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isMining.current = false;
        miningProgress.current = 0;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;
      const sensitivity = 0.0025;
      cameraYaw.current += e.movementX * sensitivity;
      cameraPitch.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, cameraPitch.current - e.movementY * sensitivity));
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('contextmenu', handleContextMenu);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('contextmenu', handleContextMenu);
      try {
        broadcastChannelRef.current?.close();
      } catch (_) {}
    };
  }, [currentLandmark, currentSkin, generateLandmark, getBlockMaterial, createAvatarMesh, isFlying, cameraMode, selectedBlockIdx, onBlockBroken, onBlockPlaced, onOpenInventory, onToggleMap]);

  // Mobile Touch Movement Handler
  const handleTouchMove = (forward: number, strafe: number) => {
    const moveSpeed = 0.18;
    const sinYaw = Math.sin(cameraYaw.current);
    const cosYaw = Math.cos(cameraYaw.current);

    playerPos.current.x += (forward * sinYaw + strafe * cosYaw) * moveSpeed;
    playerPos.current.z += (forward * cosYaw - strafe * sinYaw) * moveSpeed;
  };

  const handleTouchLook = (deltaYaw: number, deltaPitch: number) => {
    cameraYaw.current += deltaYaw;
    cameraPitch.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, cameraPitch.current - deltaPitch));
  };

  const handleTouchJump = () => {
    if (isFlying) {
      playerPos.current.y += 1.5;
    } else if (playerPos.current.y <= 1.05) {
      playerVelocity.current.y = 8.5;
      soundEngine.playJump();
    }
  };

  const handleTouchBreakBlock = () => {
    if (!sceneRef.current || !cameraRef.current) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), cameraRef.current);
    const meshes: THREE.Mesh[] = [];
    blocksMapRef.current.forEach(({ mesh }) => meshes.push(mesh));
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0 && intersects[0].distance < 8) {
      const hit = intersects[0];
      const hitMesh = hit.object as THREE.Mesh;
      const bx = Math.round(hitMesh.position.x);
      const by = Math.round(hitMesh.position.y);
      const bz = Math.round(hitMesh.position.z);
      const key = `${bx},${by},${bz}`;
      const blockData = blocksMapRef.current.get(key);

      sceneRef.current.remove(hitMesh);
      hitMesh.geometry.dispose();
      blocksMapRef.current.delete(key);
      soundEngine.playBreak(blockData?.type || 'stone');
      if (onBlockBroken) onBlockBroken();
    }
  };

  const handleTouchPlaceBlock = () => {
    if (!sceneRef.current || !cameraRef.current) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), cameraRef.current);
    const meshes: THREE.Mesh[] = [];
    blocksMapRef.current.forEach(({ mesh }) => meshes.push(mesh));
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0 && intersects[0].distance < 8 && intersects[0].face) {
      const hit = intersects[0];
      const normal = hit.face.normal;
      const newX = Math.round(hit.object.position.x + normal.x);
      const newY = Math.round(hit.object.position.y + normal.y);
      const newZ = Math.round(hit.object.position.z + normal.z);
      const newKey = `${newX},${newY},${newZ}`;

      if (!blocksMapRef.current.has(newKey)) {
        const blockType = BLOCK_PALETTE[selectedBlockIdx]?.id || 'stone';
        const mat = getBlockMaterial(blockType);
        const mesh = new THREE.Mesh(blockGeom.current, mat);
        mesh.position.set(newX, newY, newZ);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        sceneRef.current.add(mesh);
        blocksMapRef.current.set(newKey, { x: newX, y: newY, z: newZ, type: blockType, mesh });
        soundEngine.playPlace(blockType);
        if (onBlockPlaced) onBlockPlaced();
      }
    }
  };

  // Gamepad Controller Handler
  const handleGamepadInput = (inputs: {
    moveX: number;
    moveY: number;
    lookX: number;
    lookY: number;
    jump: boolean;
    crouch: boolean;
    breakBlock: boolean;
    placeBlock: boolean;
    toggleFly: boolean;
    inventory: boolean;
    cycleHotbar: number;
    toggleMap: boolean;
  }) => {
    // Movement via Left Stick
    if (inputs.moveX !== 0 || inputs.moveY !== 0) {
      const forward = -inputs.moveY;
      const strafe = inputs.moveX;
      handleTouchMove(forward, strafe);
    }

    // Look via Right Stick
    if (inputs.lookX !== 0 || inputs.lookY !== 0) {
      handleTouchLook(inputs.lookX * 0.04, inputs.lookY * 0.04);
    }

    // Buttons
    if (inputs.jump) handleTouchJump();
    if (inputs.breakBlock) handleTouchBreakBlock();
    if (inputs.placeBlock) handleTouchPlaceBlock();
    if (inputs.toggleFly) setIsFlying(prev => !prev);
    if (inputs.inventory && onOpenInventory) onOpenInventory();
    if (inputs.toggleMap && onToggleMap) onToggleMap();

    // Hotbar cycle with LB/RB
    if (inputs.cycleHotbar !== 0) {
      setSelectedBlockIdx(prev => {
        let next = prev + inputs.cycleHotbar;
        if (next < 0) next = 8;
        if (next > 8) next = 0;
        return next;
      });
      soundEngine.playClick();
    }
  };

  // Toggle Time of Day
  const toggleTimeOfDay = () => {
    soundEngine.playClick();
    const next = timeOfDay === 'day' ? 'sunset' : (timeOfDay === 'sunset' ? 'night' : 'day');
    setTimeOfDay(next);
    if (!sceneRef.current) return;

    if (next === 'day') {
      sceneRef.current.background = new THREE.Color(0x87ceeb);
      sceneRef.current.fog = new THREE.FogExp2(0x87ceeb, 0.012);
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0.7;
    } else if (next === 'sunset') {
      sceneRef.current.background = new THREE.Color(0xcc6633);
      sceneRef.current.fog = new THREE.FogExp2(0xbb5533, 0.015);
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0.55;
    } else {
      sceneRef.current.background = new THREE.Color(0x0a0c18);
      sceneRef.current.fog = new THREE.FogExp2(0x0a0c18, 0.02);
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0.35;
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden" id="voxel-viewport-container">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" id="threejs-canvas-stage" />

      {/* Minecraft Crosshair */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75 z-20 ${
          crosshairActive ? 'scale-125' : 'scale-100'
        }`}
        id="mc-screen-crosshair"
      >
        <div className="w-4 h-4 relative flex items-center justify-center">
          <div className="w-4 h-0.5 bg-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] absolute"></div>
          <div className="h-4 w-0.5 bg-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] absolute"></div>
        </div>
      </div>

      {/* TOP LEFT HUD: Non-overlapping, clean info dock */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-30 max-w-[280px]" id="hud-top-left">
        {/* Landmark & GPS Card */}
        <div className="bg-stone-900/85 backdrop-blur-md px-3 py-2 border border-stone-700/80 shadow-lg text-xs font-minecraft text-white/95 flex items-center gap-2.5">
          <span className="text-2xl">{currentLandmark.flag}</span>
          <div className="min-w-0">
            <div className="text-amber-400 font-bold uppercase truncate">{currentLandmark.name}</div>
            <div className="text-[10px] text-stone-300 font-pixel truncate">
              {currentLandmark.lat.toFixed(3)}°N, {currentLandmark.lng.toFixed(3)}°E • Alt: {currentLandmark.altitudeMeters}m
            </div>
          </div>
        </div>

        {/* F3 Telemetry & Refresh Rate Card */}
        <div className="bg-black/70 backdrop-blur-sm px-2.5 py-1.5 border border-stone-800 text-[10px] font-pixel text-stone-200 space-y-0.5">
          <div className="flex justify-between">
            <span>XYZ: <span className="text-emerald-400 font-minecraft">{coordsHUD.x} / {coordsHUD.y} / {coordsHUD.z}</span></span>
            <span className="text-green-400 font-minecraft font-bold">{coordsHUD.fps} FPS</span>
          </div>
          <div className="flex justify-between text-[9px] text-stone-400">
            <span>Season: <span className="text-amber-300">{weatherState.seasonIcon} {weatherState.season}</span></span>
            <span>Weather: <span className="text-cyan-300">{weatherState.weatherIcon} {weatherState.weather}</span></span>
          </div>
        </div>
      </div>

      {/* TOP RIGHT ACTION BAR: Spacious, non-overlapping controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-30 pointer-events-auto" id="hud-top-right">
        {/* Spawn Points & Scenic Overlooks */}
        <button
          onClick={() => {
            soundEngine.playClick();
            setShowSpawnModal(true);
          }}
          className="mc-btn px-2.5 py-1.5 text-[10px] flex items-center gap-1 cursor-pointer text-amber-300 font-bold"
          title="Choose Scenic Spawn Viewpoint"
          id="btn-hud-spawn-points"
        >
          📍 {currentSpawnPoint ? currentSpawnPoint.name.split(' ')[0] : 'Spawns'}
        </button>

        {/* Celebrations & Holidays */}
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenOccasions) onOpenOccasions();
          }}
          className="mc-btn px-2.5 py-1.5 text-[10px] flex items-center gap-1 cursor-pointer text-amber-300 font-bold"
          title="Celebration & Holiday Teleporter"
          id="btn-hud-occasions"
        >
          🎉 Holidays
        </button>

        {/* Weather & Seasons */}
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenWeather) onOpenWeather();
          }}
          className="mc-btn px-2.5 py-1.5 text-[10px] flex items-center gap-1 cursor-pointer text-cyan-300"
          title="Timezone Weather & Season"
          id="btn-hud-weather"
        >
          {weatherState.weatherIcon} Weather
        </button>

        {/* CPU/GPU 1000 FPS Optimizer */}
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenPerformance) onOpenPerformance();
          }}
          className="mc-btn px-2.5 py-1.5 text-[10px] flex items-center gap-1 cursor-pointer text-emerald-300"
          title="CPU & GPU Performance Settings"
          id="btn-hud-performance"
        >
          ⚡ 1000 FPS
        </button>

        {/* Time of Day Toggle */}
        <button
          onClick={toggleTimeOfDay}
          className="mc-btn px-2.5 py-1.5 text-[10px] flex items-center gap-1 cursor-pointer"
          title="Toggle Time of Day"
          id="btn-toggle-time"
        >
          {timeOfDay === 'day' ? '☀️' : (timeOfDay === 'sunset' ? '🌅' : '🌙')}
        </button>

        {/* 3-Mode Perspective (F5 / V) */}
        <button
          onClick={cycleCameraMode}
          className={`mc-btn px-2.5 py-1.5 text-[10px] flex items-center gap-1 cursor-pointer transition-all ${
            cameraMode !== 'first_person' ? 'text-purple-300 font-bold border-purple-400' : ''
          }`}
          title="Toggle Perspective: 1st Person / 3rd Person Back / 3rd Person Front Selfie (F5 or V)"
          id="btn-toggle-perspective"
        >
          {cameraMode === 'first_person' ? '📷 1st' : (cameraMode === 'third_person_back' ? '🎥 3rd Back' : '🤳 3rd Front')}
        </button>

        {/* Flight Mode */}
        <button
          onClick={() => {
            soundEngine.playClick();
            setIsFlying(prev => !prev);
          }}
          className={`mc-btn px-2.5 py-1.5 text-[10px] flex items-center gap-1 cursor-pointer ${
            isFlying ? 'text-amber-300 font-bold' : ''
          }`}
          title="Toggle Flight (F)"
          id="btn-toggle-flight"
        >
          🪽 {isFlying ? 'Fly' : 'Walk'}
        </button>

        {/* Developer Credits (Mark David V. Valmores) */}
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenCredits) {
              onOpenCredits();
            } else {
              setShowCreditsModal(true);
            }
          }}
          className="mc-btn px-2 py-1.5 text-[10px] flex items-center gap-1 cursor-pointer text-amber-200"
          title="Solo Developer Credits (Mark David V. Valmores)"
          id="btn-hud-credits"
        >
          👨‍💻 Credits
        </button>
      </div>

      {/* BOTTOM CENTER: Minecraft Hotbar (Slots 1-9) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 p-1 bg-stone-900/90 border-2 border-stone-600 shadow-2xl z-30 pointer-events-auto" id="mc-hotbar-container">
        {BLOCK_PALETTE.slice(0, 9).map((block, idx) => {
          const isSelected = idx === selectedBlockIdx;
          return (
            <button
              key={block.id}
              onClick={() => {
                setSelectedBlockIdx(idx);
                soundEngine.playClick();
              }}
              className={`relative w-10 h-10 sm:w-11 sm:h-11 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'border-2 border-white bg-stone-700/90 scale-105 shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                  : 'border border-stone-700 bg-stone-800/80 hover:bg-stone-750'
              }`}
              id={`hotbar-slot-${idx}`}
              title={`${idx + 1}: ${block.name}`}
            >
              <span className="text-lg sm:text-xl select-none">{block.icon}</span>
              <span className="absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-minecraft text-stone-400">
                {idx + 1}
              </span>
            </button>
          );
        })}

        {/* Inventory button (E) */}
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenInventory) onOpenInventory();
          }}
          className="w-10 h-10 sm:w-11 sm:h-11 border border-stone-600 bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-[10px] sm:text-xs font-minecraft text-amber-300 cursor-pointer"
          title="Open Palette (E)"
          id="btn-open-palette"
        >
          🎒 [E]
        </button>
      </div>

      {/* Floating Instructions / Controls Tip */}
      <div className="hidden md:block absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/65 px-3 py-1 text-[11px] font-pixel text-stone-300 pointer-events-none rounded border border-stone-800/80 z-20" id="mc-controls-hint">
        [Click Screen to Look] • Left Click: Mine • Right Click: Place • WASD: Move • Space: Jump • F: Fly • E: Inventory • M: Maps
      </div>

      {/* Gamepad Controller Support Widget */}
      <GamepadControllerHUD onGamepadInput={handleGamepadInput} />

      {/* Mobile Screen Touch Controls (for iPhone, iPad & Android devices) */}
      {isTouchDevice && (
        <MobileTouchControls
          onMove={handleTouchMove}
          onLook={handleTouchLook}
          onJump={handleTouchJump}
          onCrouch={() => {}}
          onFlyToggle={() => setIsFlying(prev => !prev)}
          onBreakBlock={handleTouchBreakBlock}
          onPlaceBlock={handleTouchPlaceBlock}
          onOpenInventory={() => {
            if (onOpenInventory) onOpenInventory();
          }}
          onTogglePerspective={cycleCameraMode}
          onToggleMap={() => {
            if (onToggleMap) onToggleMap();
          }}
          isFlying={isFlying}
          cameraMode={cameraMode}
        />
      )}

      {/* Dynamic Architectural Tooltip on Voxel Hover */}
      <VoxelTooltipHUD
        info={hoveredArchInfo}
        blockType={hoveredBlockType}
        blockCoords={hoveredBlockCoords}
      />

      {/* Google Maps Mini-Map HUD (Bottom-Right Corner) */}
      <MiniMapHUD
        landmark={currentLandmark}
        playerPos={coordsHUD}
        cameraYaw={cameraYaw.current}
        isFlying={isFlying}
        currentChunk={currentChunk}
        loadedChunksCount={loadedChunksCount}
        memorySavedMb={memorySavedMb}
      />

      {/* Spawn Points Selector Modal */}
      {showSpawnModal && (
        <SpawnPointsSelectorModal
          currentLandmark={currentLandmark}
          onSelectSpawnPoint={teleportToSpawnPoint}
          onRandomSpawn={teleportRandomSpawn}
          onClose={() => setShowSpawnModal(false)}
        />
      )}

      {/* Developer Credits Modal (Mark David V. Valmores) */}
      {showCreditsModal && (
        <DeveloperCreditsModal
          onClose={() => setShowCreditsModal(false)}
        />
      )}
    </div>
  );
};
