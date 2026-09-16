// 3D Voxel World Engine with Three.js, Landmark Generators, Minecraft Avatars & Block Building

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Landmark, FAMOUS_LANDMARKS } from '../services/googleMapsService';
import { MinecraftSkin } from '../services/skins';
import { soundEngine } from '../services/soundEngine';
import { GameServer } from '../services/serverNetwork';

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
  { id: 'gold_block', name: 'Gold Block', color: 0xf5cf38, roughness: 0.2, icon: '🪙' },
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
  onToggleMap
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBlockIdx, setSelectedBlockIdx] = useState(0);
  const [isThirdPerson, setIsThirdPerson] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [coordsHUD, setCoordsHUD] = useState({ x: 0, y: 15, z: 25, fps: 60 });
  const [crosshairActive, setCrosshairActive] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');
  const [isRaining, setIsRaining] = useState(false);

  // References for Three.js state
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
  const playerPos = useRef(new THREE.Vector3(0, 15, 25));
  const playerVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const cameraYaw = useRef(0);
  const cameraPitch = useRef(0);
  const isPointerLocked = useRef(false);
  const isMining = useRef(false);
  const miningProgress = useRef(0);
  const miningTarget = useRef<{ key: string; mesh: THREE.Mesh; x: number; y: number; z: number } | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Material cache
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
      emissive: info.emissive ? info.emissive : 0x000000,
      transparent: info.transparent || false,
      opacity: info.opacity || 1.0,
      flatShading: true
    });
    materialsCache.current.set(typeId, mat);
    return mat;
  }, []);

  // Place a block at coordinates
  const addBlock = useCallback((x: number, y: number, z: number, type: string) => {
    const key = `${x},${y},${z}`;
    if (blocksMapRef.current.has(key)) return;

    const scene = sceneRef.current;
    if (!scene) return;

    const mat = getBlockMaterial(type);
    const mesh = new THREE.Mesh(blockGeom.current, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { isBlock: true, x, y, z, type };

    scene.add(mesh);
    blocksMapRef.current.set(key, { x, y, z, type, mesh });
  }, [getBlockMaterial]);

  // Remove block at coordinates
  const removeBlock = useCallback((x: number, y: number, z: number) => {
    const key = `${x},${y},${z}`;
    const blockData = blocksMapRef.current.get(key);
    if (!blockData) return;

    const scene = sceneRef.current;
    if (scene) {
      scene.remove(blockData.mesh);
      blockData.mesh.geometry.dispose();
    }
    blocksMapRef.current.delete(key);
  }, []);

  // Procedural Landmark Generator for each famous architectural site
  const generateLandmarkVoxels = useCallback((landmark: Landmark) => {
    // Clear existing blocks
    blocksMapRef.current.forEach(b => {
      if (sceneRef.current) sceneRef.current.remove(b.mesh);
    });
    blocksMapRef.current.clear();

    // 1. Build Grass / Terrain base (35x35 plaza)
    const baseSize = 22;
    for (let x = -baseSize; x <= baseSize; x++) {
      for (let z = -baseSize; z <= baseSize; z++) {
        // Natural cobblestone pathway or grass
        const isPath = Math.abs(x) <= 3 || Math.abs(z) <= 3;
        const blockType = isPath ? 'cobblestone' : (landmark.id === 'giza_pyramid' ? 'sandstone' : 'grass');
        addBlock(x, 0, z, blockType);

        // Subsurface dirt
        addBlock(x, -1, z, 'stone');
      }
    }

    // 2. Specialized architectural voxel construction
    switch (landmark.id) {
      case 'eiffel_tower': {
        // 4 curved iron base legs
        const legOffsets = [[-8, -8], [8, -8], [-8, 8], [8, 8]];
        legOffsets.forEach(([ox, oz]) => {
          for (let y = 1; y <= 8; y++) {
            const inward = Math.floor(y * 0.4);
            const lx = ox > 0 ? ox - inward : ox + inward;
            const lz = oz > 0 ? oz - inward : oz + inward;
            addBlock(lx, y, lz, 'stone');
            addBlock(lx + (ox > 0 ? -1 : 1), y, lz, 'cobblestone');
          }
        });

        // 1st Floor Platform
        for (let px = -5; px <= 5; px++) {
          for (let pz = -5; pz <= 5; pz++) {
            addBlock(px, 8, pz, 'quartz');
            if (Math.abs(px) === 5 || Math.abs(pz) === 5) {
              addBlock(px, 9, pz, 'glowstone');
            }
          }
        }

        // 2nd Floor shaft tapering
        for (let y = 9; y <= 16; y++) {
          const w = Math.max(1, Math.floor((18 - y) * 0.4));
          for (let px = -w; px <= w; px++) {
            for (let pz = -w; pz <= w; pz++) {
              if (Math.abs(px) === w || Math.abs(pz) === w) {
                addBlock(px, y, pz, 'stone');
              }
            }
          }
        }

        // 2nd Platform
        for (let px = -3; px <= 3; px++) {
          for (let pz = -3; pz <= 3; pz++) {
            addBlock(px, 16, pz, 'quartz');
          }
        }

        // Towering Spire
        for (let y = 17; y <= 34; y++) {
          addBlock(0, y, 0, y % 2 === 0 ? 'stone' : 'cobblestone');
          if (y % 4 === 0) {
            addBlock(1, y, 0, 'iron_block' in BLOCK_PALETTE ? 'stone' : 'quartz');
            addBlock(-1, y, 0, 'quartz');
            addBlock(0, y, 1, 'quartz');
            addBlock(0, y, -1, 'quartz');
          }
        }
        // Glowing Tip Beacon
        addBlock(0, 35, 0, 'glowstone');
        addBlock(0, 36, 0, 'diamond_block');
        break;
      }

      case 'giza_pyramid': {
        const height = 18;
        for (let y = 1; y <= height; y++) {
          const w = height - y + 1;
          for (let x = -w; x <= w; x++) {
            for (let z = -w; z <= w; z++) {
              // Shell optimization: outer ring or entrance
              if (Math.abs(x) === w || Math.abs(z) === w || y === 1 || (Math.abs(x) <= 1 && Math.abs(z) <= 1 && y <= 5)) {
                addBlock(x, y, z, 'sandstone');
              }
            }
          }
        }
        // Gold Pyramidion capstone
        addBlock(0, height + 1, 0, 'gold_block');

        // Sphinx statue beside the pyramid
        const sx = 12;
        for (let z = -3; z <= 3; z++) {
          for (let y = 1; y <= 3; y++) {
            addBlock(sx, y, z, 'sandstone');
            addBlock(sx + 1, y, z, 'sandstone');
          }
        }
        // Sphinx head & paws
        addBlock(sx + 2, 1, -2, 'sandstone');
        addBlock(sx + 2, 1, 2, 'sandstone');
        addBlock(sx, 4, 0, 'gold_block');
        addBlock(sx, 5, 0, 'sandstone');
        break;
      }

      case 'taj_mahal': {
        // Central marble plinth
        for (let x = -9; x <= 9; x++) {
          for (let z = -9; z <= 9; z++) {
            addBlock(x, 1, z, 'quartz');
          }
        }
        // Reflecting Pool
        for (let z = 10; z <= 20; z++) {
          for (let x = -2; x <= 2; x++) {
            addBlock(x, 0, z, 'water');
            addBlock(x, 1, z, 'water');
          }
        }
        // Main Mausoleum Chamber
        for (let y = 2; y <= 9; y++) {
          for (let x = -6; x <= 6; x++) {
            for (let z = -6; z <= 6; z++) {
              if (Math.abs(x) === 6 || Math.abs(z) === 6) {
                // Grand Iwan archway in front
                const isArch = z === 6 && Math.abs(x) <= 2 && y <= 6;
                if (!isArch) {
                  addBlock(x, y, z, 'quartz');
                }
              }
            }
          }
        }
        // Onion Dome
        for (let y = 10; y <= 14; y++) {
          const r = y === 12 ? 4 : (y === 14 ? 2 : 3);
          for (let x = -r; x <= r; x++) {
            for (let z = -r; z <= r; z++) {
              if (x * x + z * z <= r * r) {
                addBlock(x, y, z, 'quartz');
              }
            }
          }
        }
        // Gold Finial
        addBlock(0, 15, 0, 'gold_block');
        addBlock(0, 16, 0, 'gold_block');

        // 4 Corner Minarets
        const minarets = [[-8, -8], [8, -8], [-8, 8], [8, 8]];
        minarets.forEach(([mx, mz]) => {
          for (let y = 2; y <= 15; y++) {
            addBlock(mx, y, mz, 'quartz');
          }
          addBlock(mx, 16, mz, 'gold_block');
        });
        break;
      }

      case 'big_ben': {
        // Base Tower
        for (let y = 1; y <= 22; y++) {
          for (let x = -3; x <= 3; x++) {
            for (let z = -3; z <= 3; z++) {
              if (Math.abs(x) === 3 || Math.abs(z) === 3) {
                addBlock(x, y, z, y % 3 === 0 ? 'stone' : 'bricks');
              }
            }
          }
        }
        // Clock Section
        for (let y = 23; y <= 27; y++) {
          for (let x = -4; x <= 4; x++) {
            for (let z = -4; z <= 4; z++) {
              if (Math.abs(x) === 4 || Math.abs(z) === 4) {
                const isClockFace = (Math.abs(x) <= 2 && Math.abs(z) === 4) || (Math.abs(z) <= 2 && Math.abs(x) === 4);
                addBlock(x, y, z, isClockFace ? 'glowstone' : 'quartz');
              }
            }
          }
        }
        // Belfry & Spire
        for (let y = 28; y <= 36; y++) {
          const w = Math.max(1, Math.floor((38 - y) * 0.3));
          for (let x = -w; x <= w; x++) {
            for (let z = -w; z <= w; z++) {
              if (Math.abs(x) === w || Math.abs(z) === w) {
                addBlock(x, y, z, 'stone');
              }
            }
          }
        }
        addBlock(0, 37, 0, 'gold_block');
        break;
      }

      case 'statue_of_liberty': {
        // Star Fort Pedestal
        for (let y = 1; y <= 6; y++) {
          for (let x = -5; x <= 5; x++) {
            for (let z = -5; z <= 5; z++) {
              if (Math.abs(x) === 5 || Math.abs(z) === 5) {
                addBlock(x, y, z, 'stone');
              }
            }
          }
        }
        // Statue Pedestal
        for (let y = 7; y <= 12; y++) {
          for (let x = -3; x <= 3; x++) {
            for (let z = -3; z <= 3; z++) {
              if (Math.abs(x) === 3 || Math.abs(z) === 3) {
                addBlock(x, y, z, 'sandstone');
              }
            }
          }
        }
        // Lady Liberty Body (Greenish oxidized copper)
        for (let y = 13; y <= 21; y++) {
          for (let x = -2; x <= 2; x++) {
            for (let z = -1; z <= 1; z++) {
              addBlock(x, y, z, 'diamond_block');
            }
          }
        }
        // Head & Crown
        addBlock(0, 22, 0, 'diamond_block');
        addBlock(-1, 23, 0, 'gold_block');
        addBlock(1, 23, 0, 'gold_block');
        addBlock(0, 24, 0, 'gold_block');
        // Upraised Torch Arm
        for (let y = 20; y <= 26; y++) {
          addBlock(3, y, 0, 'diamond_block');
        }
        // Torch with fire!
        addBlock(3, 27, 0, 'gold_block');
        addBlock(3, 28, 0, 'glowstone');
        break;
      }

      case 'colosseum': {
        const rx = 12;
        const rz = 9;
        for (let y = 1; y <= 10; y++) {
          for (let angle = 0; angle < 360; angle += 6) {
            const rad = (angle * Math.PI) / 180;
            const x = Math.round(rx * Math.cos(rad));
            const z = Math.round(rz * Math.sin(rad));

            // Ruined authentic silhouette (higher on one side)
            if (angle > 180 && y > 6) continue;

            // Arched window openings
            const isArchOpening = y % 3 === 2 && angle % 18 === 0;
            if (!isArchOpening) {
              addBlock(x, y, z, 'sandstone');
              addBlock(x > 0 ? x - 1 : x + 1, y, z, 'cobblestone');
            }
          }
        }
        // Arena Wooden / Sand floor
        for (let x = -8; x <= 8; x++) {
          for (let z = -5; z <= 5; z++) {
            if ((x * x) / 64 + (z * z) / 25 <= 1) {
              addBlock(x, 1, z, 'oak_planks');
            }
          }
        }
        break;
      }

      default: {
        // Universal iconic landmark generator (Tower / Castle / Arch)
        for (let y = 1; y <= 16; y++) {
          const w = Math.max(2, Math.floor((20 - y) * 0.4));
          for (let x = -w; x <= w; x++) {
            for (let z = -w; z <= w; z++) {
              if (Math.abs(x) === w || Math.abs(z) === w) {
                addBlock(x, y, z, y % 2 === 0 ? 'quartz' : 'stone');
              }
            }
          }
        }
        addBlock(0, 17, 0, 'gold_block');
        addBlock(0, 18, 0, 'diamond_block');
        addBlock(0, 19, 0, 'glowstone');
        break;
      }
    }
  }, [addBlock]);

  // Create 3D Minecraft Avatar Mesh for Player
  const createAvatarMesh = useCallback((skin: MinecraftSkin): THREE.Group => {
    const group = new THREE.Group();

    const hex = (colStr: string) => parseInt(colStr.replace('#', ''), 16);

    // Head (1.0 x 1.0 x 1.0)
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

    // Torso (0.8 x 0.9 x 0.45)
    const torsoGeom = new THREE.BoxGeometry(0.8, 0.85, 0.45);
    const torsoMat = new THREE.MeshStandardMaterial({ color: hex(skin.bodyColor), roughness: 0.8, flatShading: true });
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = 0.85;
    torso.castShadow = true;
    group.add(torso);

    // Left Arm & Right Arm (0.35 x 0.8 x 0.35)
    const armGeom = new THREE.BoxGeometry(0.35, 0.8, 0.35);
    const armMat = new THREE.MeshStandardMaterial({ color: hex(skin.armsColor), roughness: 0.8, flatShading: true });

    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.6, 0.85, 0);
    leftArm.castShadow = true;

    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.6, 0.85, 0);
    rightArm.castShadow = true;
    group.add(leftArm, rightArm);

    // Left Leg & Right Leg (0.35 x 0.85 x 0.35)
    const legGeom = new THREE.BoxGeometry(0.35, 0.85, 0.35);
    const legMat = new THREE.MeshStandardMaterial({ color: hex(skin.legsColor), roughness: 0.8, flatShading: true });

    const leftLeg = new THREE.Mesh(legGeom, legMat);
    leftLeg.position.set(-0.2, 0.42, 0);
    leftLeg.castShadow = true;

    const rightLeg = new THREE.Mesh(legGeom, legMat);
    rightLeg.position.set(0.2, 0.42, 0);
    rightLeg.castShadow = true;
    group.add(leftLeg, rightLeg);

    // Cape (if skin has cape)
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

  // Main Three.js setup & loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.015);

    // Camera
    const camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    sunLight.position.set(40, 70, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);

    // Highlight wireframe box for targeted block
    const wireGeom = new THREE.EdgesGeometry(blockGeom.current);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const highlightBox = new THREE.LineSegments(wireGeom, wireMat);
    highlightBox.visible = false;
    scene.add(highlightBox);
    highlightBoxRef.current = highlightBox;

    // Player Avatar Mesh
    const avatar = createAvatarMesh(currentSkin);
    scene.add(avatar);
    avatarMeshRef.current = avatar;

    // Generate landmark voxels
    generateLandmarkVoxels(currentLandmark);

    // Play welcome chime
    soundEngine.playLevelUp();
    soundEngine.startAmbientMusic();

    // Spawn 3 simulated server peers exploring the landmark in real time
    const simulatedPeers: RemotePlayer[] = [
      { id: 'peer_1', name: 'AlphaCrafter_9', skin: currentSkin, x: 4, y: 1, z: 6, rotationY: 0.5 },
      { id: 'peer_2', name: 'EuroBuilder_Max', skin: currentSkin, x: -6, y: 1, z: -4, rotationY: 2.1 },
      { id: 'peer_3', name: 'TokyoPioneer', skin: currentSkin, x: 0, y: 8, z: 0, rotationY: -1.2 }
    ];
    simulatedPeers.forEach(peer => {
      const mesh = createAvatarMesh(peer.skin);
      mesh.position.set(peer.x, peer.y, peer.z);
      scene.add(mesh);
      peer.mesh = mesh;
      remotePlayersRef.current.set(peer.id, peer);
    });

    // Multi-tab real-time sync setup
    try {
      const bc = new BroadcastChannel('google_craft_voxel_sync');
      broadcastChannelRef.current = bc;
      bc.onmessage = (ev) => {
        const data = ev.data;
        if (data.type === 'block_placed') {
          addBlock(data.x, data.y, data.z, data.blockType);
        } else if (data.type === 'block_broken') {
          removeBlock(data.x, data.y, data.z);
        }
      };
    } catch {
      // fallback
    }

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let walkCycle = 0;

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Handle Input & Movement
      const moveSpeed = (keysPressed.current['ShiftLeft'] || keysPressed.current['ShiftRight']) ? 12 : 6;
      const forward = new THREE.Vector3(-Math.sin(cameraYaw.current), 0, -Math.cos(cameraYaw.current));
      const right = new THREE.Vector3(Math.cos(cameraYaw.current), 0, -Math.sin(cameraYaw.current));

      const moveDir = new THREE.Vector3(0, 0, 0);
      if (keysPressed.current['KeyW']) moveDir.add(forward);
      if (keysPressed.current['KeyS']) moveDir.sub(forward);
      if (keysPressed.current['KeyD']) moveDir.add(right);
      if (keysPressed.current['KeyA']) moveDir.sub(right);

      const isMoving = moveDir.lengthSq() > 0.01;
      if (isMoving) {
        moveDir.normalize();
        playerPos.current.x += moveDir.x * moveSpeed * delta;
        playerPos.current.z += moveDir.z * moveSpeed * delta;

        // Walk animation cycle
        walkCycle += delta * 10;
        if (avatarPartsRef.current) {
          avatarPartsRef.current.leftLeg.rotation.x = Math.sin(walkCycle) * 0.6;
          avatarPartsRef.current.rightLeg.rotation.x = -Math.sin(walkCycle) * 0.6;
          avatarPartsRef.current.leftArm.rotation.x = -Math.sin(walkCycle) * 0.6;
          if (!isMining.current) {
            avatarPartsRef.current.rightArm.rotation.x = Math.sin(walkCycle) * 0.6;
          }
          if (avatarPartsRef.current.cape) {
            avatarPartsRef.current.cape.rotation.x = 0.2 + Math.abs(Math.sin(walkCycle)) * 0.35;
          }
        }

        // Periodic footstep SFX
        if (Math.sin(walkCycle) > 0.95) {
          soundEngine.playFootstep();
        }
      } else {
        // Reset limbs when standing still
        if (avatarPartsRef.current) {
          avatarPartsRef.current.leftLeg.rotation.x = 0;
          avatarPartsRef.current.rightLeg.rotation.x = 0;
          avatarPartsRef.current.leftArm.rotation.x = 0;
          if (!isMining.current) avatarPartsRef.current.rightArm.rotation.x = 0;
        }
      }

      // Vertical movement & gravity
      if (isFlying) {
        if (keysPressed.current['Space']) playerPos.current.y += 8 * delta;
        if (keysPressed.current['KeyC']) playerPos.current.y -= 8 * delta;
      } else {
        // Simple ground collision at y = 1.0 (avatar feet on blocks)
        playerVelocity.current.y -= 25 * delta; // Gravity
        playerPos.current.y += playerVelocity.current.y * delta;

        if (playerPos.current.y <= 1.0) {
          playerPos.current.y = 1.0;
          playerVelocity.current.y = 0;
          if (keysPressed.current['Space']) {
            playerVelocity.current.y = 9;
            soundEngine.playJump();
          }
        }
      }

      // Update Avatar Position & Rotation
      if (avatarMeshRef.current) {
        avatarMeshRef.current.position.copy(playerPos.current);
        avatarMeshRef.current.rotation.y = cameraYaw.current;

        // Arm swing if mining
        if (isMining.current && avatarPartsRef.current) {
          miningProgress.current += delta * 6;
          avatarPartsRef.current.rightArm.rotation.x = -0.5 + Math.sin(miningProgress.current * 4) * 0.8;
        }
      }

      // Update Camera (First Person vs Third Person)
      if (isThirdPerson) {
        // Orbit behind player
        const dist = 4.5;
        const camY = playerPos.current.y + 2.2 - Math.sin(cameraPitch.current) * 1.5;
        const camX = playerPos.current.x + Math.sin(cameraYaw.current) * dist * Math.cos(cameraPitch.current);
        const camZ = playerPos.current.z + Math.cos(cameraYaw.current) * dist * Math.cos(cameraPitch.current);

        camera.position.set(camX, camY, camZ);
        camera.lookAt(playerPos.current.x, playerPos.current.y + 1.6, playerPos.current.z);
        if (avatarMeshRef.current) avatarMeshRef.current.visible = true;
      } else {
        // First person inside avatar eyes
        camera.position.set(playerPos.current.x, playerPos.current.y + 1.6, playerPos.current.z);
        const target = new THREE.Vector3(
          playerPos.current.x - Math.sin(cameraYaw.current) * Math.cos(cameraPitch.current),
          playerPos.current.y + 1.6 + Math.sin(cameraPitch.current),
          playerPos.current.z - Math.cos(cameraYaw.current) * Math.cos(cameraPitch.current)
        );
        camera.lookAt(target);
        // Hide own avatar body in 1st person so it doesn't clip
        if (avatarMeshRef.current) avatarMeshRef.current.visible = false;
      }

      // Raycasting for targeted block
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const meshes = Array.from(blocksMapRef.current.values()).map((b: { mesh: THREE.Mesh }) => b.mesh);
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0 && intersects[0].distance < 7.5) {
        const hit = intersects[0];
        const blockObj = hit.object;
        if (highlightBoxRef.current) {
          highlightBoxRef.current.position.copy(blockObj.position);
          highlightBoxRef.current.visible = true;
        }
        setCrosshairActive(true);
        miningTarget.current = {
          key: `${blockObj.position.x},${blockObj.position.y},${blockObj.position.z}`,
          mesh: blockObj as THREE.Mesh,
          x: blockObj.position.x,
          y: blockObj.position.y,
          z: blockObj.position.z
        };
      } else {
        if (highlightBoxRef.current) highlightBoxRef.current.visible = false;
        setCrosshairActive(false);
        miningTarget.current = null;
      }

      // Update HUD Coordinates
      setCoordsHUD({
        x: Math.round(playerPos.current.x),
        y: Math.round(playerPos.current.y),
        z: Math.round(playerPos.current.z),
        fps: Math.round(1 / Math.max(delta, 0.001))
      });

      // Render
      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Mouse & Keyboard controls
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      // F5 to toggle camera view
      if (e.code === 'F5') {
        e.preventDefault();
        setIsThirdPerson(prev => !prev);
      }
      // F to toggle flight
      if (e.code === 'KeyF') {
        setIsFlying(prev => !prev);
      }
      // E to open Inventory
      if (e.code === 'KeyE') {
        if (onOpenInventory) onOpenInventory();
      }
      // M to toggle Google Map
      if (e.code === 'KeyM') {
        if (onToggleMap) onToggleMap();
      }
      // Number keys 1-9 to select hotbar
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        setSelectedBlockIdx(num - 1);
        soundEngine.playClick();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;
      const sensitivity = 0.0024;
      cameraYaw.current += e.movementX * sensitivity;
      cameraPitch.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, cameraPitch.current - e.movementY * sensitivity));
    };

    const onMouseDown = (e: MouseEvent) => {
      // Lock pointer on click
      if (!isPointerLocked.current && containerRef.current) {
        containerRef.current.requestPointerLock();
      }

      if (e.button === 0) {
        // Left Click: Mine Block
        isMining.current = true;
        if (miningTarget.current) {
          const t = miningTarget.current;
          const blockInfo = blocksMapRef.current.get(t.key);
          soundEngine.playBlockBreak(blockInfo?.type || 'stone');
          removeBlock(t.x, t.y, t.z);
          if (onBlockBroken) onBlockBroken();

          // Sync block destruction across peers
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({ type: 'block_broken', x: t.x, y: t.y, z: t.z });
          }
        }
      } else if (e.button === 2) {
        // Right Click: Place Block against targeted face
        e.preventDefault();
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const meshes = Array.from(blocksMapRef.current.values()).map((b: { mesh: THREE.Mesh }) => b.mesh);
        const intersects = raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0 && intersects[0].face) {
          const hit = intersects[0];
          const normal = hit.face.normal;
          const pos = hit.object.position;
          const nx = pos.x + Math.round(normal.x);
          const ny = pos.y + Math.round(normal.y);
          const nz = pos.z + Math.round(normal.z);

          const blockType = BLOCK_PALETTE[selectedBlockIdx]?.id || 'stone';
          addBlock(nx, ny, nz, blockType);
          soundEngine.playBlockPlace(blockType);
          if (onBlockPlaced) onBlockPlaced();

          // Sync block placement across peers
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({ type: 'block_placed', x: nx, y: ny, z: nz, blockType });
          }
        }
      }
    };

    const onMouseUp = () => {
      isMining.current = false;
      miningProgress.current = 0;
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === containerRef.current;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('pointerlockchange', onPointerLockChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      if (rendererRef.current && container) {
        container.innerHTML = '';
        rendererRef.current.dispose();
      }
    };
  }, [
    createAvatarMesh,
    currentLandmark,
    currentSkin,
    generateLandmarkVoxels,
    getBlockMaterial,
    isFlying,
    isThirdPerson,
    onBlockBroken,
    onBlockPlaced,
    onOpenInventory,
    onToggleMap,
    removeBlock,
    addBlock,
    selectedBlockIdx
  ]);

  // Update skin if user switches skin
  useEffect(() => {
    if (avatarMeshRef.current && sceneRef.current) {
      sceneRef.current.remove(avatarMeshRef.current);
      const newAvatar = createAvatarMesh(currentSkin);
      sceneRef.current.add(newAvatar);
      avatarMeshRef.current = newAvatar;
    }
  }, [currentSkin, createAvatarMesh]);

  // Update landmark if user teleports
  useEffect(() => {
    if (sceneRef.current) {
      generateLandmarkVoxels(currentLandmark);
      // Reset player position in front of the landmark
      playerPos.current.set(0, 5, 20);
      cameraYaw.current = 0;
      cameraPitch.current = 0;
      soundEngine.playTeleport();
    }
  }, [currentLandmark, generateLandmarkVoxels]);

  // Update Sky & Lighting when timeOfDay changes
  const toggleTimeOfDay = () => {
    soundEngine.playClick();
    const next = timeOfDay === 'day' ? 'sunset' : (timeOfDay === 'sunset' ? 'night' : 'day');
    setTimeOfDay(next);
    if (!sceneRef.current) return;

    if (next === 'day') {
      sceneRef.current.background = new THREE.Color(0x87ceeb);
      sceneRef.current.fog = new THREE.FogExp2(0x87ceeb, 0.015);
    } else if (next === 'sunset') {
      sceneRef.current.background = new THREE.Color(0xcc6633);
      sceneRef.current.fog = new THREE.FogExp2(0xbb5533, 0.018);
    } else {
      sceneRef.current.background = new THREE.Color(0x0a0c18);
      sceneRef.current.fog = new THREE.FogExp2(0x0a0c18, 0.02);
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden" id="voxel-viewport-container">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" id="threejs-canvas-stage" />

      {/* Minecraft Crosshair */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75 ${
          crosshairActive ? 'scale-125' : 'scale-100'
        }`}
        id="mc-screen-crosshair"
      >
        <div className="w-4 h-4 relative flex items-center justify-center">
          <div className="w-4 h-0.5 bg-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] absolute"></div>
          <div className="h-4 w-0.5 bg-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] absolute"></div>
        </div>
      </div>

      {/* Top Left HUD: Landmark & GPS Coordinates */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10" id="hud-top-left">
        <div className="bg-stone-900/80 backdrop-blur-md px-3 py-2 border border-stone-700/80 rounded-none shadow-lg text-xs font-minecraft text-white/90 flex items-center gap-3">
          <span className="text-xl">{currentLandmark.flag}</span>
          <div>
            <div className="text-amber-400 font-bold uppercase tracking-wider">{currentLandmark.name}</div>
            <div className="text-[10px] text-stone-300 font-pixel text-base">
              GPS: {currentLandmark.lat.toFixed(4)}°N, {currentLandmark.lng.toFixed(4)}°E | Alt: {currentLandmark.altitudeMeters}m
            </div>
          </div>
        </div>

        {/* Voxel debug / F3 coordinates */}
        <div className="bg-black/60 px-2.5 py-1.5 border border-stone-800 text-[11px] font-pixel text-stone-200 space-y-0.5">
          <div>XYZ: <span className="text-emerald-400">{coordsHUD.x} / {coordsHUD.y} / {coordsHUD.z}</span></div>
          <div>Biome: <span className="text-cyan-400">{currentLandmark.category}</span></div>
          <div>Server: <span className="text-amber-300">{currentServer.name}</span> ({currentServer.pingMs}ms)</div>
          <div>FPS: <span className="text-green-400">{coordsHUD.fps}</span> | Mode: {isFlying ? 'Flight' : 'Walk'}</div>
        </div>
      </div>

      {/* Top Right Quick Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10" id="hud-top-right">
        <button
          onClick={toggleTimeOfDay}
          className="mc-btn px-2.5 py-1.5 text-[10px] flex items-center gap-1.5 cursor-pointer"
          title="Toggle Time of Day"
          id="btn-toggle-time"
        >
          {timeOfDay === 'day' ? '☀️ Day' : (timeOfDay === 'sunset' ? '🌅 Sunset' : '🌙 Night')}
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setIsThirdPerson(prev => !prev);
          }}
          className="mc-btn px-2.5 py-1.5 text-[10px] flex items-center gap-1.5 cursor-pointer"
          title="Toggle Perspective (F5)"
          id="btn-toggle-perspective"
        >
          📷 {isThirdPerson ? '3rd Person' : '1st Person'}
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setIsFlying(prev => !prev);
          }}
          className={`mc-btn px-2.5 py-1.5 text-[10px] flex items-center gap-1.5 cursor-pointer ${
            isFlying ? 'text-amber-300' : ''
          }`}
          title="Toggle Flight (F)"
          id="btn-toggle-flight"
        >
          🪽 {isFlying ? 'Flying ON' : 'Fly OFF'}
        </button>
      </div>

      {/* Bottom Minecraft Hotbar (Slots 1-9) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1 p-1 bg-stone-900/90 border-2 border-stone-600 shadow-2xl z-20" id="mc-hotbar-container">
        {BLOCK_PALETTE.slice(0, 9).map((block, idx) => {
          const isSelected = idx === selectedBlockIdx;
          return (
            <button
              key={block.id}
              onClick={() => {
                setSelectedBlockIdx(idx);
                soundEngine.playClick();
              }}
              className={`relative w-11 h-11 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'border-2 border-white bg-stone-700/90 scale-105 shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                  : 'border border-stone-700 bg-stone-800/80 hover:bg-stone-750'
              }`}
              id={`hotbar-slot-${idx}`}
              title={`${idx + 1}: ${block.name}`}
            >
              <span className="text-xl select-none">{block.icon}</span>
              <span className="absolute top-0.5 left-1 text-[9px] font-minecraft text-stone-400">
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
          className="w-11 h-11 border border-stone-600 bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-xs font-minecraft text-amber-300 cursor-pointer"
          title="Open Palette (E)"
          id="btn-open-palette"
        >
          🎒 [E]
        </button>
      </div>

      {/* Floating Instructions / Controls Tip */}
      <div className="absolute bottom-18 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 text-[11px] font-pixel text-stone-300 pointer-events-none rounded border border-stone-800/80" id="mc-controls-hint">
        [Click to Look] | Left Click: Break Block | Right Click: Place Block | WASD: Move | Space: Jump | E: Inventory | M: Google Maps
      </div>
    </div>
  );
};
