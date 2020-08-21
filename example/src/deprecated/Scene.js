import * as THREE from "three";
import React, { useRef } from "react";
import { Octahedron, Torus } from "drei";
import { useFrame } from "react-three-fiber";

import { useTweaks } from "./tweaks";

function Oct() {
  const [speed, rotateY] = useTweaks("speed", "rotateY");

  const setMouseMonitor = useTweaks.useMonitor("mouse");

  const mesh = useRef();
  useFrame(({ mouse }) => {
    mesh.current.rotation.x += speed / 100;

    if (rotateY) {
      mesh.current.rotation.y += speed / 100;
    }

    setMouseMonitor(mouse.x);
  });

  return (
    <Octahedron ref={mesh}>
      <meshNormalMaterial flatShading />
    </Octahedron>
  );
}

function Tor() {
  const [position, color] = useTweaks("position", "color");

  return (
    <Torus
      args={[2, 0.2, 16, 100]}
      rotation-x={Math.PI / 2}
      position={[position.x, position.y]}
      // this conversion should be done by the lib
      material-color={
        new THREE.Color(...Object.values(color).map((x) => x / 255))
      }
    />
  );
}

export default function Scene() {
  return (
    <>
      <Oct />
      <Tor />
    </>
  );
}
