import * as THREE from "three";
import React, { useCallback, useEffect, useRef } from "react";
import { Octahedron, Text, Torus } from "drei";
import { useFrame } from "react-three-fiber";

import {
  useTweaks,
  makeSeparator,
  makeButton,
  makeDirectory,
  makeMonitor,
} from "../../dist";

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
    interval: 16,
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
    // @ts-ignore
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
    <Octahedron ref={mesh} position={[1.5, 0, 0]}>
      <meshStandardMaterial color={color} flatShading />
    </Octahedron>
  );
}

function Tor() {
  const { speed, rotateY } = useTweaks("Torus", {
    speed: { value: 1, min: 0, max: 10 },
    rotateY: false,
  });

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
    <Torus ref={mesh} position={[-1.5, 0, 0]}>
      <meshNormalMaterial flatShading />
    </Torus>
  );
}

function Title() {
  const { text } = useTweaks({
    ...makeDirectory("Text", {
      text: "useTweaks",
    }),
  });

  return (
    <Text fontSize={3} position-z={-1}>
      {text}
    </Text>
  );
}

export default function Scene() {
  return (
    <>
      <Title />
      <Oct />
      <Tor />
    </>
  );
}
