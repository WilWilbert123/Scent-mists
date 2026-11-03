"use client";

import React from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { usePerfumeLabelTexture } from "./model-materials";

interface PerfumeModelProps {
  theme: "light" | "dark";
}

/**
 * Interactive 3D Perfume Flacon for SCENTS & MISTS.
 * Grounded directly onto the background rock ledge without auto-rotation,
 * crafted with multi-layered optical crystal glass, chamfered vertical bevels,
 * warm rose-champagne parfum liquid, polished rose-gold atomizer collar,
 * and a diamond-cut octagonal crystal stopper.
 */
export function PerfumeModel({ theme }: PerfumeModelProps) {
  const labelTexture = usePerfumeLabelTexture(theme);
  const isDark = theme === "dark";

  // Align the base of the flacon directly onto the stone ledge in both themes
  // In dark mode, the black slate rock ledge sits lower in the composition
  const basePosition: [number, number, number] = isDark
    ? [0.14, -0.62, 0]
    : [0.12, -0.2, 0];

  return (
    <group
      position={basePosition}
      rotation={[0, -0.08, 0]}
      scale={0.78}
    >
      {/* 1. Outer Crystal Glass Shell (Crisp specular reflections, no label-duplicating distortion) */}
      <RoundedBox
        args={[1.56, 1.98, 0.86]}
        radius={0.07}
        smoothness={6}
        position={[0, -0.35, 0]}
        castShadow
        receiveShadow
        renderOrder={4}
      >
        <meshPhysicalMaterial
          color="#FFFFFF"
          transparent
          opacity={isDark ? 0.22 : 0.26}
          roughness={0.015}
          metalness={0.08}
          ior={1.54}
          reflectivity={1}
          clearcoat={1}
          clearcoatRoughness={0.01}
          envMapIntensity={isDark ? 2.8 : 2.4}
          specularIntensity={1}
          specularColor="#FFF7F2"
          depthWrite={false}
        />
      </RoundedBox>

      {/* 2. Inner Optical Glass Wall Cavity (Gives realistic thick glass wall edges on left & right) */}
      <RoundedBox
        args={[1.4, 1.72, 0.72]}
        radius={0.05}
        smoothness={4}
        position={[0, -0.32, 0]}
        renderOrder={2}
      >
        <meshPhysicalMaterial
          color={isDark ? "#FFF2EE" : "#FFF9F6"}
          transparent
          opacity={0.16}
          roughness={0.02}
          metalness={0.05}
          ior={1.52}
          clearcoat={1}
          envMapIntensity={2.0}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </RoundedBox>

      {/* 3. Four Vertical Chamfered Crystal Corner Pillars (Catches crisp studio rim highlights like real cut glass) */}
      {[
        [-0.73, -0.35, 0.39],
        [0.73, -0.35, 0.39],
        [-0.73, -0.35, -0.39],
        [0.73, -0.35, -0.39],
      ].map(([cx, cy, cz], idx) => (
        <mesh
          key={idx}
          position={[cx, cy, cz]}
          rotation={[0, Math.PI / 4, 0]}
          renderOrder={5}
        >
          <boxGeometry args={[0.07, 1.9, 0.07]} />
          <meshPhysicalMaterial
            color="#FFF9F5"
            transparent
            opacity={isDark ? 0.42 : 0.48}
            roughness={0.01}
            metalness={0.15}
            clearcoat={1}
            envMapIntensity={3.0}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* 4. Stepped Crystal Glass Shoulder */}
      <RoundedBox
        args={[1.32, 0.12, 0.72]}
        radius={0.03}
        smoothness={4}
        position={[0, 0.67, 0]}
        renderOrder={4}
      >
        <meshPhysicalMaterial
          color="#FFFDFB"
          transparent
          opacity={0.42}
          roughness={0.02}
          metalness={0.12}
          ior={1.54}
          clearcoat={1}
          envMapIntensity={2.8}
          depthWrite={false}
        />
      </RoundedBox>

      {/* 5. Thick Heavy Solid Crystal Base Punt (Bottom Weight Block Sitting on the Rock) */}
      <RoundedBox
        args={[1.54, 0.28, 0.84]}
        radius={0.04}
        smoothness={4}
        position={[0, -1.2, 0]}
        castShadow
        receiveShadow
        renderOrder={3}
      >
        <meshPhysicalMaterial
          color={isDark ? "#F7E5DF" : "#FFF8F5"}
          transparent
          opacity={0.55}
          roughness={0.03}
          metalness={0.14}
          ior={1.56}
          clearcoat={1}
          envMapIntensity={2.8}
        />
      </RoundedBox>

      {/* Base Internal Optical Reflection Plate (Bright champagne-crystal refraction at bottle bottom) */}
      <mesh position={[0, -1.07, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
        <planeGeometry args={[1.38, 0.68]} />
        <meshPhysicalMaterial
          color="#F7D6C8"
          metalness={0.45}
          roughness={0.08}
          clearcoat={1}
          envMapIntensity={2.4}
        />
      </mesh>

      {/* 6. Inner Warm Rose-Champagne Parfum Liquid Core */}
      <RoundedBox
        args={[1.36, 1.44, 0.66]}
        radius={0.04}
        smoothness={4}
        position={[0, -0.34, 0]}
        renderOrder={1}
      >
        <meshPhysicalMaterial
          color={isDark ? "#E4B29E" : "#EFC3B4"}
          emissive={isDark ? "#5E3529" : "#7A493B"}
          emissiveIntensity={isDark ? 0.28 : 0.16}
          transparent
          opacity={0.78}
          roughness={0.04}
          metalness={0.06}
          ior={1.36}
          clearcoat={0.9}
          envMapIntensity={1.8}
        />
      </RoundedBox>

      {/* Top Liquid Meniscus Surface (Bright golden-rose liquid surface rim) */}
      <mesh position={[0, 0.38, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[1.34, 0.64]} />
        <meshPhysicalMaterial
          color="#FCE2D7"
          transparent
          opacity={0.68}
          roughness={0.03}
          metalness={0.25}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* 7. Internal Glass Atomizer Dip Tube */}
      <mesh position={[0, -0.22, 0]} renderOrder={2}>
        <cylinderGeometry args={[0.02, 0.015, 1.75, 20]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transparent
          opacity={0.65}
          roughness={0.05}
          metalness={0.2}
          clearcoat={1}
          envMapIntensity={2.2}
        />
      </mesh>

      {/* 8. Champagne-Gold Metallic Label Backing Plate */}
      <mesh position={[0, -0.34, 0.432]} renderOrder={6}>
        <boxGeometry args={[1.06, 1.24, 0.012]} />
        <meshPhysicalMaterial
          color="#E5BEAA"
          emissive="#593A2B"
          emissiveIntensity={0.18}
          metalness={0.78}
          roughness={0.18}
          clearcoat={0.8}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* 9. Front Embossed Archival Brand Label ("SCENTS & MISTS") */}
      <mesh position={[0, -0.34, 0.44]} renderOrder={7}>
        <planeGeometry args={[1.0, 1.18]} />
        <meshStandardMaterial
          map={labelTexture ?? undefined}
          color="#FFFFFF"
          roughness={0.32}
          metalness={0.04}
        />
      </mesh>

      {/* 10. Multi-Tiered Polished Rose-Gold Atomizer Neck & Collar */}
      {/* Base Flanged Collar Ring */}
      <mesh position={[0, 0.76, 0]} castShadow>
        <cylinderGeometry args={[0.33, 0.35, 0.06, 64]} />
        <meshPhysicalMaterial
          color="#F0CEB9"
          emissive="#6B4634"
          emissiveIntensity={0.22}
          metalness={0.88}
          roughness={0.14}
          clearcoat={0.9}
          envMapIntensity={2.4}
        />
      </mesh>

      {/* Stepped Mid-Collar Ring */}
      <mesh position={[0, 0.81, 0]} castShadow>
        <cylinderGeometry args={[0.29, 0.31, 0.05, 64]} />
        <meshPhysicalMaterial
          color="#E5BC9E"
          emissive="#5E3C2A"
          emissiveIntensity={0.2}
          metalness={0.9}
          roughness={0.15}
          clearcoat={0.9}
          envMapIntensity={2.4}
        />
      </mesh>

      {/* Main Polished Champagne-Gold Neck Cylinder */}
      <mesh position={[0, 0.94, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.22, 64]} />
        <meshPhysicalMaterial
          color="#ECC5AF"
          emissive="#694331"
          emissiveIntensity={0.22}
          metalness={0.88}
          roughness={0.13}
          clearcoat={0.95}
          envMapIntensity={2.6}
        />
      </mesh>

      {/* Upper Crimped Rose-Gold Collar Lip */}
      <mesh position={[0, 1.06, 0]} castShadow>
        <cylinderGeometry args={[0.29, 0.28, 0.05, 64]} />
        <meshPhysicalMaterial
          color="#F5D7C6"
          emissive="#6E4735"
          emissiveIntensity={0.24}
          metalness={0.88}
          roughness={0.12}
          clearcoat={1}
          envMapIntensity={2.6}
        />
      </mesh>

      {/* Inner Golden Atomizer Spray Head (Visible Inside Crystal Stopper) */}
      <mesh position={[0, 1.17, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.18, 48]} />
        <meshPhysicalMaterial
          color="#E8C0A7"
          emissive="#5C3B2B"
          emissiveIntensity={0.2}
          metalness={0.86}
          roughness={0.16}
          envMapIntensity={2.2}
        />
      </mesh>

      {/* Micro Spray Nozzle Aperture */}
      <mesh position={[0, 1.18, 0.162]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.02, 24]} />
        <meshStandardMaterial color="#2A1E19" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 11. Diamond-Cut Octagonal Crystal Stopper Cap (Crisp Flat-Shaded Gem Facets) */}
      <group position={[0, 1.33, 0]}>
        {/* Lower 8-faceted crystal bevel */}
        <mesh position={[0, -0.13, 0]} castShadow renderOrder={5}>
          <cylinderGeometry args={[0.6, 0.28, 0.16, 8]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transparent
            opacity={0.58}
            roughness={0.015}
            metalness={0.18}
            ior={1.58}
            reflectivity={1}
            clearcoat={1}
            envMapIntensity={3.2}
            flatShading
          />
        </mesh>

        {/* Central 8-faceted octagonal crystal crown */}
        <mesh position={[0, 0, 0]} castShadow renderOrder={5}>
          <cylinderGeometry args={[0.64, 0.6, 0.13, 8]} />
          <meshPhysicalMaterial
            color="#FFFDFB"
            transparent
            opacity={0.64}
            roughness={0.01}
            metalness={0.22}
            ior={1.6}
            reflectivity={1}
            clearcoat={1}
            envMapIntensity={3.5}
            flatShading
          />
        </mesh>

        {/* Upper 8-faceted diamond table */}
        <mesh position={[0, 0.12, 0]} castShadow renderOrder={5}>
          <cylinderGeometry args={[0.38, 0.64, 0.11, 8]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transparent
            opacity={0.6}
            roughness={0.015}
            metalness={0.2}
            ior={1.58}
            reflectivity={1}
            clearcoat={1}
            envMapIntensity={3.2}
            flatShading
          />
        </mesh>

        {/* Inner Crystal Core Ring for Gem Depth */}
        <mesh position={[0, 0, 0]} renderOrder={4}>
          <cylinderGeometry args={[0.36, 0.32, 0.28, 16]} />
          <meshPhysicalMaterial
            color="#FBE6DE"
            transparent
            opacity={0.38}
            roughness={0.04}
            metalness={0.15}
            ior={1.54}
            envMapIntensity={2.4}
          />
        </mesh>
      </group>
    </group>
  );
}

