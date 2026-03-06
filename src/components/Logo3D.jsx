import React, { useRef, useEffect } from 'react';
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
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const isInitializedRef = useRef(false);
  const contextLostRef = useRef(false);
  
  // Cleanup function to prevent WebGL memory leaks and multiple contexts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // FIX: Prevent multiple context initializations
    // Check if canvas already has a WebGL context
    if (isInitializedRef.current) {
      console.warn('⚠️ WebGL already initialized, skipping...');
      return;
    }
    
    const handleContextLost = (event) => {
      event.preventDefault();
      console.warn('WebGL context lost. Cleaning up...');
      contextLostRef.current = true;
      isInitializedRef.current = false;
    };
    
    const handleContextRestored = () => {
      console.log('WebGL context restored.');
      contextLostRef.current = false;
      isInitializedRef.current = true;
    };
    
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    
    // Mark as initialized after Canvas renders
    isInitializedRef.current = true;
    
    return () => {
      // Only cleanup if we're actually initialized
      if (!isInitializedRef.current && !contextLostRef.current) return;
      
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      
      // Force context loss and dispose renderer properly to prevent 'Canvas has an existing context' errors
      if (rendererRef.current) {
        try {
          // Dispose all resources
          rendererRef.current.dispose();
        } catch (e) {
          console.warn('Could not dispose WebGL renderer:', e);
        }
        rendererRef.current = null;
      }
      
      // Clear the canvas reference and force context loss
      if (canvas && !contextLostRef.current) {
        try {
          const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
          if (gl) {
            // Try to lose context gracefully
            const ext = gl.getExtension('WEBGL_lose_context');
            if (ext) {
              ext.loseContext();
            }
          }
          // Clear the context by setting it to null
          canvas.getContext && canvas.getContext('webgl') && canvas.getContext('webgl2') && (canvas.width = 0) && (canvas.height = 0);
        } catch (e) {
          console.warn('Could not lose WebGL context:', e);
        }
      }
      
      isInitializedRef.current = false;
      contextLostRef.current = false;
    };
  }, []);
  
  return (
    <div style={{ width, height, background: 'transparent' }}>
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
        onCreated={({ gl, renderer }) => {
          // Store renderer reference for cleanup
          rendererRef.current = renderer;
          
          // Handle context loss
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('WebGL context lost in Canvas');
            isInitializedRef.current = false;
          });
          
          // Handle context restoration
          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored');
            isInitializedRef.current = true;
          });
        }}
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
