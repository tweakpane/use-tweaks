import React from "react";
import { Canvas } from "react-three-fiber";
import { OrbitControls } from "drei";
import {EffectComposer, ChromaticAberration } from 'react-postprocessing'
import Scene from "./Scene2";
import useTweaks2 from "./useTweaks2";

function App() {
  const { offset } = useTweaks2("effects", {
    offset: { value: { x: 0, y: 0 }}
  })
  
  return (
    <>
      <Canvas
        shadowMap
        colorManagement
        camera={{ position: [0, 0, -4], far: 50 }}
        style={{
          background: "#121212"
        }}
        concurrent
      >
        <OrbitControls />

        <pointLight position={[0, 1, 0]} />

        <directionalLight position={[-1, 0, 0]} intensity={0.1} />
        <directionalLight position={[1, 0, 0]} intensity={0.2} />

        <Scene />
        <EffectComposer>
          <ChromaticAberration offset={[offset.x/1000, offset.y/1000]} />
        </EffectComposer>
      </Canvas>
      <div className="test">
        <div className="tfirst" />
        <div className="tsecond" />
        <div className="teffects" />
      </div>
    </>
  );
}

export default App;
