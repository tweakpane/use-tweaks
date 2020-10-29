import * as THREE from "three";
import React, { useRef, useState } from "react";
import { Octahedron, Text } from "@react-three/drei";
import { useFrame } from "react-three-fiber";

import { useTweaks, makeSeparator, makeButton } from "../../dist";

function Oct() {
  const mesh = useRef<THREE.Mesh>();

  const [dir, setDir] = useState(1);

  const { speed, color }: any = useTweaks("Octahedron", {
    speed: { min: 1, max: 10 },
    ...makeSeparator(),
    ...makeButton("Reverse", () => setDir((dir) => dir * -1)),
    color: "#f51d63",
  });

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += (speed / 100) * dir;
      mesh.current.rotation.y += (speed / 100) * dir;
    }
  });

  return (
    <Octahedron ref={mesh} scale={[2, 2, 2]} position={[0, -2, 0]}>
      <meshStandardMaterial color={color} flatShading />
    </Octahedron>
  );
}

function Title() {
  const { text, fontSize }: any = useTweaks({
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
