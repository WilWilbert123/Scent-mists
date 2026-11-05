"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePerfumeLabelTexture } from "./model-materials";

interface PerfumeModelProps {
  theme: "light" | "dark";
}

/**
 * Constructs a smooth rounded rectangular cross section with delicate corner radiuses.
 * Restores the iconic slender, elegant Parisian flacon silhouette (width: 0.76, depth: 0.44).
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
 * - Slender, perfectly proportioned Parisian crystal flacon (0.76 width)
 * - Single front-only luxury embossed label on matte cream paper backing
 * - ZERO mirror reflection at the back of the bottle (FrontSide glass culls internal back reflections)
 * - Fresh luminous perfume water / elixir inside with realistic water line and rising micro-bubbles
 * - Exterior crystal condensation dew droplets
 * - Polished rose-gold atomizer pump and smooth crystal stopper cap
 */
export function PerfumeModel({ theme }: PerfumeModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bubbleRefs = useRef<(THREE.Mesh | null)[]>([]);
  const waterMeniscusRef = useRef<THREE.Mesh>(null);
  const labelTexture = usePerfumeLabelTexture(theme);
  const isDark = theme === "dark";

  // Base position aligned with background stone ledge
  const basePosition: [number, number, number] = isDark
    ? [0.14, -0.46, 0]
    : [0.12, -0.10, 0];

  // Fresh effervescent micro-bubbles inside the fresh perfume water chamber
  const bubbles = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => ({
      x: (Math.sin(i * 1.7) * 0.20) + (i % 2 === 0 ? 0.015 : -0.015),
      initialY: -0.7 + (i / 22) * 1.15,
      z: (Math.cos(i * 2.3) * 0.08) + 0.01,
      radius: 0.010 + (i % 4) * 0.004,
      speed: 0.05 + (i % 3) * 0.03,
      swayOffset: i * 0.75,
    }));
  }, []);

  // Fresh water dew droplets condensed on the outer crystal glass
  const droplets = useMemo(() => [
    // On the crystal shoulder
    { x: -0.28, y: 0.76, z: 0.21, r: 0.024 },
    { x: -0.16, y: 0.81, z: 0.22, r: 0.018 },
    { x: 0.22, y: 0.78, z: 0.21, r: 0.026 },
    { x: 0.32, y: 0.74, z: 0.19, r: 0.020 },
    { x: 0.12, y: 0.82, z: 0.22, r: 0.016 },
    { x: -0.08, y: 0.80, z: 0.22, r: 0.018 },
    // On the corners
    { x: -0.37, y: 0.25, z: 0.19, r: 0.022 },
    { x: 0.37, y: 0.35, z: 0.19, r: 0.021 },
    { x: -0.38, y: -0.45, z: 0.18, r: 0.024 },
    { x: 0.38, y: -0.35, z: 0.18, r: 0.020 },
    // On the heavy crystal base punt
    { x: -0.32, y: -0.98, z: 0.21, r: 0.026 },
    { x: 0.28, y: -1.02, z: 0.22, r: 0.028 },
    { x: 0.08, y: -0.96, z: 0.23, r: 0.018 },
    { x: -0.12, y: -1.04, z: 0.22, r: 0.022 },
  ], []);

  // 1. Sleek slender crystal flacon body (width: 0.76, depth: 0.44)
  const outerBodyGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(0.76, 0.44, 0.08);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 1.58,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 2,
      curveSegments: 24,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    });
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, []);

  // 2. Heavy solid crystal glass pedestal base (glass punt)
  const basePuntGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(0.78, 0.46, 0.08);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.36,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      curveSegments: 24,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, []);

  // 3. Chamfered crystal shoulder transition
  const shoulderGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(0.68, 0.38, 0.06);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      curveSegments: 24,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, []);

  // 4. Inner liquid elixir geometry (fresh perfume water volume)
  const liquidCoreGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(0.66, 0.34, 0.05);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 1.24,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      curveSegments: 24,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, []);

  // 5. Clean luxury crystal stopper cap (width: 0.54, depth: 0.36)
  const capGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(0.54, 0.36, 0.07);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.36,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      curveSegments: 24,
      bevelSize: 0.06,
      bevelThickness: 0.08,
    });
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, []);

  // 6. Top diamond table facet on cap
  const capTableGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(0.38, 0.25, 0.05);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      curveSegments: 18,
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

    // Subtle drift rotation (keeps the front label facing forward)
    groupRef.current.rotation.y = Math.sin(t * 0.18) * 0.05;
    groupRef.current.rotation.x = Math.sin(t * 0.12) * 0.005;

    // Animate water meniscus gentle surface ripple
    if (waterMeniscusRef.current) {
      waterMeniscusRef.current.position.y = 0.48 + Math.sin(t * 1.8) * 0.003;
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
      mesh.position.x = b.x + Math.sin(t * 1.5 + b.swayOffset) * 0.008;
    });
  });

  return (
    <group
      ref={groupRef}
      position={basePosition}
      rotation={[0, -0.02, 0]}
      scale={0.96}
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
          color={isDark ? "#FFAE7A" : "#FFE0C8"}
          emissive={isDark ? "#591E0A" : "#803512"}
          emissiveIntensity={isDark ? 0.25 : 0.15}
          transmission={0.88}
          roughness={0.02}
          metalness={0.01}
          ior={1.33}
          thickness={0.65}
          attenuationColor={isDark ? "#E08B5B" : "#FFC49E"}
          attenuationDistance={1.2}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          reflectivity={0.3}
          envMapIntensity={2.4}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Fresh Water Surface Meniscus Line (Visible fluid boundary) */}
      <mesh
        ref={waterMeniscusRef}
        position={[0, 0.48, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={3}
      >
        <planeGeometry args={[0.66, 0.34, 16, 16]} />
        <meshPhysicalMaterial
          color="#FFE8DB"
          transmission={0.82}
          roughness={0.02}
          metalness={0.02}
          clearcoat={1.0}
          ior={1.33}
          reflectivity={0.3}
          transparent={true}
          opacity={0.80}
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
      <mesh position={[0.012, -0.12, 0.01]} rotation={[0, 0, 0.022]} renderOrder={3}>
        <cylinderGeometry args={[0.012, 0.010, 1.68, 32]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transmission={0.72}
          roughness={0.04}
          metalness={0.05}
          clearcoat={1.0}
          ior={1.48}
        />
      </mesh>

      {/* ============================================================== */}
      {/* 2. OUTER CRYSTAL FLACON GLASS (ZERO MIRROR AT BACK)            */}
      {/* Uses FrontSide culling so the back glass CANNOT act as mirror  */}
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
              reflectivity={0.6}
              specularIntensity={1.5}
            />
          </mesh>
        ))}
      </group>

      {/* Main Luxury Slender Crystal Body (FrontSide Only = Zero Back Mirror Reflection) */}
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
          roughness={0.03}
          metalness={0.01}
          transmission={0.92}
          ior={1.28}
          thickness={0.55}
          attenuationColor={isDark ? "#D2B8AE" : "#CDB3A7"}
          attenuationDistance={1.6}
          clearcoat={1.0}
          clearcoatRoughness={0.015}
          reflectivity={0.35}
          specularIntensity={1.0}
          specularColor="#FFFFFF"
          envMapIntensity={isDark ? 2.6 : 2.4}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Solid Heavy Crystal Base Punt (Glass Pedestal Foot) */}
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
          metalness={0.02}
          transmission={0.85}
          ior={1.35}
          thickness={1.2}
          attenuationColor={isDark ? "#C0A49A" : "#B29489"}
          attenuationDistance={1.1}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          reflectivity={0.4}
          specularIntensity={1.2}
          envMapIntensity={2.8}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Beveled Crystal Shoulder */}
      <mesh
        geometry={shoulderGeo}
        position={[0, 0.77, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={10}
      >
        <meshPhysicalMaterial
          color={isDark ? "#EDE3DF" : "#F6EFEA"}
          roughness={0.02}
          metalness={0.01}
          transmission={0.88}
          ior={1.32}
          thickness={0.65}
          attenuationColor={isDark ? "#D2B8AE" : "#CDB3A7"}
          attenuationDistance={1.3}
          clearcoat={1.0}
          reflectivity={0.35}
          envMapIntensity={2.6}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Cylindrical Glass Bottle Neck */}
      <mesh position={[0, 0.93, 0]} renderOrder={10}>
        <cylinderGeometry args={[0.22, 0.26, 0.18, 32]} />
        <meshPhysicalMaterial
          color={isDark ? "#EDE3DF" : "#F6EFEA"}
          roughness={0.02}
          transmission={0.85}
          ior={1.35}
          thickness={0.6}
          clearcoat={1.0}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* ============================================================== */}
      {/* 3. LUXURY FRONT LABEL (SINGLE FRONT INSTANCE - NO MIRROR)       */}
      {/* Sits snug on the front crystal face with matte backing         */}
      {/* ============================================================== */}
      <group position={[0, -0.12, 0.248]}>
        {/* Soft Matte Ivory Paper Backing (Completely non-reflective, blocks any bleed) */}
        <mesh position={[0, 0, -0.002]} renderOrder={99}>
          <planeGeometry args={[0.54, 0.68]} />
          <meshBasicMaterial
            color="#FAF5EE"
            side={THREE.DoubleSide}
            depthWrite={true}
          />
        </mesh>

        {/* High-Resolution Front Label Canvas (Single-sided Front ONLY) */}
        <mesh position={[0, 0, 0.002]} renderOrder={100}>
          <planeGeometry args={[0.52, 0.66]} />
          <meshStandardMaterial
            map={labelTexture ?? undefined}
            color="#FFFFFF"
            roughness={0.40}
            metalness={0.01}
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
      <mesh position={[0, 0.95, 0]} castShadow renderOrder={5}>
        <cylinderGeometry args={[0.28, 0.30, 0.06, 64]} />
        <meshPhysicalMaterial
          color="#E8BA98"
          emissive="#6B4129"
          emissiveIntensity={0.16}
          metalness={0.95}
          roughness={0.10}
          clearcoat={1.0}
          envMapIntensity={3.2}
        />
      </mesh>

      {/* Knurled Collar Ring */}
      <mesh position={[0, 1.01, 0]} renderOrder={5}>
        <cylinderGeometry args={[0.26, 0.26, 0.06, 64]} />
        <meshPhysicalMaterial
          color="#F2CCA4"
          metalness={0.94}
          roughness={0.16}
          clearcoat={0.9}
          envMapIntensity={3.0}
        />
      </mesh>

      {/* Main Mirror-Polished Gold Collar Column */}
      <mesh position={[0, 1.11, 0]} castShadow renderOrder={5}>
        <cylinderGeometry args={[0.23, 0.24, 0.16, 64]} />
        <meshPhysicalMaterial
          color="#E8BA98"
          emissive="#613C25"
          emissiveIntensity={0.15}
          metalness={0.96}
          roughness={0.07}
          clearcoat={1.0}
          envMapIntensity={3.4}
        />
      </mesh>

      {/* Stepped Transition Ring */}
      <mesh position={[0, 1.20, 0]} renderOrder={5}>
        <cylinderGeometry args={[0.25, 0.23, 0.04, 64]} />
        <meshPhysicalMaterial
          color="#F9DFC4"
          metalness={0.96}
          roughness={0.07}
          clearcoat={1.0}
        />
      </mesh>

      {/* Inner Golden Spray Pump Head Actuator */}
      <mesh position={[0, 1.29, 0]} renderOrder={5}>
        <cylinderGeometry args={[0.15, 0.15, 0.18, 48]} />
        <meshPhysicalMaterial
          color="#E8BA98"
          metalness={0.94}
          roughness={0.10}
          envMapIntensity={3.0}
        />
      </mesh>

      {/* Atomizer Nozzle Orifice Hole */}
      <mesh position={[0, 1.30, 0.152]} rotation={[Math.PI / 2, 0, 0]} renderOrder={6}>
        <cylinderGeometry args={[0.018, 0.018, 0.025, 24]} />
        <meshStandardMaterial color="#1C1412" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ============================================================== */}
      {/* 5. SMOOTH CRYSTAL JEWEL STOPPER CAP (ZERO FLAT POLYGONS)       */}
      {/* ============================================================== */}
      <group position={[0, 1.55, 0]}>
        {/* Main Crystal Stopper Cap (Slender proportions: 0.54 width) */}
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
            ior={1.45}
            thickness={1.2}
            attenuationColor={isDark ? "#D4B9AF" : "#C6A89D"}
            attenuationDistance={1.2}
            clearcoat={1.0}
            clearcoatRoughness={0.01}
            reflectivity={0.6}
            specularIntensity={1.6}
            specularColor="#FFFFFF"
            envMapIntensity={3.6}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Top Chamfered Diamond Table Facet */}
        <mesh
          geometry={capTableGeo}
          position={[0, 0.21, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          renderOrder={21}
        >
          <meshPhysicalMaterial
            color={isDark ? "#FAF3EF" : "#F6ECE6"}
            roughness={0.01}
            metalness={0.02}
            transmission={0.78}
            ior={1.45}
            thickness={0.9}
            attenuationColor={isDark ? "#D8BFB5" : "#CBAFA4"}
            attenuationDistance={1.1}
            clearcoat={1.0}
            reflectivity={0.6}
            specularIntensity={1.7}
            envMapIntensity={3.8}
            side={THREE.FrontSide}
          />
        </mesh>
      </group>
    </group>
  );
}
