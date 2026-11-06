"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePerfumeLabelTexture } from "./model-materials";
import { useMediaQuery } from "@/hooks/use-media-query";

interface PerfumeModelProps {
  theme: "light" | "dark";
}

/**
 * Constructs a smooth rounded rectangular cross section with delicate corner radiuses.
 * Balanced luxury flacon proportions (wider body, reduced height, iconic 1:1.25 ratio).
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
 * - Perfectly balanced classic luxury flacon silhouette (width: 0.92, body height: 1.15)
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
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Base position aligned with background stone ledge with balanced headroom so cap and base never clip
  const basePosition: [number, number, number] = isDark
    ? [isMobile ? 0.12 : 0.14, isMobile ? -0.50 : -0.58, 0]
    : [isMobile ? 0.10 : 0.12, isMobile ? -0.22 : -0.18, 0];

  // Fresh effervescent micro-bubbles inside the fresh perfume water chamber
  const bubbles = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => ({
      x: (Math.sin(i * 1.7) * 0.24) + (i % 2 === 0 ? 0.015 : -0.015),
      initialY: -0.55 + (i / 22) * 0.85,
      z: (Math.cos(i * 2.3) * 0.08) + 0.01,
      radius: 0.010 + (i % 4) * 0.004,
      speed: 0.05 + (i % 3) * 0.03,
      swayOffset: i * 0.75,
    }));
  }, []);

  // Fresh water dew droplets condensed on the outer crystal glass
  const droplets = useMemo(() => [
    // On the crystal shoulder
    { x: -0.34, y: 0.58, z: 0.23, r: 0.024 },
    { x: -0.20, y: 0.62, z: 0.24, r: 0.018 },
    { x: 0.26, y: 0.60, z: 0.23, r: 0.026 },
    { x: 0.38, y: 0.56, z: 0.21, r: 0.020 },
    { x: 0.14, y: 0.63, z: 0.24, r: 0.016 },
    { x: -0.09, y: 0.61, z: 0.24, r: 0.018 },
    // On the corners
    { x: -0.44, y: 0.20, z: 0.21, r: 0.022 },
    { x: 0.44, y: 0.25, z: 0.21, r: 0.021 },
    { x: -0.45, y: -0.35, z: 0.20, r: 0.024 },
    { x: 0.45, y: -0.25, z: 0.20, r: 0.020 },
    // On the heavy crystal base punt
    { x: -0.38, y: -0.72, z: 0.23, r: 0.026 },
    { x: 0.34, y: -0.75, z: 0.24, r: 0.028 },
    { x: 0.10, y: -0.70, z: 0.25, r: 0.018 },
    { x: -0.14, y: -0.76, z: 0.24, r: 0.022 },
  ], []);

  // 1. Balanced luxury crystal flacon body (width: 0.92, depth: 0.48, height: 1.15)
  const outerBodyGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(0.92, 0.48, 0.10);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 1.15,
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
    const shape = createRoundedFlaconShape(0.94, 0.50, 0.10);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.26,
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
    const shape = createRoundedFlaconShape(0.84, 0.42, 0.08);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
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
    const shape = createRoundedFlaconShape(0.82, 0.38, 0.07);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.92,
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

  // 5. Clean luxury crystal stopper cap (width: 0.64, depth: 0.38, height: 0.28)
  const capGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(0.64, 0.38, 0.08);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.28,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      curveSegments: 24,
      bevelSize: 0.05,
      bevelThickness: 0.06,
    });
    geo.computeVertexNormals();
    geo.center();
    return geo;
  }, []);

  // 6. Top diamond table facet on cap
  const capTableGeo = useMemo(() => {
    const shape = createRoundedFlaconShape(0.46, 0.28, 0.06);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      curveSegments: 18,
      bevelSize: 0.025,
      bevelThickness: 0.025,
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
      waterMeniscusRef.current.position.y = 0.32 + Math.sin(t * 1.8) * 0.003;
      waterMeniscusRef.current.rotation.x = (-Math.PI / 2) + Math.sin(t * 1.4) * 0.008;
    }

    // Animate fresh micro-bubbles rising inside the perfume water
    bubbleRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const b = bubbles[idx];
      if (!b) return;
      const cycleHeight = 0.95;
      const progressY = ((t * b.speed + b.initialY + 0.6) % cycleHeight) - 0.55;
      mesh.position.y = progressY;
      mesh.position.x = b.x + Math.sin(t * 1.5 + b.swayOffset) * 0.008;
    });
  });

  return (
    <group
      ref={groupRef}
      position={basePosition}
      rotation={[0, -0.02, 0]}
      scale={isMobile ? 1.05 : 1.28}
    >
      {/* ============================================================== */}
      {/* 1. FRESH PERFUME WATER & ELIXIR (INTERNAL FLUID CHAMBER)       */}
      {/* ============================================================== */}
      <mesh
        geometry={liquidCoreGeo}
        position={[0, -0.10, 0]}
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
        position={[0, 0.32, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={3}
      >
        <planeGeometry args={[0.82, 0.38, 16, 16]} />
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
      <group position={[0, -0.10, 0]}>
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
      <mesh position={[0.012, -0.08, 0.01]} rotation={[0, 0, 0.022]} renderOrder={3}>
        <cylinderGeometry args={[0.012, 0.010, 1.25, 32]} />
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
      <group position={[0, -0.06, 0]}>
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

      {/* Main Luxury Balanced Crystal Body (FrontSide Only = Zero Back Mirror Reflection) */}
      <mesh
        geometry={outerBodyGeo}
        position={[0, -0.06, 0]}
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
        position={[0, -0.74, 0]}
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
        position={[0, 0.58, 0]}
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
      <mesh position={[0, 0.69, 0]} renderOrder={10}>
        <cylinderGeometry args={[0.22, 0.25, 0.12, 32]} />
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
      <group position={[0, -0.06, 0.268]}>
        {/* Soft Matte Ivory Paper Backing (Completely non-reflective, blocks any bleed) */}
        <mesh position={[0, 0, -0.002]} renderOrder={99}>
          <planeGeometry args={[0.62, 0.66]} />
          <meshBasicMaterial
            color="#FAF5EE"
            side={THREE.DoubleSide}
            depthWrite={true}
          />
        </mesh>

        {/* High-Resolution Front Label Canvas (Single-sided Front ONLY) */}
        <mesh position={[0, 0, 0.002]} renderOrder={100}>
          <planeGeometry args={[0.60, 0.64]} />
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
      <mesh position={[0, 0.72, 0]} castShadow renderOrder={5}>
        <cylinderGeometry args={[0.28, 0.30, 0.05, 64]} />
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
      <mesh position={[0, 0.77, 0]} renderOrder={5}>
        <cylinderGeometry args={[0.26, 0.26, 0.05, 64]} />
        <meshPhysicalMaterial
          color="#F2CCA4"
          metalness={0.94}
          roughness={0.16}
          clearcoat={0.9}
          envMapIntensity={3.0}
        />
      </mesh>

      {/* Main Mirror-Polished Gold Collar Column */}
      <mesh position={[0, 0.85, 0]} castShadow renderOrder={5}>
        <cylinderGeometry args={[0.23, 0.24, 0.11, 64]} />
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
      <mesh position={[0, 0.92, 0]} renderOrder={5}>
        <cylinderGeometry args={[0.25, 0.23, 0.035, 64]} />
        <meshPhysicalMaterial
          color="#F9DFC4"
          metalness={0.96}
          roughness={0.07}
          clearcoat={1.0}
        />
      </mesh>

      {/* Inner Golden Spray Pump Head Actuator */}
      <mesh position={[0, 0.99, 0]} renderOrder={5}>
        <cylinderGeometry args={[0.15, 0.15, 0.13, 48]} />
        <meshPhysicalMaterial
          color="#E8BA98"
          metalness={0.94}
          roughness={0.10}
          envMapIntensity={3.0}
        />
      </mesh>

      {/* Atomizer Nozzle Orifice Hole */}
      <mesh position={[0, 1.00, 0.152]} rotation={[Math.PI / 2, 0, 0]} renderOrder={6}>
        <cylinderGeometry args={[0.018, 0.018, 0.025, 24]} />
        <meshStandardMaterial color="#1C1412" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ============================================================== */}
      {/* 5. SMOOTH CRYSTAL JEWEL STOPPER CAP (ZERO FLAT POLYGONS)       */}
      {/* ============================================================== */}
      <group position={[0, 1.18, 0]}>
        {/* Main Crystal Stopper Cap (width: 0.64, height: 0.28) */}
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
          position={[0, 0.16, 0]}
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
