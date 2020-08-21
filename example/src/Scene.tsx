import * as THREE from "three";
import React, { useRef } from "react";
import { Octahedron } from "drei";
import { useFrame } from "react-three-fiber";

import useTweaks from "../../src/useTweaks";

function Oct() {
  const { speed, rotateY } = useTweaks("first", {
    speed: { value: 1, min: 0, max: 10 },
    rotateY: false,
  });

  // const setMouseMonitor = useTweaks.useMonitor('mouse')

  const mesh = useRef<THREE.Mesh>();
  useFrame(({ mouse }) => {
    mesh.current.rotation.x += speed / 100;

    if (rotateY) {
      mesh.current.rotation.y += speed / 100;
    }

    // setMouseMonitor(mouse.x)
  });

  return (
    <Octahedron ref={mesh} position={[1, 0, 0]}>
      <meshNormalMaterial flatShading />
    </Octahedron>
  );
}

function Tor() {
  const { speed, rotateY } = useTweaks("second", {
    speed: { value: 1, min: 0, max: 10 },
    rotateY: false,
  });

  //   const setMouseMonitor = useTweaks.useMonitor('mouse')

  const mesh = useRef<THREE.Mesh>();
  useFrame(({ mouse }) => {
    mesh.current.rotation.x += speed / 100;

    if (rotateY) {
      mesh.current.rotation.y += speed / 100;
    }

    // setMouseMonitor(mouse.x)
  });

  return (
    <Octahedron ref={mesh} position={[-1, 0, 0]}>
      <meshNormalMaterial flatShading />
    </Octahedron>
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
