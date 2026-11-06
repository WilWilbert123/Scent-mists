"use client";

import React, { Component, Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useTheme } from "@/hooks/use-theme";
import { useMediaQuery } from "@/hooks/use-media-query";
import { PerfumeModel } from "./perfume-model";
import { PerfumeMistSmoke } from "./perfume-mist-smoke";
import { ModelLighting } from "./model-lighting";
import { ModelEnvironment } from "./model-environment";
import { ModelControls } from "./model-controls";
import { PerfumeModelLoader } from "./perfume-model-loader";
import { PerfumeModelFallback } from "./perfume-model-fallback";

interface ErrorBoundaryState {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function PerfumeScene() {
  const { theme, mounted } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isDark = theme === "dark";
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  // In dark mode, slightly adjust camera elevation to match lowered stone ledge
  const cameraY = isDark ? (isMobile ? -0.16 : -0.14) : 0.00;

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setWebGlSupported(Boolean(gl));
    } catch {
      setWebGlSupported(false);
    }
  }, []);

  if (!mounted) {
    return <PerfumeModelLoader />;
  }

  if (!webGlSupported) {
    return <PerfumeModelFallback />;
  }

  return (
    <SceneErrorBoundary fallback={<PerfumeModelFallback />}>
      <Suspense fallback={<PerfumeModelLoader />}>
        <div
          className="relative h-[50vh] min-h-[350px] max-h-[490px] sm:h-[650px] lg:h-[800px] w-full select-none overflow-visible"
          aria-label="Interactive 3D SCENTS & MISTS perfume flacon. Drag to rotate."
          role="img"
        >
          <Canvas
            dpr={isMobile ? [1, 1.25] : [1, 2]}
            camera={{
              position: [isMobile ? 0.10 : 0.12, cameraY, 4.45],
              fov: 42,
            }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          >
            <ModelLighting theme={theme} />
            <PerfumeModel theme={theme} />
            <PerfumeMistSmoke theme={theme} />
            <ModelEnvironment theme={theme} />
            <ModelControls theme={theme} />
          </Canvas>

        </div>
      </Suspense>
    </SceneErrorBoundary>
  );
}
