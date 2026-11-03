"use client";

import React from "react";
import { OrbitControls } from "@react-three/drei";

interface ModelControlsProps {
  theme?: "light" | "dark";
}

export function ModelControls({ theme = "light" }: ModelControlsProps) {
  const targetY = theme === "dark" ? -0.32 : -0.18;

  return (
    <OrbitControls
      target={[0.14, targetY, 0]}
      enableZoom={false}
      enablePan={false}
      autoRotate={false}
      minPolarAngle={Math.PI / 2.25}
      maxPolarAngle={Math.PI / 1.92}
      minAzimuthAngle={-Math.PI / 3.5}
      maxAzimuthAngle={Math.PI / 3.5}
      dampingFactor={0.07}
      enableDamping
    />
  );
}

