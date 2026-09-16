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
  const touchIdRef = useRef<number | null>(null);
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMiningTouch, setIsMiningTouch] = useState(false);
  const mineIntervalRef = useRef<number | null>(null);

  // Joystick touch handlers
  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setJoystickActive(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const updateJoystick = useCallback((clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2 - 10;

    let clampedX = dx;
    let clampedY = dy;
    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    // Normalized move inputs (-1 to 1)
    const normX = clampedX / maxRadius;
    const normY = clampedY / maxRadius;

    // dy < 0 means forward, dx > 0 means strafe right
    onMove(-normY, normX);
  }, [onMove]);

  const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setJoystickActive(false);
        setKnobPos({ x: 0, y: 0 });
        onMove(0, 0);
        break;
      }
    }
  };

  // Right-screen Look Touch Handlers
  const handleLookTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    lookTouchIdRef.current = touch.identifier;
    lastLookPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        const dy = touch.clientY - lastLookPos.current.y;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };

        const sensitivity = 0.005;
        onLook(dx * sensitivity, dy * sensitivity);
        break;
      }
    }
  };

  const handleLookTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
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
    }, 250);
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
      {/* Right screen touch surface for Camera Look panning */}
      <div
        className="absolute top-16 right-0 w-1/2 bottom-28 pointer-events-auto touch-none"
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        onTouchCancel={handleLookTouchEnd}
        id="touch-look-surface"
      />

      {/* Bottom Left Virtual Analog Joystick */}
      <div className="absolute bottom-6 left-6 pointer-events-auto touch-none flex flex-col items-center" id="mobile-joystick-dock">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={handleJoystickTouchEnd}
          className={`relative w-28 h-28 rounded-full border-2 bg-stone-900/60 backdrop-blur-sm transition-colors flex items-center justify-center ${
            joystickActive ? 'border-amber-400 bg-stone-900/80 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'border-stone-600/80'
          }`}
          id="virtual-joystick-base"
        >
          {/* D-Pad cross markings */}
          <div className="absolute w-full h-0.5 bg-stone-700/50 pointer-events-none" />
          <div className="absolute h-full w-0.5 bg-stone-700/50 pointer-events-none" />

          {/* Movable Knob */}
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-b from-stone-600 to-stone-800 border-2 border-amber-400/90 shadow-lg flex items-center justify-center text-xs font-minecraft text-white pointer-events-none transform transition-transform duration-75"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
            }}
            id="virtual-joystick-knob"
          >
            🕹️
          </div>
        </div>
        <span className="text-[10px] font-pixel text-stone-400 mt-1">MOVE & STRAFE</span>
      </div>

      {/* Bottom Right Mobile Action Buttons */}
      <div className="absolute bottom-6 right-6 pointer-events-auto flex items-end gap-3" id="mobile-actions-dock">
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
                ? 'bg-amber-500/90 border-amber-300 text-stone-950 font-bold'
                : 'bg-stone-900/80 border-stone-600 text-stone-200'
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
                : 'bg-stone-900/80 border-stone-600 text-stone-200'
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

        {/* Primary Action Controls (Break, Place, Jump) */}
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
                : 'bg-rose-950/80 border-rose-700 text-rose-200 hover:bg-rose-900/80'
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
            className="w-14 h-14 rounded-xl border-2 border-emerald-600 bg-emerald-950/80 text-emerald-200 flex flex-col items-center justify-center shadow-xl active:scale-90 hover:bg-emerald-900/80 transition-all"
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
            className="w-14 h-12 rounded-xl border-2 border-stone-600 bg-stone-900/80 text-stone-200 flex items-center justify-center text-xs font-minecraft shadow-lg active:scale-95"
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
            className="w-14 h-12 rounded-xl border-2 border-cyan-500 bg-cyan-950/80 text-cyan-200 flex items-center justify-center text-xs font-minecraft font-bold shadow-lg active:scale-95"
            id="mobile-btn-jump"
          >
            ⬆️ JUMP
          </button>
        </div>
      </div>
    </div>
  );
};
