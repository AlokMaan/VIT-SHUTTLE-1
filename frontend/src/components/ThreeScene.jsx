import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

/* ─── 3D Bus Mesh ──────────────────────────────────────────── */
function BusMesh({ color = '#00d4b8', position = [0, 0, 0], rotation = 0, label = '' }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = -rotation;
    }
  });

  const bodyColor = useMemo(() => new THREE.Color(color), [color]);
  const windowColor = useMemo(() => new THREE.Color('#a8d8ea'), []);
  const wheelColor = useMemo(() => new THREE.Color('#222'), []);

  return (
    <group ref={groupRef} position={position}>
      {/* Bus body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.8, 0.7, 0.8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[1.6, 0.12, 0.75]} />
        <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Windows - left */}
      <mesh position={[0, 0.5, 0.41]}>
        <boxGeometry args={[1.4, 0.3, 0.02]} />
        <meshStandardMaterial color={windowColor} metalness={0.8} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Windows - right */}
      <mesh position={[0, 0.5, -0.41]}>
        <boxGeometry args={[1.4, 0.3, 0.02]} />
        <meshStandardMaterial color={windowColor} metalness={0.8} roughness={0.1} transparent opacity={0.7} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0.91, 0.5, 0]}>
        <boxGeometry args={[0.02, 0.35, 0.7]} />
        <meshStandardMaterial color={windowColor} metalness={0.8} roughness={0.1} transparent opacity={0.6} />
      </mesh>

      {/* Headlights */}
      <mesh position={[0.92, 0.35, 0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffaa" emissive="#ffffaa" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.92, 0.35, -0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffaa" emissive="#ffffaa" emissiveIntensity={0.5} />
      </mesh>

      {/* Wheels */}
      {[[-0.55, 0.08, 0.42], [-0.55, 0.08, -0.42], [0.55, 0.08, 0.42], [0.55, 0.08, -0.42]].map(
        (pos, i) => (
          <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.08, 12]} />
            <meshStandardMaterial color={wheelColor} />
          </mesh>
        )
      )}

      {/* Route label */}
      {label && (
        <Billboard position={[0, 1.2, 0]} follow lockX={false} lockY={false} lockZ={false}>
          <Text fontSize={0.25} color={color} anchorX="center" anchorY="middle" font={undefined}>
            {label}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

/* ─── Stop Pin ─────────────────────────────────────────────── */
function StopPin({ position, name, color = '#00d4b8' }) {
  const pinColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <group position={position}>
      {/* Pin cylinder */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 12]} />
        <meshStandardMaterial color={pinColor} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Pin top sphere */}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color={pinColor} emissive={pinColor} emissiveIntensity={0.3} />
      </mesh>
      {/* Label */}
      {name && (
        <Billboard position={[0, 0.85, 0]}>
          <Text fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" font={undefined}>
            {name}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

/* ─── Route Path Line ──────────────────────────────────────── */
function RoutePath({ points, color = '#00d4b8' }) {
  const lineRef = useRef();
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = [];
    points.forEach((p) => vertices.push(p[0], 0.05, p[1]));
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  }, [points]);

  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color: new THREE.Color(color), linewidth: 2, transparent: true, opacity: 0.7 }),
    [color]
  );

  return <line ref={lineRef} geometry={geometry} material={material} />;
}

/* ─── Ground Plane ─────────────────────────────────────────── */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#0a1628" roughness={0.9} />
    </mesh>
  );
}

/* ─── Coordinate conversion helpers ────────────────────────── */
// Convert lat/lng to local 3D coordinates centered on VIT campus
const CENTER_LAT = 12.9698;
const CENTER_LNG = 79.1557;
const SCALE = 5000; // meters to units multiplier

function latLngTo3D(lat, lng) {
  const x = (lng - CENTER_LNG) * SCALE * Math.cos((CENTER_LAT * Math.PI) / 180);
  const z = -(lat - CENTER_LAT) * SCALE;
  return [x, z];
}

function bearingToRadians(bearing) {
  return (bearing * Math.PI) / 180;
}

/* ─── Scene with buses and routes ──────────────────────────── */
function Scene({ shuttles = [], routes = [], stops = [] }) {
  // Convert shuttle positions to 3D
  const busPositions = useMemo(
    () =>
      shuttles.map((s) => {
        const [x, z] = latLngTo3D(s.lat, s.lng);
        return {
          id: s.id,
          position: [x, 0, z],
          rotation: bearingToRadians(s.heading || 0),
          color: s.routeColor || '#00d4b8',
          label: s.busId || s.id,
        };
      }),
    [shuttles]
  );

  // Convert route paths to 3D
  const routePaths = useMemo(
    () =>
      routes.map((r) => ({
        id: r.id || r.code,
        color: r.color || '#00d4b8',
        points: (r.path || []).map((p) => latLngTo3D(p.lat, p.lng)),
      })),
    [routes]
  );

  // Convert stop positions to 3D
  const stopPositions = useMemo(
    () =>
      stops.map((s) => {
        const [x, z] = latLngTo3D(s.lat || s.location?.lat, s.lng || s.location?.lng);
        return {
          id: s._id || s.code,
          name: s.name,
          position: [x, 0, z],
          color: s.routeColor || '#00d4b8',
        };
      }),
    [stops]
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#00d4b8" />

      {/* Ground */}
      <Ground />

      {/* Route paths */}
      {routePaths.map((rp) => (
        <RoutePath key={rp.id} points={rp.points} color={rp.color} />
      ))}

      {/* Stop pins */}
      {stopPositions.map((sp) => (
        <StopPin key={sp.id} position={sp.position} name={sp.name} color={sp.color} />
      ))}

      {/* Buses */}
      {busPositions.map((bp) => (
        <BusMesh
          key={bp.id}
          position={bp.position}
          rotation={bp.rotation}
          color={bp.color}
          label={bp.label}
        />
      ))}

      {/* Controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.1}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={50}
        target={[0, 0, 0]}
      />
    </>
  );
}

/* ─── Main exported component ──────────────────────────────── */
export default function ThreeScene({ shuttles = [], routes = [], stops = [], className = '' }) {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) setIsSupported(false);
    } catch {
      setIsSupported(false);
    }
  }, []);

  if (!isSupported) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ background: 'var(--surface)', color: 'var(--text-3)' }}
      >
        <div className="text-center p-8">
          <p className="text-lg font-semibold mb-2">3D View Unavailable</p>
          <p className="text-sm">Your browser does not support WebGL. Please use the 2D map view.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ background: '#080c14' }}>
      <Canvas
        shadows
        camera={{ position: [0, 15, 20], fov: 50, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#080c14']} />
        <fog attach="fog" args={['#080c14', 30, 80]} />
        <Scene shuttles={shuttles} routes={routes} stops={stops} />
      </Canvas>
    </div>
  );
}
