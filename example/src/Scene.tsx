import * as THREE from "three";
import React, { useCallback, useEffect, useRef } from "react";
import { Octahedron, Text, Torus } from "drei";
import { useFrame } from "react-three-fiber";

import { useTweaks, makeSeparator, makeButton, makeMonitor } from "../../dist";

function Oct() {
  const mesh = useRef<THREE.Mesh>();

  const restart = useCallback(() => {
    if (mesh.current) {
      mesh.current.rotation.x = mesh.current.rotation.y = 0;
    }
  }, []);

  const myMonitor = makeMonitor("Test", {
    view: "graph",
    min: -1,
    max: 1,
    interval: 64,
  });

  const { speed, rotateY, color } = useTweaks("Octahedron", {
    speed: { value: 1, min: 0, max: 10 },
    rotateY: true,
    ...makeSeparator(),
    ...makeButton("Restart", restart),
    color: "#f51d63",
    ...myMonitor.get(),
  });

  useFrame(({ mouse }) => {
    myMonitor.set(mouse.y);
  });

  useFrame(({ mouse }) => {
    if (mesh.current) {
      mesh.current.rotation.x += speed / 100;

      if (rotateY) {
        mesh.current.rotation.y += speed / 100;
      }
    }
  });

  return (
    <Octahedron ref={mesh} scale={[2, 2, 2]} position={[0, -2, 0]}>
      <meshStandardMaterial color={color} flatShading />
    </Octahedron>
  );
}

function Title() {
  const { text, fontSize } = useTweaks("Title", {
    text: "useTweaks",
    fontSize: { value: 3, min: 1, max: 4 },
  });

  return (
    <Text fontSize={fontSize} position-z={-2} font={"/font.woff"}>
      {text}
    </Text>
  );
}

export default function Scene() {
  return (
    <>
      <Title />
      <Oct />
    </>
  );
}
