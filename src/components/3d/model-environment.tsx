"use client";

import React from "react";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

interface ModelEnvironmentProps {
  theme: "light" | "dark";
}

/**
 * Studio HDRI Lightformers for realistic optical crystal glass specular reflections
 * and a grounded contact shadow aligned directly onto the background stone ledge.
 *////////
export function ModelEnvironment({ theme }: ModelEnvironmentProps) {
  const isDark = theme === "dark";
  const shadowY = isDark ? -1.45 : -1.27;

  return (
    <group>
      {/* High-contrast studio softboxes for crisp optical glass & diamond-cut cap reflections */}
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 6, 0, 0]}>
          {/* Dark studio contrast flags on left & right to define glass bevels & edges against light backgrounds */}
          <Lightformer
            form="rect"
            intensity={isDark ? 0.7 : 0.9}
            color="#140E10"
            scale={[3, 14, 1]}
            position={[-5.0, 0.5, 0.5]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={isDark ? 0.7 : 0.9}
            color="#140E10"
            scale={[3, 14, 1]}
            position={[5.0, 0.5, 0.5]}
            target={[0, 0, 0]}
          />

          {/* Key vertical studio softbox (left rim highlight on glass) */}
          <Lightformer
            form="rect"
            intensity={isDark ? 3.0 : 3.6}
            color="#FFFFFF"
            scale={[1.2, 8, 1]}
            position={[-3.2, 1.2, 3.2]}
            target={[0, 0, 0]}
          />
          {/* Secondary vertical studio strip (right warm rose-gold rim highlight) */}
          <Lightformer
            form="rect"
            intensity={isDark ? 2.4 : 3.0}
            color="#FDE8EC"
            scale={[1.0, 8, 1]}
            position={[3.2, 1.0, 3.0]}
            target={[0, 0, 0]}
          />
          {/* Overhead crown softbox for crystal stopper facets */}
          <Lightformer
            form="rect"
            intensity={isDark ? 2.8 : 3.4}
            color="#FFFFFF"
            scale={[5, 2.5, 1]}
            position={[0, 5.5, 1.5]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          {/* Warm champagne front fill strip */}
          <Lightformer
            form="rect"
            intensity={isDark ? 1.2 : 1.5}
            color="#FFEAD9"
            scale={[4, 1.5, 1]}
            position={[0, -1.5, 4.5]}
          />
        </group>
      </Environment>

      {/* Grounding contact shadow directly on the stone ledge surface */}
      <ContactShadows
        position={[0.16, shadowY, 0]}
        opacity={isDark ? 0.68 : 0.38}
        scale={3.4}
        blur={1.8}
        far={1.4}
        color={isDark ? "#050404" : "#4A3538"}
      />
    </group>
  );
}

