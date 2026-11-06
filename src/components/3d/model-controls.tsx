"use client";

import React from "react";
import { OrbitControls } from "@react-three/drei";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ModelControlsProps {
  theme?: "light" | "dark";
}

export function ModelControls({ theme = "light" }: ModelControlsProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const targetX = isMobile ? 0.08 : theme === "dark" ? 0.14 : 0.12;
  const targetY = isMobile
    ? (theme === "dark" ? -0.24 : 0.04)
    : (theme === "dark" ? -0.26 : 0.08);

  return (
    <OrbitControls
      target={[targetX, targetY, 0]}
      enableZoom={false}
      enablePan={false}
      autoRotate={false}
      minPolarAngle={Math.PI / 2.06}
      maxPolarAngle={Math.PI / 1.94}
      minAzimuthAngle={-Math.PI / 3.0}
      maxAzimuthAngle={Math.PI / 3.0}
      dampingFactor={0.07}
      enableDamping
    />
  );
}

