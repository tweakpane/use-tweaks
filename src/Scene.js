import * as THREE from "three";
import React, { useRef } from "react";
import { Octahedron } from "drei";
import { useFrame } from "react-three-fiber";

import { useGUI } from "./GUI";

function LeftComponent() {

  const ref = useRef();

  useFrame(({ clock }) => {
    const geo = ref.current;
    geo.rotation.x += (0.1 * speed) / 100;

    if (rotateOnY) {
      geo.rotation.y += (0.1 * speed) / 100;
    }
  });

  const [speed, color, rotateOnY, point] = useGUI(
    "speed",
    "color",
    "rotate on y",
    "point"
  );

  return (
    <Octahedron args={[1]} ref={ref} position={[-1.5, 0, 0]}>
        <meshPhysicalMaterial
          // ideally color would be converted by the component
          color={
            color &&
            new THREE.Color(color.r / 255, color.g / 255, color.b / 255)
          }
        />
      </Octahedron>
  )

}

function RightComponent() {

  const ref = useRef();

  useFrame(({ clock }) => {
    const geo = ref.current;
    geo.rotation.x += (0.1 * speed) / 100;

    if (rotateOnY) {
      geo.rotation.y += (0.1 * speed) / 100;
    }
  });

  const [speed, color, rotateOnY] = useGUI(
    "speed",
    "right-color",
    "rotate on y"
  );

  return (
    <Octahedron args={[1]} ref={ref} position={[1.5, 0, 0]}>
        <meshPhysicalMaterial
          // ideally color would be converted by the component
          color={
            color &&
            new THREE.Color(color.r / 255, color.g / 255, color.b / 255)
          }
        />
      </Octahedron>
  )

}

function Scene() {
  return (
    <>
      <LeftComponent />
      <RightComponent />
    </>
  );
}

export default Scene;
