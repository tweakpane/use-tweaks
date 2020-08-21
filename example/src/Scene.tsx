import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import { Octahedron, Torus } from "drei";
import { useFrame } from "react-three-fiber";

import { useTweaks, makeSeparator, makeDirectory } from "../../dist";

function Oct() {
  const { speed, rotateY } = useTweaks({
    speed: { value: 1, min: 0, max: 10 },
    ...makeSeparator(),
    rotateY: true,
  });

  // const setMouseMonitor = useTweaks.useMonitor('mouse')

  const mesh = useRef<THREE.Mesh>();
  useFrame(({ mouse }) => {
    if (mesh.current) {
      mesh.current.rotation.x += speed / 100;

      if (rotateY) {
        mesh.current.rotation.y += speed / 100;
      }
    }
  });

  return (
    <Octahedron ref={mesh} position={[1.5, 0, 0]}>
      <meshNormalMaterial flatShading />
    </Octahedron>
  );
}

function Tor() {
  const { speed, rotateY } = useTweaks({
    ...makeDirectory("Torus", {
      speed: { value: 1, min: 0, max: 10 },
      rotateY: false,
    }),
  });

  //   const setMouseMonitor = useTweaks.useMonitor('mouse')

  const mesh = useRef<THREE.Mesh>();
  useFrame(({ mouse }) => {
    if (mesh.current) {
      mesh.current.rotation.x += speed / 100;

      if (rotateY) {
        mesh.current.rotation.y += speed / 100;
      }
    }

    // setMouseMonitor(mouse.x)
  });

  return (
    <Torus ref={mesh} position={[-1.5, 0, 0]}>
      <meshNormalMaterial flatShading />
    </Torus>
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
