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
  const shadowY = isDark ? -1.42 : -1.24;

  return (
    <group>
      {/* High-contrast studio softboxes for crisp optical glass & diamond-cut cap reflections */}
      <Environment resolution={128}>
        <group rotation={[-Math.PI / 6, 0, 0]}>
          {/* Key vertical studio softbox (left rim highlight on glass) */}
          <Lightformer
            form="rect"
            intensity={isDark ? 6.5 : 8.0}
            color="#FFF8F2"
            scale={[1.4, 8, 1]}
            position={[-3.8, 1.5, 3.2]}
            target={[0, 0, 0]}
          />
          {/* Secondary vertical studio strip (right warm rose-gold rim highlight) */}
          <Lightformer
            form="rect"
            intensity={isDark ? 5.5 : 6.5}
            color="#FDE2E6"
            scale={[1.2, 8, 1]}
            position={[3.8, 1.2, 2.8]}
            target={[0, 0, 0]}
          />
          {/* Overhead crown softbox for diamond-cut crystal stopper facets */}
          <Lightformer
            form="rect"
            intensity={isDark ? 5.0 : 6.0}
            color="#FFFFFF"
            scale={[5, 2.5, 1]}
            position={[0, 5.5, 1.5]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          {/* Warm champagne front fill strip */}
          <Lightformer
            form="rect"
            intensity={isDark ? 2.4 : 3.2}
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
        scale={2.8}
        blur={1.8}
        far={1.4}
        color={isDark ? "#050404" : "#4A3538"}
      />
    </group>
  );
}

