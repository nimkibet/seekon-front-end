import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

// Rotating Seekon Logo Text (simplified)
function SeekonLogo({ position }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <group ref={groupRef} position={position}>
        {/* Main SEEKON text representation using boxes */}
        <mesh position={[-2, 0, 0]}>
          <boxGeometry args={[0.4, 1.5, 0.2]} />
          <meshStandardMaterial color="#00A676" emissive="#00A676" emissiveIntensity={0.3} />
        </mesh>
        
        <mesh position={[-1.2, 0, 0]}>
          <boxGeometry args={[0.4, 1.5, 0.2]} />
          <meshStandardMaterial color="#00A676" emissive="#00A676" emissiveIntensity={0.3} />
        </mesh>
        
        <mesh position={[-0.4, 0.3, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.2]} />
          <meshStandardMaterial color="#00A676" emissive="#00A676" emissiveIntensity={0.3} />
        </mesh>
        
        <mesh position={[-0.4, -0.3, 0]}>
          <boxGeometry args={[0.4, 1.1, 0.2]} />
          <meshStandardMaterial color="#00A676" emissive="#00A676" emissiveIntensity={0.3} />
        </mesh>
        
        <mesh position={[0.4, 0.3, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.2]} />
          <meshStandardMaterial color="#00A676" emissive="#00A676" emissiveIntensity={0.3} />
        </mesh>
        
        <mesh position={[0.4, -0.3, 0]}>
          <boxGeometry args={[0.4, 1.1, 0.2]} />
          <meshStandardMaterial color="#00A676" emissive="#00A676" emissiveIntensity={0.3} />
        </mesh>
        
        <mesh position={[1.2, 0.4, 0]}>
          <boxGeometry args={[0.4, 0.8, 0.2]} />
          <meshStandardMaterial color="#00A676" emissive="#00A676" emissiveIntensity={0.3} />
        </mesh>
        
        <mesh position={[2, 0.4, 0]}>
          <boxGeometry args={[0.4, 0.8, 0.2]} />
          <meshStandardMaterial color="#00A676" emissive="#00A676" emissiveIntensity={0.3} />
        </mesh>

        {/* Glow effect */}
        <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 3, 32]} />
          <meshBasicMaterial
            color="#00A676"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Particle System
function Particles() {
  const particles = useRef();
  const count = 50;

  const positions = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 8;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.x = state.clock.elapsedTime * 0.05;
      particles.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#00A676"
        transparent
        opacity={0.4}
        sizeAttenuation={true}
      />
    </points>
  );
}

// Main Component
const Logo3D = ({ width = '100%', height = '100%' }) => {
  return (
    <div style={{ width, height, background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#FFFFFF" />
        <pointLight position={[-10, -10, -5]} color="#00A676" intensity={0.6} />
        <pointLight position={[5, 5, 5]} color="#00A676" intensity={0.4} />
        
        {/* 3D Elements */}
        <SeekonLogo position={[0, 0, 0]} />
        
        <Particles />
        
        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.3}
        />
      </Canvas>
    </div>
  );
};

export default Logo3D;
