import * as THREE from "three";
import React, { useRef, useState } from "react";
import { Box, Octahedron, Sphere, Text, useAspect } from "@react-three/drei";
import { useFrame } from "react-three-fiber";

import { useTweaks, makeSeparator, makeMonitor, makeButton } from "../../dist";
import { makeDirectory } from "../../src/helpers";

function Oct() {
  const mesh = useRef<THREE.Mesh>();

  const [dir, setDir] = useState(1);

  const { speed = 1, color = "#f51d63" }: any = useTweaks("Octahedron", {
    speed: { min: 1, max: 10 },
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
    <>
      <Octahedron ref={mesh} scale={[2, 2, 2]} position={[0, -2, 0]}>
        <meshStandardMaterial color={color} flatShading />
      </Octahedron>
    </>
  );
}

function Title() {
  const { text = "use tweaks", fontSize = 3 }: any = useTweaks({
    text: "useTweaks",
    fontSize: { value: 3, min: 1, max: 4 },
  });

  return (
    <Text fontSize={fontSize} position-z={-2} font={"/font.woff"}>
      {text}
    </Text>
  );
}

function easeInOutQuint(x: number): number {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

function MouseFollower() {
  const sphere = useRef();

  const scale = useAspect("cover", window.innerWidth, window.innerHeight);
  const v = new THREE.Vector3();

  const monitor = makeMonitor("Timing", {
    view: "graph",
    min: -2,
    max: +2,
  });

  const { period } = useTweaks("Pointer", {
    period: { value: 4, min: 0, max: 10 },
    ...monitor.get(),
  });

  useFrame(({ mouse, clock }) => {
    v.set((mouse.x * scale[0]) / 2, (mouse.y * scale[1]) / 2);
    sphere.current.position.lerp(v, 0.3);

    const t = clock.getElapsedTime();
    const n = Math.sin(t * period);

    monitor.set(n);
    sphere.current.scale.set(1 + n, 1 + n, 1 + n);
  });

  return <Sphere ref={sphere} args={[0.12, 32, 32]} />;
}

export default function Scene() {
  return (
    <>
      <Title />
      <Oct />
      <MouseFollower />
    </>
  );
}
