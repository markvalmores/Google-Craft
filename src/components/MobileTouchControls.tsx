// Mobile Touch Controls for iPhone, iPad & Android Devices
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { soundEngine } from '../services/soundEngine';

interface MobileTouchControlsProps {
  onMove: (forward: number, strafe: number) => void;
  onLook: (deltaYaw: number, deltaPitch: number) => void;
  onJump: () => void;
  onCrouch: (crouching: boolean) => void;
  onFlyToggle: () => void;
  onBreakBlock: () => void;
  onPlaceBlock: () => void;
  onOpenInventory: () => void;
  onTogglePerspective: () => void;
  onToggleMap: () => void;
  isFlying: boolean;
  isThirdPerson?: boolean;
  cameraMode?: 'first_person' | 'third_person_back' | 'third_person_front';
}

export const MobileTouchControls: React.FC<MobileTouchControlsProps> = ({
  onMove,
  onLook,
  onJump,
  onCrouch,
  onFlyToggle,
  onBreakBlock,
  onPlaceBlock,
  onOpenInventory,
  onTogglePerspective,
  onToggleMap,
  isFlying,
  isThirdPerson,
  cameraMode = isThirdPerson ? 'third_person_back' : 'first_person',
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isSprinting, setIsSprinting] = useState(false);
  
  // Dedicated multi-touch IDs to completely prevent conflict between Movement and Camera Look
  const moveTouchIdRef = useRef<number | null>(null);
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMiningTouch, setIsMiningTouch] = useState(false);
  const mineIntervalRef = useRef<number | null>(null);

  // Smooth virtual analog joystick calculation
  const updateJoystick = useCallback((clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = (rect.width / 2) - 6;

    let clampedX = dx;
    let clampedY = dy;
    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    // Normalized move inputs (-1.0 to 1.0) with slight deadzone
    const rawNormX = clampedX / maxRadius;
    const rawNormY = clampedY / maxRadius;
    const normDist = Math.hypot(rawNormX, rawNormY);

    if (normDist < 0.08) {
      onMove(0, 0);
      setIsSprinting(false);
    } else {
      // dy < 0 is forward, dx > 0 is strafe right
      const forward = -rawNormY;
      const strafe = rawNormX;
      setIsSprinting(normDist > 0.85);
      onMove(forward, strafe);
    }
  }, [onMove]);

  // Movement Joystick Touch Handlers
  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (moveTouchIdRef.current !== null) return;
    
    // Pick the touch on the joystick base
    const touch = e.changedTouches[0];
    moveTouchIdRef.current = touch.identifier;
    setJoystickActive(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === moveTouchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === moveTouchIdRef.current) {
        moveTouchIdRef.current = null;
        setJoystickActive(false);
        setIsSprinting(false);
        setKnobPos({ x: 0, y: 0 });
        onMove(0, 0);
        break;
      }
    }
  };

  // Dedicated Right-Screen Camera Look Handlers (No auto-snap, zero conflict with movement)
  const handleLookTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (lookTouchIdRef.current !== null) return;
    
    const touch = e.changedTouches[0];
    lookTouchIdRef.current = touch.identifier;
    lastLookPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        const dy = touch.clientY - lastLookPos.current.y;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };

        // Silky smooth camera sensitivity without snap-back
        const sensitivity = 0.0042;
        onLook(dx * sensitivity, dy * sensitivity);
        break;
      }
    }
  };

  const handleLookTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        break;
      }
    }
  };

  // Mine / Attack with continuous tap or hold
  const startMining = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
    setIsMiningTouch(true);
    onBreakBlock();
    if (mineIntervalRef.current) clearInterval(mineIntervalRef.current);
    mineIntervalRef.current = window.setInterval(() => {
      onBreakBlock();
    }, 220);
  };

  const stopMining = () => {
    setIsMiningTouch(false);
    if (mineIntervalRef.current) {
      clearInterval(mineIntervalRef.current);
      mineIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (mineIntervalRef.current) clearInterval(mineIntervalRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden" id="mobile-touch-root">
      {/* Right and Upper Screen Touch Surface for Camera Look Panning */}
      <div
        className="absolute top-12 right-0 w-[60vw] bottom-28 pointer-events-auto touch-none"
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        onTouchCancel={handleLookTouchEnd}
        id="touch-look-surface"
      />

      {/* Top Left Screen Area for Look Panning when not touching Joystick */}
      <div
        className="absolute top-12 left-0 w-[40vw] h-[40vh] pointer-events-auto touch-none"
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        onTouchCancel={handleLookTouchEnd}
        id="touch-look-surface-topleft"
      />

      {/* Bottom Left Virtual Analog Joystick Dock */}
      <div className="absolute bottom-5 left-5 pointer-events-auto touch-none flex flex-col items-center" id="mobile-joystick-dock">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={handleJoystickTouchEnd}
          className={`relative w-32 h-32 rounded-full border-2 bg-stone-950/70 backdrop-blur-md transition-all flex items-center justify-center ${
            joystickActive
              ? 'border-amber-400 bg-stone-950/85 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
              : 'border-stone-600/90 shadow-2xl'
          }`}
          id="virtual-joystick-base"
        >
          {/* Outer Ring & Directional Guides */}
          <div className="absolute inset-2 rounded-full border border-dashed border-stone-600/50 pointer-events-none" />
          
          {/* Directional Arrows */}
          <span className="absolute top-1.5 text-[10px] text-stone-400 font-minecraft pointer-events-none">▲</span>
          <span className="absolute bottom-1.5 text-[10px] text-stone-400 font-minecraft pointer-events-none">▼</span>
          <span className="absolute left-1.5 text-[10px] text-stone-400 font-minecraft pointer-events-none">◄</span>
          <span className="absolute right-1.5 text-[10px] text-stone-400 font-minecraft pointer-events-none">►</span>

          {/* Center neutral deadzone ring */}
          <div className="w-6 h-6 rounded-full border border-stone-700/60 pointer-events-none" />

          {/* Movable Smooth Analog Knob */}
          <div
            className={`absolute w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-2xl pointer-events-none transition-shadow ${
              isSprinting
                ? 'bg-gradient-to-b from-amber-500 to-amber-700 border-yellow-200 shadow-[0_0_15px_rgba(251,191,36,0.6)] text-stone-950 font-bold'
                : joystickActive
                ? 'bg-gradient-to-b from-stone-600 to-stone-800 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)] text-white'
                : 'bg-gradient-to-b from-stone-700 to-stone-900 border-stone-500 text-stone-300'
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: joystickActive ? 'none' : 'transform 0.15s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
            }}
            id="virtual-joystick-knob"
          >
            <span className="text-xs font-minecraft select-none">{isSprinting ? '⚡' : '🕹️'}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`text-[9px] font-minecraft uppercase tracking-wider px-1.5 py-0.5 rounded ${
            isSprinting ? 'bg-amber-500/80 text-stone-950 font-bold' : 'text-stone-400'
          }`}>
            {isSprinting ? 'SPRINT' : 'WALK / STRAFE'}
          </span>
        </div>
      </div>

      {/* Bottom Right Mobile Action Buttons Dock */}
      <div className="absolute bottom-5 right-5 pointer-events-auto flex items-end gap-2.5" id="mobile-actions-dock">
        {/* Secondary Actions Column */}
        <div className="flex flex-col gap-2">
          {/* Fly Toggle */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              soundEngine.playClick();
              onFlyToggle();
            }}
            className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center text-sm font-minecraft shadow-lg active:scale-95 transition-transform ${
              isFlying
                ? 'bg-amber-500 border-amber-300 text-stone-950 font-bold'
                : 'bg-stone-900/90 border-stone-600 text-stone-200'
            }`}
            title="Toggle Fly"
            id="mobile-btn-fly"
          >
            🪽
          </button>

          {/* Perspective F5 */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              soundEngine.playClick();
              onTogglePerspective();
            }}
            className={`w-11 h-11 rounded-lg border-2 flex flex-col items-center justify-center text-xs shadow-lg active:scale-95 transition-all ${
              cameraMode !== 'first_person'
                ? 'bg-purple-900/90 border-purple-400 text-purple-200'
                : 'bg-stone-900/90 border-stone-600 text-stone-200'
            }`}
            title="Toggle Perspective (1st / 3rd Back / 3rd Front)"
            id="mobile-btn-camera"
          >
            <span>{cameraMode === 'first_person' ? '📷' : (cameraMode === 'third_person_back' ? '🎥' : '🤳')}</span>
            <span className="text-[7px] font-pixel uppercase font-bold">
              {cameraMode === 'first_person' ? '1st' : (cameraMode === 'third_person_back' ? '3rd' : 'Self')}
            </span>
          </button>
        </div>

        {/* Primary Action Controls (Break, Place, Sneak, Jump) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Mine / Break Block Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              startMining();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopMining();
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              stopMining();
            }}
            className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center shadow-xl active:scale-90 transition-all ${
              isMiningTouch
                ? 'bg-rose-600 border-rose-300 text-white scale-95 shadow-[0_0_15px_rgba(225,29,72,0.6)]'
                : 'bg-rose-950/90 border-rose-700 text-rose-200 hover:bg-rose-900/90'
            }`}
            id="mobile-btn-break"
          >
            <span className="text-lg">⛏️</span>
            <span className="text-[9px] font-minecraft font-bold">BREAK</span>
          </button>

          {/* Place Block Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
              onPlaceBlock();
            }}
            className="w-14 h-14 rounded-xl border-2 border-emerald-600 bg-emerald-950/90 text-emerald-200 flex flex-col items-center justify-center shadow-xl active:scale-90 hover:bg-emerald-900/90 transition-all"
            id="mobile-btn-place"
          >
            <span className="text-lg">🧱</span>
            <span className="text-[9px] font-minecraft font-bold">PLACE</span>
          </button>

          {/* Crouch / Sneak */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onCrouch(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onCrouch(false);
            }}
            className="w-14 h-12 rounded-xl border-2 border-stone-600 bg-stone-900/90 text-stone-200 flex items-center justify-center text-xs font-minecraft shadow-lg active:scale-95"
            id="mobile-btn-crouch"
          >
            ⬇️ SNEAK
          </button>

          {/* Jump Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
              onJump();
            }}
            className="w-14 h-12 rounded-xl border-2 border-cyan-500 bg-cyan-950/90 text-cyan-200 flex items-center justify-center text-xs font-minecraft font-bold shadow-lg active:scale-95"
            id="mobile-btn-jump"
          >
            ⬆️ JUMP
          </button>
        </div>
      </div>
    </div>
  );
};
