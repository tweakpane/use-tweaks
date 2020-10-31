import * as THREE from 'three'
import React, { Suspense } from 'react'
import { Canvas } from 'react-three-fiber'
import { OrbitControls, ContactShadows, useGLTF, useCubeTexture } from '@react-three/drei'
import { useTweaks, makeFolder, makeSeparator, makeButton } from 'use-tweaks'

import Badge from './Badge'

function Suzanne(props) {
  const { nodes } = useGLTF('./suzanne.glb')
  const envMap = useCubeTexture(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'], { path: '/cube/' })

  const { color, position, scale } = useTweaks('Suzanne', {
    color: '#ff005b',
    ...makeSeparator(),
    ...makeFolder('Position', {
      position: { value: { x: 0, y: 0 }, min: { x: -1, y: -1 }, max: { x: 1, y: 1 } },
    }),
    ...makeFolder('Scale', {
      scale: { value: 1, max: 3 },
      ...makeButton('Log Console', () => console.log('something in the console ' + Date.now())),
    }),
  })

  console.log('render suzanne')

  return (
    <mesh {...props} position-x={position.x} position-y={position.y} scale={[scale, scale, scale]}>
      <primitive object={nodes.Suzanne.geometry} dispose={null} attach="geometry" />
      <meshPhysicalMaterial color={new THREE.Color(color)} envMap={envMap} metalness={1} roughness={0} />
    </mesh>
  )
}

function Scene() {
  return (
    <Suspense fallback={null}>
      <Suzanne />
    </Suspense>
  )
}

export default function App() {
  const ref = React.useRef<HTMLDivElement>(null)
  const { color } = useTweaks({ color: { value: '#f2f2f2', label: 'background' } }, { container: ref })

  console.log('render app')

  return (
    <>
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <color attach="background" args={[color]} />
        <fog attach="fog" args={['white', 10, 40]} />

        <ambientLight intensity={0.5} />
        <directionalLight castShadow position={[2.5, 12, 12]} intensity={1} />
        <pointLight position={[20, 20, 20]} />
        <pointLight position={[-20, -20, -20]} intensity={1} />

        <ContactShadows
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, -2, 0]}
          opacity={0.5}
          width={60}
          height={60}
          blur={0.1}
          far={2}
        />

        <OrbitControls maxPolarAngle={Math.PI / 2} />

        <Scene />
      </Canvas>
      <Badge />
      <div className="tweak-container" ref={ref} />
    </>
  )
}
