"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePerfumeLabelTexture } from "./model-materials";

interface PerfumeModelProps {
  theme: "light" | "dark";
}

/**
 * Helper to construct an emerald-cut octagonal cross section.
 * Provides the signature beveled corners of luxury crystal flacons.
 */
function createOctagonShape(halfWidth: number, halfDepth: number, chamfer: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth + chamfer, -halfDepth);
  shape.lineTo(halfWidth - chamfer, -halfDepth);
  shape.lineTo(halfWidth, -halfDepth + chamfer);
  shape.lineTo(halfWidth, halfDepth - chamfer);
  shape.lineTo(halfWidth - chamfer, halfDepth);
  shape.lineTo(-halfWidth + chamfer, halfDepth);
  shape.lineTo(-halfWidth, halfDepth - chamfer);
  shape.lineTo(-halfWidth, -halfDepth + chamfer);
  shape.closePath();
  return shape;
}

/**
 * Photorealistic 3D Luxury Crystal Perfume Flacon for SCENTS & MISTS.
 * Clean, single-instance front label with zero ghosting or duplication across sides, back, or cap.
 */
export function PerfumeModel({ theme }: PerfumeModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bubbleRefs = useRef<(THREE.Mesh | null)[]>([]);
  const labelTexture = usePerfumeLabelTexture(theme);
  const isDark = theme === "dark";

  // Base position aligned with background stone ledge
  const basePosition: [number, number, number] = isDark
    ? [0.14, -0.62, 0]
    : [0.12, -0.22, 0];

  // Fresh effervescent micro-bubbles inside the fresh perfume water chamber
  const bubbles = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => ({
      x: (Math.sin(i * 1.7) * 0.22) + (i % 2 === 0 ? 0.016 : -0.016),
      initialY: -0.7 + (i / 22) * 1.15,
      z: (Math.cos(i * 2.3) * 0.12) + 0.02,
      radius: 0.012 + (i % 4) * 0.005,
      speed: 0.06 + (i % 3) * 0.03,
      swayOffset: i * 0.8,
    }));
  }, []);

  // Fresh water dew droplets condensed on the outer crystal glass
  const droplets = useMemo(() => [
    // On the crystal shoulder
    { x: -0.42, y: 0.76, z: 0.22, r: 0.028 },
    { x: -0.28, y: 0.81, z: 0.25, r: 0.022 },
    { x: 0.32, y: 0.78, z: 0.24, r: 0.032 },
    { x: 0.45, y: 0.74, z: 0.20, r: 0.024 },
    { x: 0.18, y: 0.82, z: 0.26, r: 0.018 },
    { x: -0.15, y: 0.80, z: 0.25, r: 0.020 },
    // On the chamfered corners
    { x: -0.58, y: 0.25, z: 0.34, r: 0.026 },
    { x: 0.58, y: 0.35, z: 0.34, r: 0.025 },
    { x: -0.62, y: -0.45, z: 0.32, r: 0.028 },
    { x: 0.62, y: -0.35, z: 0.32, r: 0.024 },
    // On the heavy crystal base punt
    { x: -0.48, y: -0.98, z: 0.28, r: 0.030 },
    { x: 0.42, y: -1.02, z: 0.29, r: 0.032 },
    { x: 0.12, y: -0.96, z: 0.33, r: 0.022 },
    { x: -0.18, y: -1.04, z: 0.32, r: 0.026 },
  ], []);

  // 1. Emerald-cut outer crystal bottle geometry
  const outerBodyGeo = useMemo(() => {
    const shape = createOctagonShape(0.78, 0.44, 0.18);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 1.58,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    });
    geo.center();
    return geo;
  }, []);

  // 2. Heavy solid crystal base (glass punt)
  const basePuntGeo = useMemo(() => {
    const shape = createOctagonShape(0.8, 0.46, 0.19);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.36,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
    geo.center();
    return geo;
  }, []);

  // 3. Chamfered crystal shoulder transition
  const shoulderGeo = useMemo(() => {
    const shape = createOctagonShape(0.68, 0.38, 0.15);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    geo.center();
    return geo;
  }, []);

  // 4. Inner liquid elixir geometry (precisely contoured to bottle interior)
  const liquidCoreGeo = useMemo(() => {
    const shape = createOctagonShape(0.65, 0.33, 0.13);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 1.24,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    geo.center();
    return geo;
  }, []);

  // 5. Clean crystal stopper cap (seamless, no internal duplication)
  const capGeo = useMemo(() => {
    const shape = createOctagonShape(0.56, 0.38, 0.14);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.36,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.12,
      bevelThickness: 0.14,
    });
    geo.center();
    return geo;
  }, []);

  // 6. Top diamond table facet on cap
  const capTableGeo = useMemo(() => {
    const shape = createOctagonShape(0.38, 0.25, 0.08);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
    geo.center();
    return geo;
  }, []);

  // Graceful slow-motion showcase rotation (slowmo) & dynamic water bubbles
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.32;
    groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.015;

    // Animate fresh micro-bubbles rising inside the water
    bubbleRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const b = bubbles[idx];
      if (!b) return;
      const cycleHeight = 1.25;
      const progressY = ((t * b.speed + b.initialY + 0.8) % cycleHeight) - 0.75;
      mesh.position.y = progressY;
      mesh.position.x = b.x + Math.sin(t * 1.5 + b.swayOffset) * 0.012;
    });
  });

  return (
    <group
      ref={groupRef}
      position={basePosition}
      rotation={[0, -0.05, 0]}
      scale={0.78}
    >
      {/* ============================================================== */}
      {/* 1. FRESH PERFUME WATER & ELIXIR (INTERNAL FLUID CHAMBER)       */}
      {/* ============================================================== */}
      <mesh
        geometry={liquidCoreGeo}
        position={[0, -0.16, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={2}
      >
        <meshPhysicalMaterial
          color={isDark ? "#E5753C" : "#FFA26B"}
          emissive={isDark ? "#631C0C" : "#993B18"}
          emissiveIntensity={isDark ? 0.38 : 0.26}
          transmission={0.78}
          roughness={0.012}
          metalness={0.02}
          ior={1.34}
          thickness={0.85}
          attenuationColor={isDark ? "#D97B52" : "#FFC7A6"}
          attenuationDistance={1.0}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          reflectivity={1.0}
          envMapIntensity={2.8}
        />
      </mesh>

      {/* Meniscus / Liquid Top Surface Line (Refractive fluid boundary) */}
      <mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
        <planeGeometry args={[1.26, 0.62]} />
        <meshPhysicalMaterial
          color="#FFE5D4"
          transmission={0.72}
          roughness={0.02}
          metalness={0.05}
          clearcoat={1.0}
          ior={1.34}
          reflectivity={1.0}
        />
      </mesh>

      {/* Fresh Effervescent Micro-Bubbles inside the water */}
      <group position={[0, -0.16, 0]}>
        {bubbles.map((b, idx) => (
          <mesh
            key={idx}
            ref={(el) => {
              bubbleRefs.current[idx] = el;
            }}
            position={[b.x, b.initialY, b.z]}
            renderOrder={3}
          >
            <sphereGeometry args={[b.radius, 12, 12]} />
            <meshPhysicalMaterial
              color="#FFFFFF"
              emissive="#FFD9BF"
              emissiveIntensity={0.3}
              transmission={0.85}
              roughness={0.02}
              ior={1.33}
              clearcoat={1.0}
            />
          </mesh>
        ))}
      </group>

      {/* Internal Glass Dip Tube (Atomizer Straw) */}
      <mesh position={[0.016, -0.12, 0.01]} rotation={[0, 0, 0.032]} renderOrder={3}>
        <cylinderGeometry args={[0.013, 0.011, 1.68, 32]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transmission={0.65}
          roughness={0.05}
          metalness={0.1}
          clearcoat={1.0}
          ior={1.5}
        />
      </mesh>

      {/* ============================================================== */}
      {/* 2. OUTER CRYSTAL FLACON GLASS & FRESH CONDENSED DEW DROPLETS   */}
      {/* ============================================================== */}
      {/* Fresh Water Dew Droplets Condensed on Crystal Glass */}
      <group position={[0, -0.1, 0]}>
        {droplets.map((d, idx) => (
          <mesh
            key={idx}
            position={[d.x, d.y, d.z]}
            renderOrder={15}
          >
            <sphereGeometry args={[d.r, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshPhysicalMaterial
              color="#FFFFFF"
              transmission={0.92}
              roughness={0.01}
              ior={1.33}
              clearcoat={1.0}
              reflectivity={1.0}
              specularIntensity={1.8}
            />
          </mesh>
        ))}
      </group>

      {/* Main Emerald-Cut Chamfered Crystal Body */}
      <mesh
        geometry={outerBodyGeo}
        position={[0, -0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
        renderOrder={10}
      >
        <meshPhysicalMaterial
          color={isDark ? "#EDE3DF" : "#E4D8D2"}
          roughness={0.02}
          metalness={0.02}
          transmission={0.88}
          ior={1.52}
          thickness={1.1}
          attenuationColor={isDark ? "#D2B8AE" : "#C4A69B"}
          attenuationDistance={1.3}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          reflectivity={1.0}
          specularIntensity={1.5}
          specularColor="#FFFFFF"
          envMapIntensity={isDark ? 2.8 : 2.5}
        />
      </mesh>

      {/* Solid Crystal Glass Punt (Thick Heavy Glass Pedestal Base) */}
      <mesh
        geometry={basePuntGeo}
        position={[0, -1.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
        renderOrder={10}
      >
        <meshPhysicalMaterial
          color={isDark ? "#DECBC4" : "#D0BCB4"}
          roughness={0.02}
          metalness={0.04}
          transmission={0.75}
          ior={1.53}
          thickness={1.8}
          attenuationColor={isDark ? "#C0A49A" : "#B29489"}
          attenuationDistance={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          reflectivity={1.0}
          specularIntensity={1.6}
          envMapIntensity={3.2}
        />
      </mesh>

      {/* Beveled Crystal Shoulder */}
      <mesh
        geometry={shoulderGeo}
        position={[0, 0.78, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={10}
      >
        <meshPhysicalMaterial
          color={isDark ? "#EDE3DF" : "#E4D8D2"}
          roughness={0.02}
          metalness={0.02}
          transmission={0.84}
          ior={1.52}
          thickness={1.0}
          attenuationColor={isDark ? "#D2B8AE" : "#C4A69B"}
          attenuationDistance={1.2}
          clearcoat={1.0}
          reflectivity={1.0}
          envMapIntensity={2.6}
        />
      </mesh>

      {/* Cylindrical Glass Bottle Neck */}
      <mesh position={[0, 0.94, 0]} renderOrder={10}>
        <cylinderGeometry args={[0.24, 0.28, 0.18, 32]} />
        <meshPhysicalMaterial
          color={isDark ? "#EDE3DF" : "#E4D8D2"}
          roughness={0.02}
          transmission={0.84}
          ior={1.52}
          thickness={0.8}
          clearcoat={1.0}
        />
      </mesh>

      {/* ============================================================== */}
      {/* 3. LUXURY FRONT LABEL (RENDERED ON TOP ONLY - ZERO GHOSTING)   */}
      {/* ============================================================== */}
      <group position={[0, -0.12, 0.50]}>
        {/* Brushed Gold Backing Plate (Completely blocks reverse bleed-through) */}
        <mesh position={[0, 0, -0.004]} renderOrder={99}>
          <boxGeometry args={[0.86, 1.02, 0.008]} />
          <meshPhysicalMaterial
            color="#D4A778"
            emissive="#5C3B24"
            emissiveIntensity={0.15}
            metalness={0.92}
            roughness={0.16}
            clearcoat={1.0}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* High-Resolution Front Label Canvas (Single-sided Front ONLY - Zero ghosting) */}
        <mesh position={[0, 0, 0.004]} renderOrder={100}>
          <planeGeometry args={[0.82, 0.98]} />
          <meshStandardMaterial
            map={labelTexture ?? undefined}
            color="#FFFFFF"
            roughness={0.3}
            metalness={0.05}
            side={THREE.FrontSide}
            transparent={true}
            opacity={1.0}
            depthWrite={true}
          />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 4. POLISHED ROSE GOLD ATOMIZER NECK & COLLAR ASSEMBLY          */}
      {/* ============================================================== */}
      {/* Base Flanged Collar Ring */}
      <mesh position={[0, 0.96, 0]} castShadow renderOrder={5}>
        <cylinderGeometry args={[0.33, 0.35, 0.06, 64]} />
        <meshPhysicalMaterial
          color="#E8BA98"
          emissive="#6B4129"
          emissiveIntensity={0.2}
          metalness={0.95}
          roughness={0.1}
          clearcoat={1.0}
          envMapIntensity={3.2}
        />
      </mesh>

      {/* Knurled Collar Ring */}
      <mesh position={[0, 1.02, 0]} renderOrder={5}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 64]} />
        <meshPhysicalMaterial
          color="#F2CCA4"
          metalness={0.94}
          roughness={0.18}
          clearcoat={0.9}
          envMapIntensity={3.0}
        />
      </mesh>

      {/* Main Mirror-Polished Gold Collar Column */}
      <mesh position={[0, 1.12, 0]} castShadow renderOrder={5}>
        <cylinderGeometry args={[0.26, 0.28, 0.16, 64]} />
        <meshPhysicalMaterial
          color="#E8BA98"
          emissive="#613C25"
          emissiveIntensity={0.18}
          metalness={0.96}
          roughness={0.08}
          clearcoat={1.0}
          envMapIntensity={3.4}
        />
      </mesh>

      {/* Stepped Transition Ring */}
      <mesh position={[0, 1.21, 0]} renderOrder={5}>
        <cylinderGeometry args={[0.28, 0.26, 0.04, 64]} />
        <meshPhysicalMaterial
          color="#F9DFC4"
          metalness={0.96}
          roughness={0.08}
          clearcoat={1.0}
        />
      </mesh>

      {/* Inner Golden Spray Pump Head Actuator */}
      <mesh position={[0, 1.3, 0]} renderOrder={5}>
        <cylinderGeometry args={[0.16, 0.16, 0.18, 48]} />
        <meshPhysicalMaterial
          color="#E8BA98"
          metalness={0.94}
          roughness={0.12}
          envMapIntensity={2.8}
        />
      </mesh>

      {/* Atomizer Nozzle Orifice Hole */}
      <mesh position={[0, 1.31, 0.162]} rotation={[Math.PI / 2, 0, 0]} renderOrder={6}>
        <cylinderGeometry args={[0.022, 0.022, 0.025, 24]} />
        <meshStandardMaterial color="#1C1412" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ============================================================== */}
      {/* 5. SEAMLESS CRYSTAL JEWEL STOPPER (CAP) - ZERO DUPLICATION     */}
      {/* ============================================================== */}
      <group position={[0, 1.56, 0]}>
        {/* Main Crystal Stopper (Faceted Cut Crystal Jewel) */}
        <mesh
          geometry={capGeo}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          renderOrder={20}
        >
          <meshPhysicalMaterial
            color={isDark ? "#F8EFEA" : "#F2E8E2"}
            roughness={0.01}
            metalness={0.04}
            transmission={0.76}
            ior={1.54}
            thickness={1.6}
            attenuationColor={isDark ? "#D4B9AF" : "#C6A89D"}
            attenuationDistance={1.1}
            clearcoat={1.0}
            clearcoatRoughness={0.01}
            reflectivity={1.0}
            specularIntensity={1.8}
            specularColor="#FFFFFF"
            flatShading={true}
            envMapIntensity={3.8}
          />
        </mesh>

        {/* Top Chamfered Diamond Table Facet */}
        <mesh
          geometry={capTableGeo}
          position={[0, 0.22, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          renderOrder={21}
        >
          <meshPhysicalMaterial
            color={isDark ? "#FAF3EF" : "#F6ECE6"}
            roughness={0.01}
            metalness={0.03}
            transmission={0.72}
            ior={1.54}
            thickness={1.0}
            attenuationColor={isDark ? "#D8BFB5" : "#CBAFA4"}
            attenuationDistance={1.0}
            clearcoat={1.0}
            reflectivity={1.0}
            specularIntensity={1.9}
            flatShading={true}
            envMapIntensity={4.0}
          />
        </mesh>
      </group>
    </group>
  );
}
