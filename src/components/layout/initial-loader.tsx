"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND_NAME } from "@/lib/constants";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Clean, minimalist brand emblem intro.
 * Pure logo presentation centered without circles or borders.
 */
export function InitialLoader() {
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="scents-mists-initial-loader"
          role="status"
          aria-label="Loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex h-screen h-[100dvh] w-screen w-[100dvw] items-center justify-center bg-background select-none overflow-hidden m-0 p-0"
        >
          {/* Pure Minimalist Brand Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.035, 1],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="relative h-28 w-28 sm:h-32 sm:w-32 drop-shadow-md"
            >
              <Image
                src="/images/logo/scentmistslogo.png"
                alt={BRAND_NAME}
                fill
                priority
                sizes="(max-width: 640px) 112px, 128px"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
