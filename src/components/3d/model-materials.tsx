"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Generates a high-DPI canvas texture for the luxury front archival label
 * of the SCENTS & MISTS Eau de Parfum flacon.
 */
export function usePerfumeLabelTexture(theme: "light" | "dark") {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Warm ivory / cream archival paper background
    const grad = ctx.createLinearGradient(0, 0, 1024, 1200);
    if (theme === "dark") {
      grad.addColorStop(0, "#F3EAE0");
      grad.addColorStop(1, "#E6D8CA");
    } else {
      grad.addColorStop(0, "#FCF9F5");
      grad.addColorStop(1, "#F2EAE1");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1200);

    // Outer champagne-gold border
    ctx.strokeStyle = "#C59B8C";
    ctx.lineWidth = 14;
    ctx.strokeRect(44, 44, 936, 1112);

    // Inner fine architectural hairline frame
    ctx.strokeStyle = "#3A322F";
    ctx.lineWidth = 3;
    ctx.strokeRect(74, 74, 876, 1052);

    // Subtle corner ornaments
    ctx.fillStyle = "#C59B8C";
    const corners = [
      [74, 74],
      [950, 74],
      [74, 1126],
      [950, 1126],
    ];
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top small crest monogram
    ctx.fillStyle = "#8C6D62";
    ctx.textAlign = "center";
    ctx.font = "400 26px Georgia, 'Cormorant Garamond', serif";
    ctx.fillText("MAISON DE PARFUM", 512, 235);

    // Brand Title: SCENTS & MISTS
    ctx.fillStyle = "#242322";
    ctx.font = "600 84px Georgia, 'Cormorant Garamond', serif";
    ctx.fillText("SCENTS &", 512, 420);
    ctx.fillText("MISTS", 512, 525);

    // Delicate rose-gold divider line
    ctx.beginPath();
    ctx.moveTo(350, 610);
    ctx.lineTo(674, 610);
    ctx.strokeStyle = "#B98792";
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Subtitle: Haute Parfumerie
    ctx.fillStyle = "#4A413E";
    ctx.font = "italic 46px Georgia, 'Cormorant Garamond', serif";
    ctx.fillText("Eau de Parfum", 512, 715);
    ctx.font = "italic 36px Georgia, 'Cormorant Garamond', serif";
    ctx.fillStyle = "#7A6A65";
    ctx.fillText("Vaporisateur Natural Spray", 512, 775);

    // Volume footer
    ctx.fillStyle = "#5C524E";
    ctx.font = "500 28px sans-serif";
    ctx.fillText("100 ML  —  3.4 FL. OZ.", 512, 965);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [theme]);
}
