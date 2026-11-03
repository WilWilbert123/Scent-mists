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
          isDark ? "#3A282A" : "#D6C0C4",
          isDark ? 1.0 : 1.15,
        ]}
      />
      <ambientLight
        intensity={isDark ? 0.65 : 0.75}
        color={isDark ? "#F5E6E8" : "#FFF8F4"}
      />
      <directionalLight
        position={[4, 5, 5]}
        intensity={isDark ? 2.5 : 3.0}
        color={isDark ? "#FFE5D9" : "#FFF8F2"}
        castShadow
      />
      <directionalLight
        position={[-4, 3, 3]}
        intensity={isDark ? 1.6 : 1.9}
        color={isDark ? "#E8C6CE" : "#F7E2E7"}
      />
      <pointLight
        position={[0, 2.4, 2.5]}
        intensity={isDark ? 1.2 : 1.5}
        color="#FFF5EE"
      />
      <pointLight
        position={[0, -2.0, 2.2]}
        intensity={isDark ? 0.8 : 1.0}
        color="#E8C6CE"
      />
    </>
  );
}
