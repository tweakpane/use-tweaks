import React from "react";
import { Canvas } from "react-three-fiber";
import { Box, OrbitControls } from "@react-three/drei";

import Effects from "./Effects";

import Scene from "./Scene";

function App() {
  return (
    <>
      <Canvas
        shadowMap
        colorManagement
        camera={{ position: [0, 0, 7], far: 50 }}
        style={{
          background: "#121212",
        }}
        concurrent
      >
        <OrbitControls />
        <pointLight position={[0, 1, 0]} />

        <directionalLight position={[-1, 0, 0]} intensity={0.1} />
        <directionalLight position={[1, 0, 0]} intensity={0.2} />

        <Scene />
        {/* <Effects /> */}
      </Canvas>
    </>
  );
}

export default App;
