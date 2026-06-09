"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

export function GlassCard({
  children,
  className = "",
  hover = true,
}: GlassCardProps) {
  return (
    <motion.article
      whileHover={
        hover
          ? {
              y: -4,
              borderColor: "rgba(0, 255, 65, 0.26)",
            }
          : undefined
      }
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-card ${className}`}
    >
      {children}
    </motion.article>
  );
}

