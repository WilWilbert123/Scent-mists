"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePerfumeLabelTexture } from "./model-materials";

interface PerfumeModelProps {
  theme: "light" | "dark";
}

/**
 * Constructs a smooth rounded rectangular cross section with generous fillets.
 * Replicates the silhouette of iconic Parisian luxury crystal flacons (Chanel No. 5 / Tom Ford).
 */
function createRoundedFlaconShape(width: number, depth: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hd = depth / 2;
  const r = Math.min(radius, hw - 0.02, hd - 0.02);

  shape.moveTo(-hw + r, -hd);
  shape.lineTo(hw - r, -hd);
  shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
  shape.lineTo(hw, hd - r);
  shape.quadraticCurveTo(hw, hd, hw - r, hd);
  shape.lineTo(-hw + r, hd);
  shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
  shape.lineTo(-hw, -hd + r);
  shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
  shape.closePath();
  return shape;
}

/**
 * Photorealistic 3D Luxury Crystal Perfume Flacon for SCENTS & MISTS.
 * Features:
 * - Ultra-smooth curved crystal glass body with heavy solid glass base (no jagged facets)
 * - Fresh luminous perfume water / elixir inside with realistic water line and rising micro-bubbles
 * - Condensation dew droplets on the exterior glass
 * - Mirror-polished rose-gold atomizer pump and collar
 * - Silky smooth faceted crystal stopper cap (zero flat polygonal shading)
 * - Pristine single front label with zero reverse bleed or duplicate side reflections
 */
export function PerfumeModel({ theme }: PerfumeModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bubbleRefs = useRef<(THREE.Mesh | null)[]>([]);
  const waterMeniscusRef = useRef<THREE.Mesh>(null);
  const labelTexture = usePerfumeLabelTexture(theme);
  const isDark = theme === "dark";

  // Base position aligned with background stone ledge
  const basePosition: [number, number, number] = isDark
    ? [0.14, -0.62, 0]
    : [0.12, -0.22, 0];

  // Fresh effervescent micro-bubbles inside the fresh perfume water chamber
  const bubbles = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      x: (Math.sin(i * 1.6) * 0.28) + (i % 2 === 0 ? 0.02 : -0.02),
      initialY: -0.7 + (i / 24) * 1.15,
      z: (Math.cos(i * 2.2) * 0.12) + 0.01,
      radius: 0.010 + (i % 4) * 0.004,
      speed: 0.05 + (i % 3) * 0.03,
      swayOffset: i * 0.75,
    }));
  }, []);

  // Fresh water dew droplets condensed on the outer crystal glass
  const droplets = useMemo(() => [
    // On the crystal shoulder
    { x: -0.40, y: 0.76, z: 0.26, r: 0.026 },
    { x: -0.25, y: 0.81, z: 0.28, r: 0.020 },
    { x: 0.30, y: 0.78, z: 0.27, r: 0.028 },
    { x: 0.42, y: 0.74, z: 0.24, r: 0.022 },
    { x: 0.16, y: 0.82, z: 0.28, r: 0.018 },
    { x: -0.12, y: 0.80, z: 0.27, r: 0.020 },
    // On the rounded curved corners
    { x: -0.52, y: 0.25, z: 0.26, r: 0.024 },
    { x: 0.52, y: 0.35, z: 0.26, r: 0.023 },
    { x: -0.54, y: -0.45, z: 0.24, r: 0.026 },
    { x: 0.54, y: -0.35, z: 0.24, r: 0.022 },
    // On the heavy crystal base punt
    { x: -0.44, y: -0.98, z: 0.26, r: 0.028 },
    { x: 0.40, y: -1.02, z: 0.27, r: 0.030 },
    { x: 0.10, y: -0.96, z: 0.29, r: 0.020 },
    { x: -0.15, y: -1.04, z: 0.28, r: 0.024 },
  ], []);

  // 1. Sleek luxury curved crystal flacon body with smooth fillets (Chanel/Dior silhouette)
  const outerBodyGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(1.08, 0.64, 0.14);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 1.56,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 2,
      curveSegments: 32,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, []);

  // 2. Heavy solid crystal glass pedestal base (glass punt)
  const basePuntGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(1.10, 0.66, 0.14);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      curveSegments: 32,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, []);

  // 3. Chamfered crystal shoulder transition
  const shoulderGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(0.96, 0.54, 0.12);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      curveSegments: 32,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, []);

  // 4. Inner liquid elixir geometry (fresh perfume water volume)
  const liquidCoreGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(0.96, 0.52, 0.10);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 1.28,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      curveSegments: 32,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, []);

  // 5. Clean luxury crystal stopper cap (smooth curves, zero jagged facets)
  const capGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(0.72, 0.46, 0.10);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      curveSegments: 32,
      bevelSize: 0.06,
      bevelThickness: 0.08,
    });
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, []);

  // 6. Top diamond table facet on cap
  const capTableGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(0.52, 0.32, 0.08);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      curveSegments: 24,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, []);

  // Graceful slow-motion showcase rotation & dynamic water animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Smooth subtle showcase drift (gentle sway keeps the label pristine)
    groupRef.current.rotation.y = Math.sin(t * 0.20) * 0.06;
    groupRef.current.rotation.x = Math.sin(t * 0.14) * 0.006;

    // Animate water meniscus gentle surface ripple
    if (waterMeniscusRef.current) {
      waterMeniscusRef.current.position.y = 0.49 + Math.sin(t * 1.8) * 0.003;
      waterMeniscusRef.current.rotation.x = (-Math.PI / 2) + Math.sin(t * 1.4) * 0.008;
    }

    // Animate fresh micro-bubbles rising inside the perfume water
    bubbleRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const b = bubbles[idx];
      if (!b) return;
      const cycleHeight = 1.25;
      const progressY = ((t * b.speed + b.initialY + 0.8) % cycleHeight) - 0.75;
      mesh.position.y = progressY;
      mesh.position.x = b.x + Math.sin(t * 1.5 + b.swayOffset) * 0.010;
    });
  });

  return (
    <group
      ref={groupRef}
      position={basePosition}
      rotation={[0, -0.03, 0]}
      scale={0.76}
    >
      {/* ============================================================== */}
      {/* 1. FRESH PERFUME WATER & ELIXIR (INTERNAL FLUID CHAMBER)       */}
      {/* ============================================================== */}
      <mesh
        geometry={liquidCoreGeo}
        position={[0, -0.15, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={2}
      >
        <meshPhysicalMaterial
          color={isDark ? "#FFAE7A" : "#FFE0C8"}
          emissive={isDark ? "#591E0A" : "#803512"}
          emissiveIntensity={isDark ? 0.28 : 0.18}
          transmission={0.88}
          roughness={0.015}
          metalness={0.02}
          ior={1.34}
          thickness={0.75}
          attenuationColor={isDark ? "#E08B5B" : "#FFC49E"}
          attenuationDistance={1.2}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          reflectivity={1.0}
          envMapIntensity={2.8}
        />
      </mesh>

      {/* Fresh Water Surface Meniscus Line (Visible fluid boundary) */}
      <mesh
        ref={waterMeniscusRef}
        position={[0, 0.49, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={3}
      >
        <planeGeometry args={[0.92, 0.48, 16, 16]} />
        <meshPhysicalMaterial
          color="#FFE8DB"
          transmission={0.80}
          roughness={0.02}
          metalness={0.04}
          clearcoat={1.0}
          ior={1.34}
          reflectivity={1.0}
          transparent={true}
          opacity={0.85}
        />
      </mesh>

      {/* Fresh Effervescent Micro-Bubbles inside the water */}
      <group position={[0, -0.15, 0]}>
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
              emissiveIntensity={0.25}
              transmission={0.90}
              roughness={0.02}
              ior={1.33}
              clearcoat={1.0}
            />
          </mesh>
        ))}
      </group>

      {/* Internal Glass Dip Tube (Atomizer Straw) */}
      <mesh position={[0.012, -0.12, 0.01]} rotation={[0, 0, 0.025]} renderOrder={3}>
        <cylinderGeometry args={[0.013, 0.011, 1.68, 32]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transmission={0.70}
          roughness={0.04}
          metalness={0.08}
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
              transmission={0.94}
              roughness={0.01}
              ior={1.33}
              clearcoat={1.0}
              reflectivity={1.0}
              specularIntensity={1.8}
            />
          </mesh>
        ))}
      </group>

      {/* Main Luxury Curved Crystal Body (Smooth Normals, Zero Jagged Facets) */}
      <mesh
        geometry={outerBodyGeo}
        position={[0, -0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
        renderOrder={10}
      >
        <meshPhysicalMaterial
          color={isDark ? "#EDE3DF" : "#F6EFEA"}
          roughness={0.02}
          metalness={0.03}
          transmission={0.90}
          ior={1.52}
          thickness={0.80}
          attenuationColor={isDark ? "#D2B8AE" : "#CDB3A7"}
          attenuationDistance={1.5}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          reflectivity={1.0}
          specularIntensity={1.8}
          specularColor="#FFFFFF"
          envMapIntensity={isDark ? 3.2 : 2.9}
        />
      </mesh>

      {/* Solid Heavy Crystal Base Punt (Pedestal Foot) */}
      <mesh
        geometry={basePuntGeo}
        position={[0, -1.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
        renderOrder={10}
      >
        <meshPhysicalMaterial
          color={isDark ? "#DECBC4" : "#D8C5BD"}
          roughness={0.02}
          metalness={0.03}
          transmission={0.82}
          ior={1.52}
          thickness={1.5}
          attenuationColor={isDark ? "#C0A49A" : "#B29489"}
          attenuationDistance={1.0}
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
        position={[0, 0.76, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={10}
      >
        <meshPhysicalMaterial
          color={isDark ? "#EDE3DF" : "#F6EFEA"}
          roughness={0.02}
          metalness={0.02}
          transmission={0.88}
          ior={1.50}
          thickness={0.8}
          attenuationColor={isDark ? "#D2B8AE" : "#CDB3A7"}
          attenuationDistance={1.3}
          clearcoat={1.0}
          reflectivity={1.0}
          envMapIntensity={2.9}
        />
      </mesh>

      {/* Cylindrical Glass Bottle Neck */}
      <mesh position={[0, 0.92, 0]} renderOrder={10}>
        <cylinderGeometry args={[0.24, 0.28, 0.18, 32]} />
        <meshPhysicalMaterial
          color={isDark ? "#EDE3DF" : "#F6EFEA"}
          roughness={0.02}
          transmission={0.85}
          ior={1.48}
          thickness={0.7}
          clearcoat={1.0}
        />
      </mesh>

      {/* ============================================================== */}
      {/* 3. LUXURY FRONT LABEL (SINGLE INSTANCE FRONT ONLY - NO GHOST)   */}
      {/* Centered on the flat front face with zero edge bleed           */}
      {/* ============================================================== */}
      <group position={[0, -0.12, 0.355]}>
        {/* Brushed Gold Backing Plate (Completely blocks reverse bleed-through) */}
        <mesh position={[0, 0, -0.003]} renderOrder={99}>
          <planeGeometry args={[0.68, 0.84]} />
          <meshPhysicalMaterial
            color="#D4A778"
            emissive="#5C3B24"
            emissiveIntensity={0.12}
            metalness={0.92}
            roughness={0.18}
            clearcoat={0.9}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* High-Resolution Front Label Canvas (Single-sided Front ONLY) */}
        <mesh position={[0, 0, 0.003]} renderOrder={100}>
          <planeGeometry args={[0.66, 0.82]} />
          <meshStandardMaterial
            map={labelTexture ?? undefined}
            color="#FFFFFF"
            roughness={0.35}
            metalness={0.02}
            side={THREE.FrontSide}
            transparent={false}
            depthWrite={true}
            depthTest={true}
            polygonOffset={true}
            polygonOffsetFactor={-2}
            polygonOffsetUnits={-2}
          />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 4. POLISHED ROSE GOLD ATOMIZER NECK & COLLAR ASSEMBLY          */}
      {/* ============================================================== */}
      {/* Base Flanged Collar Ring */}
      <mesh position={[0, 0.94, 0]} castShadow renderOrder={5}>
        <cylinderGeometry args={[0.32, 0.34, 0.06, 64]} />
        <meshPhysicalMaterial
          color="#E8BA98"
          emissive="#6B4129"
          emissiveIntensity={0.18}
          metalness={0.95}
          roughness={0.10}
          clearcoat={1.0}
          envMapIntensity={3.2}
        />
      </mesh>

      {/* Knurled Collar Ring */}
      <mesh position={[0, 1.00, 0]} renderOrder={5}>
        <cylinderGeometry args={[0.29, 0.29, 0.06, 64]} />
        <meshPhysicalMaterial
          color="#F2CCA4"
          metalness={0.94}
          roughness={0.16}
          clearcoat={0.9}
          envMapIntensity={3.0}
        />
      </mesh>

      {/* Main Mirror-Polished Gold Collar Column */}
      <mesh position={[0, 1.10, 0]} castShadow renderOrder={5}>
        <cylinderGeometry args={[0.25, 0.27, 0.16, 64]} />
        <meshPhysicalMaterial
          color="#E8BA98"
          emissive="#613C25"
          emissiveIntensity={0.16}
          metalness={0.96}
          roughness={0.07}
          clearcoat={1.0}
          envMapIntensity={3.4}
        />
      </mesh>

      {/* Stepped Transition Ring */}
      <mesh position={[0, 1.19, 0]} renderOrder={5}>
        <cylinderGeometry args={[0.27, 0.25, 0.04, 64]} />
        <meshPhysicalMaterial
          color="#F9DFC4"
          metalness={0.96}
          roughness={0.07}
          clearcoat={1.0}
        />
      </mesh>

      {/* Inner Golden Spray Pump Head Actuator */}
      <mesh position={[0, 1.28, 0]} renderOrder={5}>
        <cylinderGeometry args={[0.16, 0.16, 0.18, 48]} />
        <meshPhysicalMaterial
          color="#E8BA98"
          metalness={0.94}
          roughness={0.10}
          envMapIntensity={3.0}
        />
      </mesh>

      {/* Atomizer Nozzle Orifice Hole */}
      <mesh position={[0, 1.29, 0.162]} rotation={[Math.PI / 2, 0, 0]} renderOrder={6}>
        <cylinderGeometry args={[0.020, 0.020, 0.025, 24]} />
        <meshStandardMaterial color="#1C1412" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ============================================================== */}
      {/* 5. SMOOTH CRYSTAL JEWEL STOPPER CAP (ZERO FLAT POLYGONS)       */}
      {/* ============================================================== */}
      <group position={[0, 1.54, 0]}>
        {/* Main Crystal Stopper Cap (Curved Bevels, Smooth Reflections) */}
        <mesh
          geometry={capGeo}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          renderOrder={20}
        >
          <meshPhysicalMaterial
            color={isDark ? "#F8EFEA" : "#F2E8E2"}
            roughness={0.015}
            metalness={0.03}
            transmission={0.82}
            ior={1.52}
            thickness={1.4}
            attenuationColor={isDark ? "#D4B9AF" : "#C6A89D"}
            attenuationDistance={1.2}
            clearcoat={1.0}
            clearcoatRoughness={0.01}
            reflectivity={1.0}
            specularIntensity={1.8}
            specularColor="#FFFFFF"
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
            metalness={0.02}
            transmission={0.78}
            ior={1.52}
            thickness={1.0}
            attenuationColor={isDark ? "#D8BFB5" : "#CBAFA4"}
            attenuationDistance={1.1}
            clearcoat={1.0}
            reflectivity={1.0}
            specularIntensity={1.9}
            envMapIntensity={4.0}
          />
        </mesh>
      </group>
    </group>
  );
}
