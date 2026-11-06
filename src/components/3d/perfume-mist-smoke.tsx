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
  const baseY = isDark ? -0.54 : -0.18;
  const baseX = isDark ? 0.14 : 0.12;

  // Initialize 14 delicate mist puffs with varied drift paths
  const puffs: PuffData[] = useMemo(() => {
    const list: PuffData[] = [];

    // 1. Seven low-lying ground mist puffs around the heavy crystal base punt
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const radius = 0.50 + (i % 3) * 0.18;
      list.push({
        initialX: Math.cos(angle) * radius,
        initialY: -0.68 + (i % 2) * 0.08,
        initialZ: Math.sin(angle) * radius,
        speedY: 0.06 + (i % 3) * 0.02,
        driftSpeedX: (i % 2 === 0 ? 1 : -1) * 0.03,
        scaleBase: 0.65 + (i % 3) * 0.18,
        maxLife: 4.8 + (i % 2) * 1.2,
        timeOffset: i * 0.85,
        rotSpeed: (i % 2 === 0 ? 0.04 : -0.04),
        isNozzleVapour: false,
      });
    }

    // 2. Seven rising wisps of fine aromatic perfume vapour around the golden nozzle and crystal shoulder
    // Controlled vertical rise and dispersal to prevent clipping at the canvas borders
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      list.push({
        initialX: 0.01 + Math.cos(angle) * 0.07,
        initialY: 0.82 + (i % 3) * 0.06,
        initialZ: 0.10 + Math.sin(angle) * 0.05,
        speedY: 0.08 + (i % 3) * 0.03,
        driftSpeedX: (i % 2 === 0 ? 0.04 : -0.04),
        scaleBase: 0.38 + (i % 3) * 0.12,
        maxLife: 4.2 + (i % 2) * 1.0,
        timeOffset: i * 0.72,
        rotSpeed: (i % 2 === 0 ? 0.06 : -0.05),
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

      // Subtle rising motion — controlled ascent so vapour evaporates before reaching the ceiling
      const currentY = p.initialY + progress * (p.isNozzleVapour ? 0.28 : 0.32);
      // Subtle swaying drift
      const currentX = p.initialX + Math.sin(time * 0.5 + idx) * 0.08 + (progress * p.driftSpeedX);
      const currentZ = p.initialZ + Math.cos(time * 0.45 + idx) * 0.06;

      mesh.position.set(currentX, currentY, currentZ);

      // Expansion as the mist naturally dissipates into air
      const currentScale = p.scaleBase * (1 + progress * 0.65);
      mesh.scale.set(currentScale, currentScale, currentScale);

      // Slow organic rotation
      mesh.rotation.z = time * p.rotSpeed;

      // Calculate world coordinates to enforce zero-line falloff on all 4 viewport edges
      const worldX = baseX + currentX * 0.96;
      const worldY = baseY + currentY * 0.96;
      const halfScale = (currentScale * 0.96) * 0.5;

      // 4-Sided Smooth Edge Margin Falloff (Top, Bottom, Left, Right):
      // Drops opacity smoothly to absolute 0 well before any particle can touch any viewport edge
      const topMargin = Math.max(0, Math.min(1, (1.24 - (worldY + halfScale * 0.4)) / 0.26));
      const bottomMargin = Math.max(0, Math.min(1, ((worldY - halfScale * 0.4) - (-1.10)) / 0.24));
      const leftMargin = Math.max(0, Math.min(1, ((worldX - halfScale * 0.4) - (-1.15)) / 0.26));
      const rightMargin = Math.max(0, Math.min(1, (1.30 - (worldX + halfScale * 0.4)) / 0.26));

      const boundaryFade = topMargin * bottomMargin * leftMargin * rightMargin;
      const smoothBoundaryFade = boundaryFade * boundaryFade * (3 - 2 * boundaryFade);

      // Life cycle bell curve: gentle ease-in, gentle ease-out to zero
      let lifeAlpha = 0;
      if (progress < 0.25) {
        lifeAlpha = progress / 0.25;
      } else if (progress > 0.45) {
        lifeAlpha = Math.max(0, 1 - (progress - 0.45) / 0.55);
      } else {
        lifeAlpha = 1.0;
      }
      lifeAlpha = Math.sin((lifeAlpha * Math.PI) / 2);

      const maxAlpha = p.isNozzleVapour
        ? (isDark ? 0.16 : 0.14)
        : (isDark ? 0.20 : 0.16);

      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (mat) {
        const finalOpacity = maxAlpha * lifeAlpha * smoothBoundaryFade;
        mat.opacity = Math.max(0, Math.min(maxAlpha, finalOpacity));
      }
    });
  });

  if (!smokeTexture) return null;

  return (
    <group
      ref={groupRef}
      position={[baseX, baseY, 0]}
      scale={0.96}
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

