"use client";

import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface RevealOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  className?: string;
}

export function RevealOnScroll({
  children,
  delay = 0,
  direction = "up",
  distance = 36,
  duration = 0.8,
  className,
}: RevealOnScrollProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const getInitial = () => {
    switch (direction) {
      case "left":
        return { opacity: 0, x: -distance, y: 0 };
      case "right":
        return { opacity: 0, x: distance, y: 0 };
      case "down":
        return { opacity: 0, x: 0, y: -distance };
      case "none":
        return { opacity: 0, x: 0, y: 0 };
      case "up":
      default:
        return { opacity: 0, x: 0, y: distance };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
