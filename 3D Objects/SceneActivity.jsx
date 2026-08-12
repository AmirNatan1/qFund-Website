import React, { createContext, useContext } from 'react';
import { useFrame as useFiberFrame } from '@react-three/fiber';

const SceneActivityContext = createContext({ active: true, maxFps: 30 });

export function SceneActivity({ active, maxFps = 30, children }) {
  return (
    <SceneActivityContext.Provider value={{ active, maxFps }}>
      {children}
    </SceneActivityContext.Provider>
  );
}

/** Keep preloaded scene graphs mounted without running their frame callbacks. */
export function useActiveFrame(callback, priority) {
  const { active, maxFps } = useContext(SceneActivityContext);
  const elapsed = React.useRef(0);
  useFiberFrame((state, delta, xrFrame) => {
    if (!active) return;
    elapsed.current += delta;
    const interval = 1 / maxFps;
    if (elapsed.current < interval) return;
    const step = elapsed.current;
    elapsed.current %= interval;
    callback(state, step, xrFrame);
  }, priority);
}
