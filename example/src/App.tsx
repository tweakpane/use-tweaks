import * as THREE from 'three'
import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from 'react-three-fiber'
import { OrbitControls, ContactShadows, useGLTF, useCubeTexture, Octahedron } from '@react-three/drei'
import { useTweaks, makeFolder, makeSeparator, makeButton } from 'use-tweaks'

import Badge from './Badge'

function Suzanne(props) {
  const { envMap } = props
  const { nodes } = useGLTF('./suzanne.glb')

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

  return (
    <mesh {...props} position-x={position.x} position-y={position.y} scale={[scale, scale, scale]}>
      <primitive object={nodes.Suzanne.geometry} dispose={null} attach="geometry" />
      <meshPhysicalMaterial color={new THREE.Color(color)} envMap={envMap} metalness={1} roughness={0} />
    </mesh>
  )
}

function Octa({ envMap }) {
  const mesh = useRef()
  const { move } = useTweaks('Octa', { move: true })

  useFrame(({ clock }) => {
    if (move) {
      mesh.current.position.y = Math.sin(clock.getElapsedTime()) * 0.5 + 0.5
    }
  })

  return (
    <Octahedron ref={mesh} args={[1, 6]}>
      <meshPhysicalMaterial color={'#f51d63'} envMap={envMap} metalness={1} roughness={0} />
    </Octahedron>
  )
}

function Scene() {
  const envMap = useCubeTexture(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'], { path: '/cube/' })

  const { model } = useTweaks({
    model: { value: 'Suzanne', options: ['suzanne', 'Octahedron'] },
  })

  return (
    <Suspense fallback={null}>
      {model === 'Octahedron' ? <Octa envMap={envMap} /> : <Suzanne envMap={envMap} />}
    </Suspense>
  )
}

export default function App() {
  const ref = React.useRef<HTMLDivElement>(null)
  const { color } = useTweaks({ color: { value: '#f2f2f2', label: 'background' } }, { container: ref })

  return (
    <>
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <color attach="background" args={[color]} />
        <fog attach="fog" args={['white', 10, 40]} />

        <ambientLight intensity={0.5} />

        <ContactShadows
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, -1.2, 0]}
          opacity={0.5}
          width={12}
          height={12}
          blur={1}
          far={2}
          resolution={512}
        />

        <OrbitControls maxPolarAngle={Math.PI / 2} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <Badge />
      <div className="tweak-container" ref={ref} />
    </>
  )
}
