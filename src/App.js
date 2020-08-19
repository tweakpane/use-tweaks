import React from "react";
import { Canvas } from "react-three-fiber";
import { OrbitControls } from "drei";
import Scene from "./Scene";

import { GUIRoot, Input, Folder } from "./GUI";

function App() {
  return (
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
      <GUIRoot
        initialValues={{
          speed: 0,
          color: { r: 10, g: 20, b: 100 },
          "right-color": { r: 120, g: 20, b: 100 },
        }}
      >

        <Folder title="Common">
          {/* @NOTE if value is omitted in select panes, it should default to the first key */}
          <Input
            name="speed"
            value={"low"}
            options={{ low: 10, medium: 50, high: 100 }}
            transform={(value) => parseInt(value, 10)}
          />
        </Folder>

        
        <Folder title={"Left"}>
          {/* @NOTE maybe handle all colors without having the user worry (dedicated <Color /> component?) */}
          <Input name="color" />
        
        </Folder>

        <Folder title={"Right"}>
          {/* @NOTE maybe handle all colors without having the user worry (dedicated <Color /> component?) */}
          <Input name="right-color" />
        </Folder>
        
      </GUIRoot>

      <pointLight position={[0, 1, 0]} />

      <directionalLight position={[-1, 0, 0]} intensity={0.1} />
      <directionalLight position={[1, 0, 0]} intensity={0.2} />

      <Scene />
    </Canvas>
  );
}

export default App;
