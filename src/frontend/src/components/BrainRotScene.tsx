import { Float, Stars, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { BrainRotCharacter } from "../types/game";

interface FloatingCharProps {
  character: BrainRotCharacter;
  position: [number, number, number];
  onSteal: (id: bigint, points: number) => void;
}

function FloatingCharacter({
  character,
  position,
  onSteal,
}: FloatingCharProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [stealing, setStealing] = useState(false);
  const [scale, setScale] = useState(1);
  const [visible, setVisible] = useState(true);
  const { camera } = useThree();

  const color = new THREE.Color(character.color);
  const emissiveColor = new THREE.Color(character.color);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  useFrame(() => {
    if (!groupRef.current) return;
    if (stealing) {
      const newScale = scale + 0.05;
      setScale(Math.min(newScale, 3));
    }
    // Face camera
    groupRef.current.quaternion.copy(camera.quaternion);
  });

  const handleClick = () => {
    if (stealing || !visible) return;
    setStealing(true);
    onSteal(character.bigintId, character.points);

    setTimeout(() => {
      setVisible(false);
      setStealing(false);
      setScale(1);
    }, 600);

    setTimeout(() => {
      setVisible(true);
    }, 2600);
  };

  if (!visible) return null;

  return (
    <Float
      speed={1.5 + Math.random() * 1}
      rotationIntensity={0.3}
      floatIntensity={0.8}
      position={position}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 3D canvas element - keyboard not applicable */}
      <group
        ref={groupRef}
        scale={stealing ? scale : hovered ? 1.15 : 1}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Glowing sphere body */}
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={emissiveColor}
            emissiveIntensity={stealing ? 3 : hovered ? 1.8 : 0.8}
            roughness={0.1}
            metalness={0.6}
          />
        </mesh>

        {/* Character name text */}
        <Text
          position={[0, -0.9, 0]}
          fontSize={0.22}
          color={character.color}
          anchorX="center"
          anchorY="middle"
          font="/assets/fonts/BricolageGrotesque-VariableFont.woff2"
          maxWidth={3}
          textAlign="center"
        >
          {character.emote} {character.name}
        </Text>

        {/* Points badge */}
        <Text
          position={[0, 0.85, 0]}
          fontSize={0.28}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/assets/fonts/BricolageGrotesque-VariableFont.woff2"
        >
          +{character.points}pts
        </Text>

        {/* Outer ring glow */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.04, 8, 64]} />
          <meshStandardMaterial
            color={character.color}
            emissive={emissiveColor}
            emissiveIntensity={stealing ? 4 : hovered ? 2 : 0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Particles background
function Particles() {
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#88ffcc" transparent opacity={0.6} />
    </points>
  );
}

// Grid floor
function NeonGrid() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.y = -5;
      // pulse opacity
      const mat = gridRef.current.material as THREE.Material;
      if (mat) {
        (mat as THREE.MeshBasicMaterial).opacity =
          0.15 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      }
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[50, 50, "#00ff88", "#003322"]}
      position={[0, -5, 0]}
    />
  );
}

interface BrainRotSceneProps {
  characters: BrainRotCharacter[];
  onSteal: (characterId: bigint, points: number) => void;
}

function generatePositions(count: number): [number, number, number][] {
  const positions: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 3 + Math.random() * 3;
    positions.push([
      Math.cos(angle) * radius + (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 4,
      Math.sin(angle) * radius + (Math.random() - 0.5) * 2,
    ]);
  }
  return positions;
}

function SceneContent({ characters, onSteal }: BrainRotSceneProps) {
  const positions = useMemo(
    () => generatePositions(characters.length),
    [characters.length],
  );
  const cameraRef = useRef({ angle: 0 });

  useFrame((state) => {
    cameraRef.current.angle = state.clock.elapsedTime * 0.1;
    const r = 12;
    state.camera.position.x = Math.sin(cameraRef.current.angle) * r;
    state.camera.position.z = Math.cos(cameraRef.current.angle) * r;
    state.camera.position.y = 1 + Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#00ff88" />
      <pointLight position={[-5, -3, -5]} intensity={1.5} color="#ff00cc" />
      <pointLight position={[5, -3, 5]} intensity={1.5} color="#00ccff" />

      {/* Stars */}
      <Stars
        radius={80}
        depth={60}
        count={3000}
        factor={3}
        saturation={1}
        fade
        speed={0.5}
      />

      {/* Particles */}
      <Particles />

      {/* Neon grid */}
      <NeonGrid />

      {/* Characters */}
      {characters.map((char, i) => (
        <FloatingCharacter
          key={char.id}
          character={char}
          position={positions[i] ?? [0, 0, 0]}
          onSteal={onSteal}
        />
      ))}
    </>
  );
}

export default function BrainRotScene({
  characters,
  onSteal,
}: BrainRotSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 1, 12], fov: 75 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: false }}
      scene={{ background: new THREE.Color(0x050510) }}
    >
      <SceneContent characters={characters} onSteal={onSteal} />
    </Canvas>
  );
}
