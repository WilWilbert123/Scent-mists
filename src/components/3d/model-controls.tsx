"use client";

import React from "react";
import { OrbitControls } from "@react-three/drei";

interface ModelControlsProps {
  theme?: "light" | "dark";
}

export function ModelControls({ theme = "light" }: ModelControlsProps) {
  const targetY = theme === "dark" ? -0.26 : 0.04;
  const targetX = theme === "dark" ? 0.14 : 0.12;

  return (
    <OrbitControls
      target={[targetX, targetY, 0]}
      enableZoom={false}
      enablePan={false}
      autoRotate={false}
      minPolarAngle={Math.PI / 2.35}
      maxPolarAngle={Math.PI / 1.88}
      minAzimuthAngle={-Math.PI / 3.2}
      maxAzimuthAngle={Math.PI / 3.2}
      dampingFactor={0.07}
      enableDamping
    />
  );
}

