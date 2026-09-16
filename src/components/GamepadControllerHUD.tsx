// Universal Gamepad Controller Support (PlayStation, Xbox, Android & iOS Gamepads)
import React, { useEffect, useState, useRef } from 'react';

export interface GamepadState {
  connected: boolean;
  id: string;
  type: 'PlayStation' | 'Xbox' | 'Generic / Mobile';
}

interface GamepadControllerHUDProps {
  onGamepadInput?: (inputs: {
    moveX: number; // Left Stick X
    moveY: number; // Left Stick Y
    lookX: number; // Right Stick X
    lookY: number; // Right Stick Y
    jump: boolean; // Cross / A
    crouch: boolean; // Circle / B
    breakBlock: boolean; // R2 / RT
    placeBlock: boolean; // L2 / LT
    toggleFly: boolean; // Triangle / Y
    inventory: boolean; // Square / X
    cycleHotbar: number; // -1 (L1/LB) or +1 (R1/RB)
    toggleMap: boolean; // Select / Share
    pauseMenu: boolean; // Start / Options
  }) => void;
}

export const GamepadControllerHUD: React.FC<GamepadControllerHUDProps> = ({ onGamepadInput }) => {
  const [gamepadInfo, setGamepadInfo] = useState<GamepadState>({
    connected: false,
    id: '',
    type: 'Generic / Mobile'
  });
  const [showNotification, setShowNotification] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const prevButtonsRef = useRef<{ [key: number]: boolean }>({});

  useEffect(() => {
    const handleConnected = (e: GamepadEvent) => {
      const pad = e.gamepad;
      let type: 'PlayStation' | 'Xbox' | 'Generic / Mobile' = 'Generic / Mobile';
      const idLower = pad.id.toLowerCase();
      if (idLower.includes('dualshock') || idLower.includes('dualsense') || idLower.includes('sony') || idLower.includes('playstation')) {
        type = 'PlayStation';
      } else if (idLower.includes('xbox') || idLower.includes('microsoft') || idLower.includes('x-box')) {
        type = 'Xbox';
      }

      setGamepadInfo({
        connected: true,
        id: pad.id.replace(/\(.*\)/, '').slice(0, 24),
        type
      });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
    };

    const handleDisconnected = () => {
      setGamepadInfo({
        connected: false,
        id: '',
        type: 'Generic / Mobile'
      });
    };

    window.addEventListener('gamepadconnected', handleConnected);
    window.addEventListener('gamepaddisconnected', handleDisconnected);

    // Gamepad input polling loop
    let animId: number;
    const pollGamepad = () => {
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        const activePad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

        if (activePad && activePad.connected) {
          if (!gamepadInfo.connected) {
            let type: 'PlayStation' | 'Xbox' | 'Generic / Mobile' = 'Generic / Mobile';
            const idLower = activePad.id.toLowerCase();
            if (idLower.includes('dualshock') || idLower.includes('dualsense') || idLower.includes('sony')) {
              type = 'PlayStation';
            } else if (idLower.includes('xbox') || idLower.includes('microsoft')) {
              type = 'Xbox';
            }
            setGamepadInfo({
              connected: true,
              id: activePad.id.slice(0, 24),
              type
            });
          }

          // Apply deadzone
          const applyDeadzone = (val: number, threshold = 0.15) => {
            return Math.abs(val) < threshold ? 0 : val;
          };

          const moveX = applyDeadzone(activePad.axes[0] || 0);
          const moveY = applyDeadzone(activePad.axes[1] || 0);
          const lookX = applyDeadzone(activePad.axes[2] || 0);
          const lookY = applyDeadzone(activePad.axes[3] || 0);

          // Standard Gamepad mapping:
          // 0: A / Cross
          // 1: B / Circle
          // 2: X / Square
          // 3: Y / Triangle
          // 4: L1 / LB
          // 5: R1 / RB
          // 6: L2 / LT (analog trigger or button)
          // 7: R2 / RT
          // 8: Select / Share
          // 9: Start / Options
          const btns = activePad.buttons;
          const isPressed = (idx: number) => {
            if (!btns[idx]) return false;
            return typeof btns[idx] === 'object' ? btns[idx].pressed || btns[idx].value > 0.5 : btns[idx] === 1.0;
          };

          const justPressed = (idx: number) => {
            const current = isPressed(idx);
            const prev = prevButtonsRef.current[idx] || false;
            prevButtonsRef.current[idx] = current;
            return current && !prev;
          };

          let cycleHotbar = 0;
          if (justPressed(4)) cycleHotbar = -1; // LB / L1
          if (justPressed(5)) cycleHotbar = 1;  // RB / R1

          if (onGamepadInput) {
            onGamepadInput({
              moveX,
              moveY,
              lookX,
              lookY,
              jump: isPressed(0), // A / Cross
              crouch: isPressed(1), // B / Circle
              inventory: justPressed(2), // X / Square
              toggleFly: justPressed(3), // Y / Triangle
              placeBlock: justPressed(6) || isPressed(6), // L2 / LT
              breakBlock: isPressed(7), // R2 / RT
              cycleHotbar,
              toggleMap: justPressed(8), // Select
              pauseMenu: justPressed(9), // Start
            });
          }
        }
      }
      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnected);
      window.removeEventListener('gamepaddisconnected', handleDisconnected);
      cancelAnimationFrame(animId);
    };
  }, [gamepadInfo.connected, onGamepadInput]);

  if (!gamepadInfo.connected && !showNotification) return null;

  return (
    <div className="fixed top-16 left-4 z-40 pointer-events-auto" id="gamepad-hud-widget">
      {/* Connected Toast */}
      {showNotification && (
        <div className="bg-emerald-950/95 border-2 border-emerald-500 text-emerald-200 px-3 py-2 text-xs font-minecraft shadow-2xl flex items-center gap-2 rounded animate-bounce">
          <span className="text-base">🎮</span>
          <div>
            <div className="font-bold text-white">CONTROLLER CONNECTED!</div>
            <div className="text-[10px] text-emerald-300">{gamepadInfo.id} ({gamepadInfo.type})</div>
          </div>
        </div>
      )}

      {/* Controller Helper Strip */}
      {gamepadInfo.connected && !showNotification && (
        <div className="bg-stone-900/85 backdrop-blur-md border border-stone-700/90 text-[10px] font-minecraft text-stone-300 px-2.5 py-1 shadow-lg flex items-center gap-2">
          <span className="text-amber-400">🎮 {gamepadInfo.type} Active</span>
          {!collapsed ? (
            <div className="flex items-center gap-1.5 text-[9px] text-stone-400">
              <span>• R2: Mine</span>
              <span>• L2: Place</span>
              <span>• A: Jump</span>
              <span>• LB/RB: Hotbar</span>
              <button
                onClick={() => setCollapsed(true)}
                className="text-stone-500 hover:text-stone-300 ml-1 cursor-pointer"
              >
                [Hide]
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              className="text-stone-400 hover:text-white cursor-pointer ml-1"
            >
              [Help]
            </button>
          )}
        </div>
      )}
    </div>
  );
};
