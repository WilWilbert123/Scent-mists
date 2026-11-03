"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Generates a high-DPI embossed canvas texture for the front luxury label
 * of the SCENTS & MISTS 3D flacon.
 */
export function usePerfumeLabelTexture(theme: "light" | "dark") {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Warm ivory / cream archival label background with delicate natural gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 1200);
    if (theme === "dark") {
      grad.addColorStop(0, "#F5EBE1");
      grad.addColorStop(0.5, "#EFE2D6");
      grad.addColorStop(1, "#E2D3C4");
    } else {
      grad.addColorStop(0, "#FAF4EE");
      grad.addColorStop(0.5, "#F4ECE3");
      grad.addColorStop(1, "#E8DCcf");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1200);

    // Outer rich gold foil embossed border
    ctx.strokeStyle = "#C49A76";
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, 944, 1120);

    // Inner fine hairline frame
    ctx.strokeStyle = "#9E7B5C";
    ctx.lineWidth = 3;
    ctx.strokeRect(66, 66, 892, 1068);

    // Third micro hairline
    ctx.strokeStyle = "#D9B89B";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(76, 76, 872, 1048);

    // Subtle corner ornaments
    const corners = [
      [66, 66],
      [958, 66],
      [66, 1134],
      [958, 1134],
    ];
    ctx.fillStyle = "#A37C57";
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top Edition Crest
    ctx.fillStyle = "#7E5E44";
    ctx.textAlign = "center";
    ctx.font = "600 24px Georgia, 'Cinzel', serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("N° 01 • ATELIER DE PARFUM", 512, 190);

    // Brand Title: SCENTS & MISTS
    ctx.fillStyle = "#1E1815";
    ctx.font = "600 78px Georgia, 'Playfair Display', serif";
    ctx.letterSpacing = "5px";
    ctx.fillText("SCENTS &", 512, 360);
    ctx.fillText("MISTS", 512, 455);

    // Delicate gold hairline divider
    ctx.beginPath();
    ctx.moveTo(340, 525);
    ctx.lineTo(684, 525);
    ctx.strokeStyle = "#C49A76";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Secondary sub-crest
    ctx.fillStyle = "#8C6848";
    ctx.font = "600 28px Georgia, 'Cinzel', serif";
    ctx.letterSpacing = "4px";
    ctx.fillText("HAUTE PARFUMERIE", 512, 610);

    // Fragrance Title
    ctx.fillStyle = "#2B1F19";
    ctx.font = "italic bold 48px 'Playfair Display', Georgia, serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("Eau de Parfum", 512, 730);

    ctx.font = "italic 32px Georgia, serif";
    ctx.fillStyle = "#6B5345";
    ctx.fillText("Vaporisateur • Natural Spray", 512, 795);

    // Bottom hairline divider
    ctx.beginPath();
    ctx.moveTo(380, 855);
    ctx.lineTo(644, 855);
    ctx.strokeStyle = "#D9B89B";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Volume footer
    ctx.fillStyle = "#4A3A31";
    ctx.font = "600 26px sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("50 ML  •  1.7 FL. OZ.", 512, 955);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [theme]);
}
