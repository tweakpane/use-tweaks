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
      <GUIRoot>

        <Folder title="Common">
          {/* @NOTE if value is omitted in select panes, it should default to the first key */}
          <Input
            name="speed"
            value={"low"}
            options={{ low: 10, medium: 50, high: 100 }}
            transform={(value) => parseInt(value, 10)}
          />
          <Input name="rotate on y" value={true} />
          <Input name="point" value={{ x: 0, y: 0 }} x={{ min: -2, max: 2 }} y={{ min: -2, max: 2 }} />
        </Folder>

        
        <Folder title={"Left"}>
          {/* @NOTE maybe handle all colors without having the user worry (dedicated <Color /> component?) */}
          <Input name="color" value={{ r: 151, g: 45, b: 255, a: 1 }} />
        
        </Folder>

        <Folder title={"Right"}>
          {/* @NOTE maybe handle all colors without having the user worry (dedicated <Color /> component?) */}
          <Input name="right-color" value={{ r: 0, g: 45, b: 255, a: 1 }} />
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
