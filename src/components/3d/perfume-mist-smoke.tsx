"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSmokeTexture } from "./model-materials";

interface PerfumeMistSmokeProps {
  theme: "light" | "dark";
}

interface PuffData {
  initialX: number;
  initialY: number;
  initialZ: number;
  speedY: number;
  driftSpeedX: number;
  scaleBase: number;
  maxLife: number;
  timeOffset: number;
  rotSpeed: number;
  isNozzleVapour: boolean;
}

/**
 * Subtle ethereal fragrance mist and aromatic vapour effect for the 3D perfume flacon.
 * "Slight only" - delicate, soft-edged, translucent botanical mist wisps drifting softly
 * around the crystal base and rising gently from the atomizer nozzle.
 */
export function PerfumeMistSmoke({ theme }: PerfumeMistSmokeProps) {
  const smokeTexture = useSmokeTexture();
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const isDark = theme === "dark";

  // Base position aligned with flacon
  const baseY = isDark ? -0.62 : -0.22;
  const baseX = isDark ? 0.14 : 0.12;

  // Initialize 14 delicate mist puffs with varied drift paths
  const puffs: PuffData[] = useMemo(() => {
    const list: PuffData[] = [];

    // 1. Seven low-lying ground mist puffs around the heavy crystal base punt
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const radius = 0.55 + (i % 3) * 0.22;
      list.push({
        initialX: Math.cos(angle) * radius,
        initialY: -1.05 + (i % 2) * 0.15,
        initialZ: Math.sin(angle) * radius,
        speedY: 0.08 + (i % 3) * 0.03,
        driftSpeedX: (i % 2 === 0 ? 1 : -1) * 0.04,
        scaleBase: 0.75 + (i % 3) * 0.25,
        maxLife: 4.5 + (i % 2) * 1.5,
        timeOffset: i * 0.85,
        rotSpeed: (i % 2 === 0 ? 0.05 : -0.05),
        isNozzleVapour: false,
      });
    }

    // 2. Seven rising wisps of fine aromatic perfume vapour from the golden nozzle
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      list.push({
        initialX: 0.02 + Math.cos(angle) * 0.08,
        initialY: 1.28 + (i % 3) * 0.12,
        initialZ: 0.12 + Math.sin(angle) * 0.06,
        speedY: 0.14 + (i % 3) * 0.05,
        driftSpeedX: (i % 2 === 0 ? 0.06 : -0.05),
        scaleBase: 0.45 + (i % 3) * 0.18,
        maxLife: 3.8 + (i % 2) * 1.2,
        timeOffset: i * 0.72,
        rotSpeed: (i % 2 === 0 ? 0.08 : -0.07),
        isNozzleVapour: true,
      });
    }

    return list;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    meshRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const p = puffs[idx];
      if (!p) return;

      const localTime = (time + p.timeOffset) % p.maxLife;
      const progress = localTime / p.maxLife; // 0 to 1

      // Subtle rising motion
      const currentY = p.initialY + progress * (p.isNozzleVapour ? 0.95 : 0.65);
      // Subtle swaying drift
      const currentX = p.initialX + Math.sin(time * 0.6 + idx) * 0.12 + (progress * p.driftSpeedX);
      const currentZ = p.initialZ + Math.cos(time * 0.5 + idx) * 0.08;

      mesh.position.set(currentX, currentY, currentZ);

      // Expansion as the mist naturally dissipates into air
      const currentScale = p.scaleBase * (1 + progress * 0.8);
      mesh.scale.set(currentScale, currentScale, currentScale);

      // Slow organic rotation
      mesh.rotation.z = time * p.rotSpeed;

      // Bell-curve opacity: fades in smoothly, lingers gently, fades to transparent
      // "Slight only" - peak opacity capped around 0.16 - 0.22 max
      let alpha = 0;
      if (progress < 0.25) {
        alpha = (progress / 0.25);
      } else if (progress > 0.65) {
        alpha = (1 - (progress - 0.65) / 0.35);
      } else {
        alpha = 1.0;
      }

      const maxAlpha = p.isNozzleVapour
        ? (isDark ? 0.20 : 0.16)
        : (isDark ? 0.24 : 0.18);

      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, Math.min(maxAlpha, alpha * maxAlpha));
      }
    });
  });

  if (!smokeTexture) return null;

  return (
    <group
      ref={groupRef}
      position={[baseX, baseY, 0]}
      renderOrder={80}
    >
      {puffs.map((p, idx) => (
        <mesh
          key={idx}
          ref={(el) => {
            meshRefs.current[idx] = el;
          }}
          position={[p.initialX, p.initialY, p.initialZ]}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={smokeTexture}
            color={
              isDark
                ? (p.isNozzleVapour ? "#F0E4F5" : "#E2D3DC")
                : (p.isNozzleVapour ? "#FFF9F2" : "#F7EFE8")
            }
            transparent={true}
            opacity={0}
            depthWrite={false}
            blending={THREE.NormalBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
