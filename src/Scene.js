import React, { useRef } from "react";
import { Octahedron } from "drei";
import { useFrame } from "react-three-fiber";

import { useTweaks } from './tweaks'

function Scene() {
  const [speed, rotateY] = useTweaks('speed', 'rotateY')

  const mesh = useRef()
  useFrame(() => {
    mesh.current.rotation.x += speed / 100;

    if (rotateY) {
      mesh.current.rotation.y += speed / 100;
    }
  })

  return <Octahedron ref={mesh}><meshNormalMaterial flatShading /></Octahedron>
}

export default Scene;
