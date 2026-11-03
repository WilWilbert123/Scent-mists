"use client";

import React from "react";

interface ModelLightingProps {
  theme: "light" | "dark";
}

export function ModelLighting({ theme }: ModelLightingProps) {
  const isDark = theme === "dark";

  return (
    <>
      <hemisphereLight
        args={[
          isDark ? "#FFF0EB" : "#FFFFFF",
          isDark ? "#4A3538" : "#F3DCE0",
          isDark ? 1.45 : 1.85,
        ]}
      />
      <ambientLight
        intensity={isDark ? 1.05 : 1.35}
        color={isDark ? "#F5E6E8" : "#FFFDF9"}
      />
      <directionalLight
        position={[4, 5, 5]}
        intensity={isDark ? 2.4 : 2.9}
        color={isDark ? "#FFE5D9" : "#FFF8F2"}
        castShadow
      />
      <directionalLight
        position={[-4, 3, 3]}
        intensity={isDark ? 1.5 : 1.8}
        color={isDark ? "#E8C6CE" : "#F7E2E7"}
      />
      <pointLight
        position={[0, 2.4, 2.5]}
        intensity={isDark ? 1.3 : 1.6}
        color="#FFF5EE"
      />
      <pointLight
        position={[0, -2.0, 2.2]}
        intensity={isDark ? 0.95 : 1.15}
        color="#E8C6CE"
      />
    </>
  );
}
