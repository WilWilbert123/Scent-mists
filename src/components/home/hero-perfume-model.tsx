"use client";

import React from "react";
import dynamic from "next/dynamic";
import { PerfumeModelLoader } from "@/components/3d/perfume-model-loader";

const DynamicPerfumeScene = dynamic(
  () => import("@/components/3d/perfume-scene").then((mod) => mod.PerfumeScene),
  {
    ssr: false,
    loading: () => <PerfumeModelLoader />,
  }
);

export function HeroPerfumeModel() {
  return (
    <div className="relative z-10 w-full">
      <DynamicPerfumeScene />
    </div>
  );
}

