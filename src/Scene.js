import * as THREE from "three";
import React, { useMemo, useRef, useEffect } from "react";
import { Octahedron } from "drei";
import { useFrame } from "react-three-fiber";

import { useGUI } from "./GUI";

function Scene() {
  // the defaults are in place only because the ideal method isn't working
  const [speed = 10, color, rotateOnY] = useGUI(
    "speed",
    "color",
    "rotate on y"
  );

  const ref = useRef();

  useEffect(() => {
    console.log("Scene Update");
  });

  useFrame(({ clock }) => {
    const geo = ref.current;
    geo.rotation.x += (0.1 * speed) / 100;

    if (rotateOnY) {
      geo.rotation.y += (0.1 * speed) / 100;
    }
  });

  return (
    <>
      <Octahedron args={[1]} ref={ref}>
        <meshPhysicalMaterial
          // ideally color would be converted by the component
          color={
            color &&
            new THREE.Color(color.r / 255, color.g / 255, color.b / 255)
          }
        />
      </Octahedron>
    </>
  );
}

export default Scene;
