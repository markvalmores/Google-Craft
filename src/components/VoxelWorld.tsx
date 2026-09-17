// 3D Voxel World Engine with Three.js, Landmark Generators, Minecraft Avatars & Block Building
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Landmark, BlockArchitecturalInfo, getVoxelArchitecturalInfo, SpawnPoint, getDefaultSpawnPoint, getRandomSpawnPoint, FAMOUS_LANDMARKS } from '../services/googleMapsService';
import { MinecraftSkin } from '../services/skins';
import { soundEngine } from '../services/soundEngine';
import { GameServer } from '../services/serverNetwork';
import { MiniMapHUD } from './MiniMapHUD';
import { VoxelTooltipHUD } from './VoxelTooltipHUD';
import { ChunkEngine } from '../services/chunkEngine';
import { weatherSeasonService, WeatherSeasonState } from '../services/weatherSeasonService';
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
  onOpenDownload?: () => void;
}

export const VoxelWorld: React.FC<VoxelWorldProps> = ({
  currentLandmark,
  currentSkin,
  currentServer: _currentServer,
  username: _username,
  isOpeningTrailer: _isOpeningTrailer,
  onBlockPlaced,
  onBlockBroken,
  onOpenInventory,
  onToggleMap,
  onOpenWeather,
  onOpenPerformance,
  onOpenOccasions,
  onOpenCredits,
  onOpenDownload
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
  } | null>(null);

  // Instanced / Map block storage
  const blocksMapRef = useRef<Map<string, { x: number; y: number; z: number; type: string; mesh: THREE.Mesh }>>(new Map());
  const highlightBoxRef = useRef<THREE.LineSegments | null>(null);

  // Input & Physics state
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const touchMoveInput = useRef<{ forward: number; strafe: number }>({ forward: 0, strafe: 0 });
  const gamepadMoveInput = useRef<{ forward: number; strafe: number }>({ forward: 0, strafe: 0 });
  const jumpRequested = useRef(false);
  const playerPos = useRef(new THREE.Vector3(initialSpawn.x, initialSpawn.y, initialSpawn.z));
  const playerVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const cameraYaw = useRef(initialSpawn.yaw);
  const cameraPitch = useRef(initialSpawn.pitch);
  const isPointerLocked = useRef(false);
  const isMining = useRef(false);
  const miningProgress = useRef(0);
  const miningTarget = useRef<{ key: string; mesh: THREE.Mesh; x: number; y: number; z: number } | null>(null);

  // Stable Reference Wrappers to avoid re-mounting Three.js scene
  const cameraModeRef = useRef<CameraPerspective>(cameraMode);
  const isFlyingRef = useRef<boolean>(isFlying);
  const selectedBlockIdxRef = useRef<number>(selectedBlockIdx);
  const currentSkinRef = useRef<MinecraftSkin>(currentSkin);
  const onBlockPlacedRef = useRef(onBlockPlaced);
  const onBlockBrokenRef = useRef(onBlockBroken);
  const onOpenInventoryRef = useRef(onOpenInventory);
  const onToggleMapRef = useRef(onToggleMap);
  const lastLoadedLandmarkId = useRef<string>('');

  useEffect(() => { cameraModeRef.current = cameraMode; }, [cameraMode]);
  useEffect(() => { isFlyingRef.current = isFlying; }, [isFlying]);
  useEffect(() => { selectedBlockIdxRef.current = selectedBlockIdx; }, [selectedBlockIdx]);
  useEffect(() => { currentSkinRef.current = currentSkin; }, [currentSkin]);
  useEffect(() => { onBlockPlacedRef.current = onBlockPlaced; }, [onBlockPlaced]);
  useEffect(() => { onBlockBrokenRef.current = onBlockBroken; }, [onBlockBroken]);
  useEffect(() => { onOpenInventoryRef.current = onOpenInventory; }, [onOpenInventory]);
  useEffect(() => { onToggleMapRef.current = onToggleMap; }, [onToggleMap]);

  // Weather particle systems & Lighting
  const weatherParticlesRef = useRef<THREE.Points | null>(null);
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

  // Helper to calculate solid ground height under any coordinate
  const getGroundHeightAt = useCallback((x: number, z: number, currentY: number): number => {
    let highestY = 0;
    const sampleOffsets = [
      [0, 0],
      [0.25, 0.25],
      [-0.25, 0.25],
      [0.25, -0.25],
      [-0.25, -0.25]
    ];

    for (const [ox, oz] of sampleOffsets) {
      const bx = Math.round(x + ox);
      const bz = Math.round(z + oz);
      const maxYToCheck = Math.min(60, Math.floor(currentY + 1.2));
      for (let checkY = maxYToCheck; checkY >= 0; checkY--) {
        const key = `${bx},${checkY},${bz}`;
        if (blocksMapRef.current.has(key)) {
          if (checkY > highestY) {
            highestY = checkY;
          }
          break;
        }
      }
    }

    return highestY + 1.0;
  }, []);

  // Check touch capability on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(isTouch);
    }
  }, []);

  // Create Avatar Mesh (3rd person) with joint pivots for smooth movement
  const createAvatarMesh = useCallback((skin: MinecraftSkin): THREE.Group => {
    const group = new THREE.Group();
    const hex = (col: string) => parseInt(col.replace('#', '0x'), 16);

    // Head Group (pivot at neck y = 1.6)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.6, 0);

    const headGeom = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const headMat = new THREE.MeshStandardMaterial({ color: hex(skin.headColor), roughness: 0.8, flatShading: true });
    const headMesh = new THREE.Mesh(headGeom, headMat);
    headMesh.position.set(0, 0.35, 0);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Eyes
    const eyeGeom = new THREE.BoxGeometry(0.12, 0.08, 0.02);
    const eyeMat = new THREE.MeshBasicMaterial({ color: hex(skin.eyeColor) });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.16, 0.35, 0.36);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.16, 0.35, 0.36);
    headGroup.add(leftEye, rightEye);
    group.add(headGroup);

    // Torso (from y = 0.8 to 1.6, center at 1.2)
    const torsoGeom = new THREE.BoxGeometry(0.75, 0.8, 0.4);
    const torsoMat = new THREE.MeshStandardMaterial({ color: hex(skin.bodyColor), roughness: 0.8, flatShading: true });
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.set(0, 1.2, 0);
    torso.castShadow = true;
    group.add(torso);

    // Left Arm Pivot (shoulder at y = 1.55, x = -0.52)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.52, 1.55, 0);
    const armGeom = new THREE.BoxGeometry(0.28, 0.75, 0.28);
    const armMat = new THREE.MeshStandardMaterial({ color: hex(skin.armsColor), roughness: 0.8, flatShading: true });
    const leftArmMesh = new THREE.Mesh(armGeom, armMat);
    leftArmMesh.position.set(0, -0.375, 0);
    leftArmMesh.castShadow = true;
    leftArmGroup.add(leftArmMesh);
    group.add(leftArmGroup);

    // Right Arm Pivot (shoulder at y = 1.55, x = 0.52)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.52, 1.55, 0);
    const rightArmMesh = new THREE.Mesh(armGeom, armMat);
    rightArmMesh.position.set(0, -0.375, 0);
    rightArmMesh.castShadow = true;
    rightArmGroup.add(rightArmMesh);
    group.add(rightArmGroup);

    // Left Leg Pivot (hip at y = 0.8, x = -0.19)
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.19, 0.8, 0);
    const legGeom = new THREE.BoxGeometry(0.28, 0.8, 0.28);
    const legMat = new THREE.MeshStandardMaterial({ color: hex(skin.legsColor), roughness: 0.8, flatShading: true });
    const leftLegMesh = new THREE.Mesh(legGeom, legMat);
    leftLegMesh.position.set(0, -0.4, 0);
    leftLegMesh.castShadow = true;
    leftLegGroup.add(leftLegMesh);
    group.add(leftLegGroup);

    // Right Leg Pivot (hip at y = 0.8, x = 0.19)
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.19, 0.8, 0);
    const rightLegMesh = new THREE.Mesh(legGeom, legMat);
    rightLegMesh.position.set(0, -0.4, 0);
    rightLegMesh.castShadow = true;
    rightLegGroup.add(rightLegMesh);
    group.add(rightLegGroup);

    avatarPartsRef.current = {
      head: headMesh,
      leftArm: leftArmMesh,
      rightArm: rightArmMesh,
      leftLeg: leftLegMesh,
      rightLeg: rightLegMesh
    };

    return group;
  }, []);

  // Update skin dynamically without world reload
  useEffect(() => {
    if (!sceneRef.current) return;
    if (avatarMeshRef.current) {
      sceneRef.current.remove(avatarMeshRef.current);
    }
    const newAvatar = createAvatarMesh(currentSkin);
    newAvatar.visible = cameraModeRef.current !== 'first_person';
    sceneRef.current.add(newAvatar);
    avatarMeshRef.current = newAvatar;
  }, [currentSkin, createAvatarMesh]);

  // Update cameraMode visibility dynamically
  useEffect(() => {
    if (avatarMeshRef.current) {
      avatarMeshRef.current.visible = cameraMode !== 'first_person';
    }
  }, [cameraMode]);

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

  // Procedural Landmark Generator: Stacking 5 Graphic Layers
  const generateLandmark = useCallback((landmark: Landmark, scene: THREE.Scene) => {
    // Clear previous blocks
    blocksMapRef.current.forEach(({ mesh }) => {
      scene.remove(mesh);
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

    // ==========================================
    // LAYER 1: Bedrock Foundation & Subterranean Matrix
    // ==========================================
    for (let x = -30; x <= 30; x++) {
      for (let z = -30; z <= 30; z++) {
        addBlock(x, -1, z, 'bedrock');
      }
    }

    // ==========================================
    // LAYER 2: Surface Plaza, Waterways & Biome Plazas
    // ==========================================
    for (let x = -26; x <= 26; x++) {
      for (let z = -26; z <= 26; z++) {
        const distFromCenter = Math.sqrt(x * x + z * z);
        if (distFromCenter > 24) continue;
        
        if (landmark.id === 'paris_valentines' || landmark.id === 'golden_gate' || landmark.id === 'taj_mahal') {
          // Channels or decorative reflecting pools
          if (landmark.id === 'taj_mahal' && Math.abs(x) <= 2 && z >= -16 && z <= 16) {
            addBlock(x, 0, z, 'water');
          } else if (landmark.id === 'paris_valentines' && Math.abs(z) <= 5) {
            addBlock(x, 0, z, 'water');
          } else if (landmark.id === 'golden_gate' && Math.abs(x) <= 22 && Math.abs(z) >= 5) {
            addBlock(x, 0, z, 'water');
          } else {
            addBlock(x, 0, z, 'grass');
          }
        } else if (landmark.id === 'giza_pyramid') {
          addBlock(x, 0, z, 'sandstone');
        } else if (landmark.id === 'north_pole_xmas') {
          addBlock(x, 0, z, 'quartz'); // Snow-covered quartz plaza
        } else if (landmark.id === 'times_square') {
          addBlock(x, 0, z, (Math.abs(x) <= 3 && z % 4 === 0) ? 'gold_block' : 'stone');
        } else {
          addBlock(x, 0, z, 'grass');
        }
      }
    }

    // ==========================================
    // LAYERS 3, 4 & 5: Structural Core, Elevation & Architectural Arts
    // ==========================================
    switch (landmark.id) {
      // 1. Mount Calvary & The Holy Sepulchre (Holy Week)
      case 'mount_calvary_holy_week': {
        // Terraced Hill
        for (let y = 1; y <= 9; y++) {
          const r = Math.max(1, 14 - y * 1.3);
          for (let x = -r; x <= r; x++) {
            for (let z = -r; z <= r; z++) {
              if (x * x + z * z <= r * r) {
                const block = (y === 9 || (y >= 7 && (x + z) % 2 === 0)) ? 'sandstone' : 'stone';
                addBlock(Math.round(x), y, Math.round(z), block);
              }
            }
          }
        }
        // Three Crosses atop Calvary
        const crosses = [
          { x: 0, z: 0, height: 7, isCenter: true },
          { x: -4, z: 1, height: 5, isCenter: false },
          { x: 4, z: 1, height: 5, isCenter: false }
        ];
        crosses.forEach(({ x, z, height, isCenter }) => {
          const baseY = 9;
          for (let y = 1; y <= height; y++) {
            addBlock(x, baseY + y, z, 'oak_planks');
          }
          const armY = baseY + height - 2;
          addBlock(x - 1, armY, z, 'oak_planks');
          addBlock(x + 1, armY, z, 'oak_planks');
          if (isCenter) {
            addBlock(x - 2, armY, z, 'oak_planks');
            addBlock(x + 2, armY, z, 'oak_planks');
            // Golden Halo
            addBlock(x, baseY + height + 1, z, 'gold_block');
            addBlock(x, baseY + height + 2, z, 'glowstone');
          }
        });
        // Garden Tomb & Olive Trees
        for (let tx = 8; tx <= 14; tx++) {
          for (let tz = 6; tz <= 12; tz++) {
            for (let ty = 1; ty <= 5; ty++) {
              if (tx === 8 || tx === 14 || tz === 6 || tz === 12 || ty === 5) {
                if (!(tx === 8 && tz >= 8 && tz <= 10 && ty <= 3)) {
                  addBlock(tx, ty, tz, 'cobblestone');
                }
              }
            }
          }
        }
        // Rolled Stone Disk
        addBlock(7, 1, 9, 'stone');
        addBlock(7, 2, 9, 'stone');
        addBlock(7, 1, 10, 'stone');
        addBlock(7, 2, 10, 'stone');
        break;
      }

      // 2. North Pole Christmas Village
      case 'north_pole_xmas': {
        // Giant 22-tier Christmas Tree
        for (let y = 1; y <= 22; y++) {
          addBlock(0, y, 0, 'oak_planks');
          const maxRadius = Math.max(1, Math.floor((23 - y) / 2.2));
          for (let rx = -maxRadius; rx <= maxRadius; rx++) {
            for (let rz = -maxRadius; rz <= maxRadius; rz++) {
              if (rx * rx + rz * rz <= maxRadius * maxRadius) {
                if (Math.random() < 0.08) {
                  addBlock(rx, y, rz, y % 2 === 0 ? 'redstone_lamp' : 'gold_block');
                } else {
                  addBlock(rx, y, rz, 'oak_leaves');
                }
              }
            }
          }
        }
        // Glowing Star of Bethlehem
        addBlock(0, 23, 0, 'gold_block');
        addBlock(0, 24, 0, 'glowstone');
        addBlock(1, 23, 0, 'gold_block');
        addBlock(-1, 23, 0, 'gold_block');
        addBlock(0, 23, 1, 'gold_block');
        addBlock(0, 23, -1, 'gold_block');

        // Santa's Log Cabin Workshop
        for (let x = 10; rxLoop(x); x++) {}
        function rxLoop(x: number) {
          if (x > 18) return false;
          for (let z = -4; z <= 4; z++) {
            for (let y = 1; y <= 6; y++) {
              if (x === 10 || x === 18 || z === -4 || z === 4) {
                if (!(x === 10 && Math.abs(z) <= 1 && y <= 3)) {
                  addBlock(x, y, z, 'oak_planks');
                }
              }
            }
          }
          return true;
        }
        // Chimney & Roof
        for (let rx = 9; rx <= 19; rx++) {
          for (let rz = -5; rz <= 5; rz++) {
            addBlock(rx, 7, rz, 'quartz');
          }
        }
        for (let cy = 7; cy <= 10; cy++) addBlock(16, cy, 3, 'bricks');
        addBlock(16, 11, 3, 'glowstone');
        break;
      }

      // 3. New Year Tokyo Shrine & Torii Gate
      case 'japan_new_year': {
        // Red Torii Gate
        for (let y = 1; y <= 14; y++) {
          addBlock(-6, y, 0, 'redstone_lamp');
          addBlock(6, y, 0, 'redstone_lamp');
        }
        for (let x = -8; x <= 8; x++) {
          addBlock(x, 11, 0, 'redstone_lamp');
          addBlock(x, 14, 0, 'obsidian');
          addBlock(x, 15, 0, 'obsidian');
        }
        addBlock(0, 12, 0, 'gold_block');

        // Multi-tiered Pagoda
        for (let y = 1; y <= 18; y++) {
          const w = y > 14 ? 3 : (y > 9 ? 5 : 7);
          for (let x = 12; x <= 12 + w; x++) {
            for (let z = -w / 2; z <= w / 2; z++) {
              if (x === 12 || x === 12 + w || Math.abs(z) === Math.floor(w / 2)) {
                addBlock(x, y, Math.round(z), y % 4 === 0 ? 'gold_block' : 'oak_planks');
              }
            }
          }
        }
        // Cherry Blossoms
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

      // 4. Paris Valentine's Bridge & Heart
      case 'paris_valentines': {
        // Wooden Bridge
        for (let z = -7; z <= 7; z++) {
          for (let x = -4; x <= 4; x++) {
            addBlock(x, 1, z, 'oak_planks');
            if (x === -4 || x === 4) addBlock(x, 2, z, 'gold_block');
          }
        }
        // Sculpted Glowing Heart
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

      // 5. Halloween Cemetery & Mausoleum
      case 'halloween_cemetery': {
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
        for (let x = -6; x <= 6; x++) {
          for (let z = -15; z <= -5; z++) addBlock(x, 8, z, 'obsidian');
        }
        const graves = [[-8, -2], [-8, 4], [-4, 2], [-4, 6], [4, -2], [4, 4], [8, 2], [8, 6]];
        graves.forEach(([gx, gz], idx) => {
          addBlock(gx, 1, gz, 'cobblestone');
          addBlock(gx, 2, gz, 'stone');
          if (idx % 2 === 0) {
            addBlock(gx, 3, gz, 'stone');
            addBlock(gx - 1, 3, gz, 'stone');
            addBlock(gx + 1, 3, gz, 'stone');
          }
          addBlock(gx + 1, 1, gz + 1, 'glowstone');
        });
        break;
      }

      // 6. Times Square NYC
      case 'times_square': {
        // West Skyscraper
        for (let y = 1; y <= 35; y++) {
          for (let x = -16; x <= -9; x++) {
            for (let z = -12; z <= 12; z++) {
              if (x === -9 || x === -16 || z === -12 || z === 12) {
                const isBillboard = (x === -9 && y >= 6 && y <= 28 && Math.abs(z) <= 10);
                const blockChoice = isBillboard ?
                  ((y + z) % 3 === 0 ? 'glowstone' : ((y + z) % 3 === 1 ? 'redstone_lamp' : 'diamond_block')) :
                  (y % 3 === 0 ? 'quartz' : 'glass');
                addBlock(x, y, z, blockChoice);
              }
            }
          }
        }
        // East Skyscraper
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
        // TKTS Grandstand
        for (let y = 1; y <= 8; y++) {
          const zStart = 10 + y * 2;
          for (let x = -4; x <= 4; x++) addBlock(x, y, zStart, 'redstone_lamp');
        }
        break;
      }

      // 7. Great Pyramid of Giza & Sphinx
      case 'giza_pyramid': {
        const height = 18;
        for (let y = 1; y <= height; y++) {
          const r = height - y + 1;
          for (let x = -r; x <= r; x++) {
            for (let z = -r; z <= r; z++) {
              if (Math.abs(x) === r || Math.abs(z) === r) {
                addBlock(x, y, z, 'sandstone');
              }
            }
          }
        }
        // Royal Golden Capstone
        addBlock(0, height + 1, 0, 'gold_block');
        addBlock(0, height + 2, 0, 'glowstone');

        // Sphinx Monument
        for (let sx = -3; sx <= 3; sx++) {
          for (let sz = 16; sz <= 24; sz++) {
            for (let sy = 1; sy <= 3; sy++) addBlock(sx, sy, sz, 'sandstone');
          }
        }
        // Sphinx Front Paws
        for (let pz = 12; pz <= 15; pz++) {
          addBlock(-2, 1, pz, 'sandstone');
          addBlock(2, 1, pz, 'sandstone');
        }
        // Sphinx Head & Royal Headdress
        for (let hx = -2; hx <= 2; hx++) {
          for (let hz = 17; hz <= 20; hz++) {
            for (let hy = 4; hy <= 7; hy++) {
              addBlock(hx, hy, hz, hy === 7 ? 'gold_block' : 'sandstone');
            }
          }
        }
        break;
      }

      // 8. Taj Mahal
      case 'taj_mahal': {
        // Central Marble Mausoleum
        for (let y = 1; y <= 12; y++) {
          for (let x = -8; x <= 8; x++) {
            for (let z = -8; z <= 8; z++) {
              if (Math.abs(x) === 8 || Math.abs(z) === 8) {
                // Grand Iwan archway
                const isArch = (z === -8 && Math.abs(x) <= 3 && y <= 8);
                if (!isArch) addBlock(x, y, z, 'quartz');
              }
            }
          }
        }
        // Grand Central Dome
        for (let y = 13; y <= 20; y++) {
          const r = Math.max(1, 6 - (y - 13));
          for (let x = -r; x <= r; x++) {
            for (let z = -r; z <= r; z++) {
              if (x * x + z * z <= r * r) addBlock(x, y, z, 'quartz');
            }
          }
        }
        addBlock(0, 21, 0, 'gold_block');
        addBlock(0, 22, 0, 'gold_block');

        // 4 Corner Minarets
        const minarets = [[-14, -14], [14, -14], [-14, 14], [14, 14]];
        minarets.forEach(([mx, mz]) => {
          for (let y = 1; y <= 18; y++) {
            addBlock(mx, y, mz, 'quartz');
            if (y % 5 === 0) {
              addBlock(mx + 1, y, mz, 'quartz');
              addBlock(mx - 1, y, mz, 'quartz');
              addBlock(mx, y, mz + 1, 'quartz');
              addBlock(mx, y, mz - 1, 'quartz');
            }
          }
          addBlock(mx, 19, mz, 'gold_block');
        });
        break;
      }

      // 9. Colosseum Rome
      case 'colosseum': {
        for (let y = 1; y <= 12; y++) {
          for (let angle = 0; angle < Math.PI * 2; angle += 0.08) {
            const rx = Math.round(Math.cos(angle) * 16);
            const rz = Math.round(Math.sin(angle) * 12);
            // Arched openings
            const isWindow = (y % 4 === 2 || y % 4 === 3) && (Math.round(angle * 10) % 3 === 0);
            if (!isWindow) {
              addBlock(rx, y, rz, y % 2 === 0 ? 'sandstone' : 'cobblestone');
            }
          }
        }
        // Inner Arena Platform
        for (let x = -10; x <= 10; x++) {
          for (let z = -8; z <= 8; z++) {
            if ((x * x) / 100 + (z * z) / 64 <= 1) {
              addBlock(x, 1, z, 'oak_planks');
            }
          }
        }
        break;
      }

      // 10. Burj Khalifa Dubai
      case 'burj_khalifa': {
        for (let y = 1; y <= 42; y++) {
          const r = Math.max(1, 8 - Math.floor(y / 6));
          // Y-shaped wings
          for (let arm = 0; arm < 3; arm++) {
            const angle = (arm * Math.PI * 2) / 3;
            for (let dist = 0; dist <= r; dist++) {
              const bx = Math.round(Math.cos(angle) * dist);
              const bz = Math.round(Math.sin(angle) * dist);
              addBlock(bx, y, bz, (y + dist) % 3 === 0 ? 'quartz' : 'glass');
            }
          }
        }
        // Glowing Needle Spire
        for (let y = 43; y <= 48; y++) addBlock(0, y, 0, 'diamond_block');
        addBlock(0, 49, 0, 'glowstone');
        break;
      }

      // 11. Golden Gate Bridge San Francisco
      case 'golden_gate': {
        // Twin Towers
        const towers = [-12, 12];
        towers.forEach(tx => {
          for (let y = 1; y <= 26; y++) {
            addBlock(tx, y, -3, 'redstone_lamp');
            addBlock(tx, y, 3, 'redstone_lamp');
            if (y % 6 === 0) {
              for (let z = -3; z <= 3; z++) addBlock(tx, y, z, 'redstone_lamp');
            }
          }
          addBlock(tx, 27, -3, 'gold_block');
          addBlock(tx, 27, 3, 'gold_block');
        });
        // Roadway Deck
        for (let x = -24; x <= 24; x++) {
          for (let z = -3; z <= 3; z++) {
            addBlock(x, 6, z, Math.abs(z) === 3 ? 'gold_block' : 'stone');
          }
        }
        break;
      }

      // 12. Big Ben & Westminster
      case 'big_ben': {
        for (let y = 1; y <= 32; y++) {
          for (let x = -3; x <= 3; x++) {
            for (let z = -3; z <= 3; z++) {
              if (Math.abs(x) === 3 || Math.abs(z) === 3) {
                // Clock Faces at y = 20-24
                if (y >= 20 && y <= 24 && (Math.abs(x) === 3 || Math.abs(z) === 3)) {
                  const isCenter = (Math.abs(x) === 3 && z === 0) || (Math.abs(z) === 3 && x === 0);
                  addBlock(x, y, z, isCenter ? 'obsidian' : 'glowstone');
                } else {
                  addBlock(x, y, z, y % 2 === 0 ? 'sandstone' : 'bricks');
                }
              }
            }
          }
        }
        // Belfry & Spire
        for (let y = 33; y <= 40; y++) {
          const r = Math.max(0, 3 - (y - 33));
          for (let x = -r; x <= r; x++) {
            for (let z = -r; z <= r; z++) addBlock(x, y, z, 'quartz');
          }
        }
        addBlock(0, 41, 0, 'gold_block');
        break;
      }

      // 13. Eiffel Tower (Default)
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
          for (let pz = -4; pz <= 4; pz++) addBlock(px, 16, pz, 'quartz');
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
        addBlock(0, 36, 0, 'glowstone');
        addBlock(0, 37, 0, 'diamond_block');
        break;
      }
    }
  }, [getBlockMaterial]);

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

  // Toggle time of day
  const toggleTimeOfDay = () => {
    soundEngine.playClick();
    const nextTime = timeOfDay === 'day' ? 'sunset' : (timeOfDay === 'sunset' ? 'night' : 'day');
    setTimeOfDay(nextTime);

    if (!sceneRef.current) return;
    if (nextTime === 'day') {
      sceneRef.current.background = new THREE.Color(0x87ceeb);
      sceneRef.current.fog = new THREE.FogExp2(0x87ceeb, 0.012);
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0.75;
    } else if (nextTime === 'sunset') {
      sceneRef.current.background = new THREE.Color(0xff7744);
      sceneRef.current.fog = new THREE.FogExp2(0xff7744, 0.015);
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0.55;
    } else {
      sceneRef.current.background = new THREE.Color(0x0a0c18);
      sceneRef.current.fog = new THREE.FogExp2(0x0a0c18, 0.02);
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0.35;
    }
  };

  // MAIN THREE.JS SCENE INITIALIZATION (Runs ONLY when container mounts or landmark ID changes)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.012);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 500);
    cameraRef.current = camera;

    // 3. Renderer with hardware optimizer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    sunLight.position.set(40, 80, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 5. Highlight Wireframe Box for voxel targeted raycast
    const boxGeo = new THREE.BoxGeometry(1.02, 1.02, 1.02);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boxLine = new THREE.LineSegments(
      boxEdges,
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    );
    boxLine.visible = false;
    scene.add(boxLine);
    highlightBoxRef.current = boxLine;

    // 6. Avatar Mesh for 3rd Person
    const avatar = createAvatarMesh(currentSkinRef.current);
    avatar.visible = cameraModeRef.current !== 'first_person';
    scene.add(avatar);
    avatarMeshRef.current = avatar;

    // 7. Weather Particle System
    const particleCount = 1200;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 80;
      particlePositions[i + 1] = Math.random() * 45;
      particlePositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.25,
      transparent: true,
      opacity: 0.7
    });
    const weatherPoints = new THREE.Points(particleGeom, particleMat);
    scene.add(weatherPoints);
    weatherParticlesRef.current = weatherPoints;

    // 8. Generate Landmark Mesh Structure
    generateLandmark(currentLandmark, scene);

    // Set initial spawn location if landmark changed
    if (lastLoadedLandmarkId.current !== currentLandmark.id) {
      lastLoadedLandmarkId.current = currentLandmark.id;
      const spawn = getDefaultSpawnPoint(currentLandmark);
      const safeGroundY = getGroundHeightAt(spawn.x, spawn.z, spawn.y);
      playerPos.current.set(spawn.x, Math.max(spawn.y, safeGroundY), spawn.z);
      playerVelocity.current.set(0, 0, 0);
      cameraYaw.current = spawn.yaw;
      cameraPitch.current = spawn.pitch;
      setCurrentSpawnPoint(spawn);
    }

    // 9. Chunk Engine Setup
    const chunkEngine = new ChunkEngine(blockGeom.current, materialsCache.current);
    chunkEngine.setScene(scene);
    chunkEngineRef.current = chunkEngine;

    // ANIMATION & PHYSICS LOOP
    let lastTime = performance.now();
    let animId: number;
    let walkCycle = 0;
    let frames = 0;
    let lastFpsUpdate = performance.now();

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      frames++;
      if (currentTime - lastFpsUpdate >= 500) {
        const fps = Math.round((frames * 1000) / (currentTime - lastFpsUpdate));
        setCoordsHUD({
          x: Math.round(playerPos.current.x),
          y: Math.round(playerPos.current.y),
          z: Math.round(playerPos.current.z),
          fps: Math.max(30, fps)
        });
        frames = 0;
        lastFpsUpdate = currentTime;
      }

      // Keyboard movement inputs
      let kbForward = 0;
      let kbStrafe = 0;
      if (keysPressed.current['KeyW']) kbForward += 1;
      if (keysPressed.current['KeyS']) kbForward -= 1;
      if (keysPressed.current['KeyA']) kbStrafe -= 1;
      if (keysPressed.current['KeyD']) kbStrafe += 1;

      // Keyboard arrow keys for manual camera rotation
      if (keysPressed.current['ArrowLeft']) cameraYaw.current -= 2.0 * delta;
      if (keysPressed.current['ArrowRight']) cameraYaw.current += 2.0 * delta;
      if (keysPressed.current['ArrowUp']) cameraPitch.current = Math.min(Math.PI / 2.2, cameraPitch.current + 1.5 * delta);
      if (keysPressed.current['ArrowDown']) cameraPitch.current = Math.max(-Math.PI / 2.2, cameraPitch.current - 1.5 * delta);

      // Combine Keyboard, Mobile Touch, and Gamepad inputs
      const totalForward = kbForward + touchMoveInput.current.forward + gamepadMoveInput.current.forward;
      const totalStrafe = kbStrafe + touchMoveInput.current.strafe + gamepadMoveInput.current.strafe;

      const inputMagnitude = Math.sqrt(totalForward * totalForward + totalStrafe * totalStrafe);
      const isMoving = inputMagnitude > 0.05;

      // Speed (Sprinting or Flying)
      const isSprinting = !!keysPressed.current['ShiftLeft'];
      let moveSpeed = isFlyingRef.current ? 16.0 : (isSprinting ? 7.5 : 4.8);

      if (isMoving) {
        walkCycle += delta * (isSprinting ? 14 : 9);
        const normFwd = totalForward / (inputMagnitude > 1 ? inputMagnitude : 1);
        const normStr = totalStrafe / (inputMagnitude > 1 ? inputMagnitude : 1);

        // Convert movement vector relative to current cameraYaw without snapping/modifying cameraYaw
        const moveX = Math.sin(cameraYaw.current) * normFwd + Math.cos(cameraYaw.current) * normStr;
        const moveZ = Math.cos(cameraYaw.current) * normFwd - Math.sin(cameraYaw.current) * normStr;

        playerPos.current.x += moveX * moveSpeed * delta;
        playerPos.current.z += moveZ * moveSpeed * delta;

        // Dynamic chunk updating
        const pChunkX = Math.floor(playerPos.current.x / 16);
        const pChunkZ = Math.floor(playerPos.current.z / 16);
        if (chunkEngineRef.current) {
          chunkEngineRef.current.updatePlayerPosition(pChunkX, pChunkZ);
          setCurrentChunk({ x: pChunkX, z: pChunkZ });
          setLoadedChunksCount(chunkEngineRef.current.getLoadedChunksCount());
          setMemorySavedMb(chunkEngineRef.current.getMemorySavedMb());
        }
      }

      // Jump & Gravity Physics
      const currentGroundY = getGroundHeightAt(playerPos.current.x, playerPos.current.z, playerPos.current.y);
      const isOnGround = Math.abs(playerPos.current.y - currentGroundY) < 0.15;

      if (isFlyingRef.current) {
        // Flight Controls
        playerVelocity.current.y = 0;
        if (keysPressed.current['Space'] || jumpRequested.current) playerPos.current.y += 9.0 * delta;
        if (keysPressed.current['ShiftLeft']) playerPos.current.y -= 9.0 * delta;
        if (playerPos.current.y < currentGroundY) playerPos.current.y = currentGroundY;
      } else {
        // Ground physics with gravity
        if ((keysPressed.current['Space'] || jumpRequested.current) && isOnGround) {
          playerVelocity.current.y = 8.5; // Minecraft jump velocity
          soundEngine.playJump();
        }

        playerVelocity.current.y -= 24 * delta;
        playerPos.current.y += playerVelocity.current.y * delta;

        // Solid landing
        if (playerPos.current.y <= currentGroundY) {
          playerPos.current.y = currentGroundY;
          playerVelocity.current.y = 0;
        }

        // Void protection respawn
        if (playerPos.current.y < -25) {
          const safeSpawn = getDefaultSpawnPoint(currentLandmark);
          const safeGround = getGroundHeightAt(safeSpawn.x, safeSpawn.z, safeSpawn.y);
          playerPos.current.set(safeSpawn.x, Math.max(safeSpawn.y, safeGround), safeSpawn.z);
          playerVelocity.current.set(0, 0, 0);
          cameraYaw.current = safeSpawn.yaw;
          cameraPitch.current = safeSpawn.pitch;
          soundEngine.playTeleport();
        }
      }

      jumpRequested.current = false;

      // CAMERA PERSPECTIVE POSITIONING
      const currentCameraMode = cameraModeRef.current;
      if (avatarMeshRef.current) {
        avatarMeshRef.current.visible = currentCameraMode !== 'first_person';
      }

      if (currentCameraMode === 'third_person_back') {
        // Trailing Camera behind player
        const dist = 4.8;
        const cx = playerPos.current.x - Math.sin(cameraYaw.current) * dist * Math.cos(cameraPitch.current);
        const cy = playerPos.current.y + 1.8 + Math.sin(cameraPitch.current) * dist;
        const cz = playerPos.current.z - Math.cos(cameraYaw.current) * dist * Math.cos(cameraPitch.current);
        camera.position.set(cx, cy, cz);
        camera.lookAt(playerPos.current.x, playerPos.current.y + 1.2, playerPos.current.z);

        if (avatarMeshRef.current) {
          avatarMeshRef.current.position.set(playerPos.current.x, playerPos.current.y - 1.0, playerPos.current.z);
          avatarMeshRef.current.rotation.y = cameraYaw.current;

          if (avatarPartsRef.current) {
            const legSwing = Math.sin(walkCycle) * 0.6;
            avatarPartsRef.current.leftLeg.rotation.x = isMoving ? legSwing : 0;
            avatarPartsRef.current.rightLeg.rotation.x = isMoving ? -legSwing : 0;
            avatarPartsRef.current.leftArm.rotation.x = isMoving ? -legSwing : 0;
            avatarPartsRef.current.rightArm.rotation.x = isMoving ? legSwing : 0;
            avatarPartsRef.current.head.rotation.x = cameraPitch.current * 0.5;
          }
        }
      } else if (currentCameraMode === 'third_person_front') {
        // Front Selfie Camera facing player
        const dist = 4.2;
        const cx = playerPos.current.x + Math.sin(cameraYaw.current) * dist * Math.cos(cameraPitch.current);
        const cy = playerPos.current.y + 1.8 - Math.sin(cameraPitch.current) * dist;
        const cz = playerPos.current.z + Math.cos(cameraYaw.current) * dist * Math.cos(cameraPitch.current);
        camera.position.set(cx, cy, cz);
        camera.lookAt(playerPos.current.x, playerPos.current.y + 1.3, playerPos.current.z);

        if (avatarMeshRef.current) {
          avatarMeshRef.current.position.set(playerPos.current.x, playerPos.current.y - 1.0, playerPos.current.z);
          avatarMeshRef.current.rotation.y = cameraYaw.current;

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

      // Weather Particles Drift
      if (weatherParticlesRef.current) {
        const positions = weatherParticlesRef.current.geometry.attributes.position.array as Float32Array;
        const activeWeather = weatherSeasonService.getCurrentState().weather;

        for (let i = 0; i < positions.length; i += 3) {
          if (activeWeather === 'rain' || activeWeather === 'thunder') {
            positions[i + 1] -= delta * 35;
          } else if (activeWeather === 'snow') {
            positions[i + 1] -= delta * 8;
            positions[i] += Math.sin(currentTime * 0.002 + i) * 0.05;
          } else {
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

      // Raycasting for target block selection
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
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

        if (highlightBoxRef.current) {
          highlightBoxRef.current.position.set(bx, by, bz);
          highlightBoxRef.current.visible = true;
        }
        setCrosshairActive(true);

        if (blockData) {
          const info = getVoxelArchitecturalInfo(currentLandmark, blockData.type, bx, by, bz);
          setHoveredArchInfo(info);
          setHoveredBlockType(blockData.type);
          setHoveredBlockCoords({ x: bx, y: by, z: bz });
        }

        // Mining action
        if (isMining.current) {
          if (!miningTarget.current || miningTarget.current.key !== key) {
            miningTarget.current = { key, mesh: hitMesh, x: bx, y: by, z: bz };
            miningProgress.current = 0;
          }
          miningProgress.current += delta;
          if (miningProgress.current >= 0.45) {
            scene.remove(hitMesh);
            hitMesh.geometry.dispose();
            blocksMapRef.current.delete(key);
            soundEngine.playBreak(blockData?.type || 'stone');
            if (onBlockBrokenRef.current) onBlockBrokenRef.current();
            miningTarget.current = null;
            miningProgress.current = 0;
          }
        }
      } else {
        if (highlightBoxRef.current) highlightBoxRef.current.visible = false;
        setCrosshairActive(false);
        setHoveredArchInfo(null);
        setHoveredBlockType('');
        setHoveredBlockCoords(null);
        miningTarget.current = null;
        miningProgress.current = 0;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Event Listeners
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      // Slot keys 1-9
      if (e.code.startsWith('Digit')) {
        const digit = parseInt(e.code.replace('Digit', ''), 10);
        if (digit >= 1 && digit <= 9) {
          setSelectedBlockIdx(digit - 1);
          soundEngine.playClick();
        }
      }
      if (e.code === 'KeyF') {
        setIsFlying(prev => !prev);
        soundEngine.playClick();
      }
      if (e.code === 'KeyV' || e.code === 'F5') {
        e.preventDefault();
        cycleCameraMode();
      }
      if (e.code === 'KeyE') {
        if (onOpenInventoryRef.current) onOpenInventoryRef.current();
      }
      if (e.code === 'KeyM') {
        if (onToggleMapRef.current) onToggleMapRef.current();
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

      if (e.button === 0) {
        isMining.current = true;
        miningProgress.current = 0;
      } else if (e.button === 2) {
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
            const blockType = BLOCK_PALETTE[selectedBlockIdxRef.current]?.id || 'stone';
            const mat = getBlockMaterial(blockType);
            const mesh = new THREE.Mesh(blockGeom.current, mat);
            mesh.position.set(newX, newY, newZ);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            blocksMapRef.current.set(newKey, { x: newX, y: newY, z: newZ, type: blockType, mesh });
            soundEngine.playPlace(blockType);
            if (onBlockPlacedRef.current) onBlockPlacedRef.current();
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
    };
  }, [currentLandmark.id, generateLandmark, getBlockMaterial, createAvatarMesh, getGroundHeightAt]);

  // Mobile Touch Movement Callback
  const handleTouchMove = (forward: number, strafe: number) => {
    touchMoveInput.current = { forward, strafe };
  };

  // Mobile Touch Look Callback (Pan rotation without auto-snapping)
  const handleTouchLook = (deltaYaw: number, deltaPitch: number) => {
    cameraYaw.current += deltaYaw;
    cameraPitch.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, cameraPitch.current - deltaPitch));
  };

  const handleTouchJump = () => {
    jumpRequested.current = true;
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
      if (onBlockBrokenRef.current) onBlockBrokenRef.current();
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
        const blockType = BLOCK_PALETTE[selectedBlockIdxRef.current]?.id || 'stone';
        const mat = getBlockMaterial(blockType);
        const mesh = new THREE.Mesh(blockGeom.current, mat);
        mesh.position.set(newX, newY, newZ);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        sceneRef.current.add(mesh);
        blocksMapRef.current.set(newKey, { x: newX, y: newY, z: newZ, type: blockType, mesh });
        soundEngine.playPlace(blockType);
        if (onBlockPlacedRef.current) onBlockPlacedRef.current();
      }
    }
  };

  const handleGamepadInput = (fwd: number, str: number, lookYaw: number, lookPitch: number, jump: boolean) => {
    gamepadMoveInput.current = { forward: fwd, strafe: str };
    cameraYaw.current += lookYaw;
    cameraPitch.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, cameraPitch.current - lookPitch));
    if (jump) jumpRequested.current = true;
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

        {/* Download Game (PC / APK / IPA) */}
        {onOpenDownload && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenDownload();
            }}
            className="mc-btn px-2.5 py-1.5 text-[10px] flex items-center gap-1 cursor-pointer text-emerald-300 font-bold border-emerald-500/80"
            title="Download Game (PC Launcher, Android APK, iOS IPA, Game Icons)"
            id="btn-hud-download-game"
          >
            📥 Download
          </button>
        )}

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
        [Click Screen to Look] • Left Click: Mine • Right Click: Place • WASD: Move • Space: Jump • F: Fly • E: Inventory • M: Maps • V: 3rd Person
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

      {/* Developer Credits Modal */}
      {showCreditsModal && (
        <DeveloperCreditsModal
          onClose={() => setShowCreditsModal(false)}
        />
      )}
    </div>
  );
};
