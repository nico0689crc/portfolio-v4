"use client";

import { motion, HTMLMotionProps, Variants } from "motion/react";
import React, { useMemo } from "react";

export type FadeDirection = "up" | "down" | "left" | "right" | "none";
export type FadeType = "fade" | "scale" | "blur" | "rotate";

export interface RevealProps extends Omit<HTMLMotionProps<any>, "type"> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: FadeDirection;
  distance?: number;
  type?: FadeType;
  once?: boolean;
  margin?: string;
  amount?: "some" | "all" | number;
  staggerChildren?: number;
  as?: React.ElementType;
}

export function Reveal({
  children,
  delay = 0,
  duration = 0.5,
  direction = "none",
  distance = 20,
  type = "fade",
  once = true,
  margin = "-50px",
  amount = "some",
  staggerChildren,
  className,
  as = "div",
  ...props
}: RevealProps) {
  const directions = useMemo(() => ({
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  }), [distance]);

  const variants: Variants = useMemo(() => {
    const baseInitial = {
      opacity: 0,
      ...directions[direction],
    };

    const baseAnimate = {
      opacity: 1,
      x: 0,
      y: 0,
    };

    switch (type) {
      case "scale":
        return {
          hidden: { ...baseInitial, scale: 0.95 },
          visible: { ...baseAnimate, scale: 1 },
        };
      case "blur":
        return {
          hidden: { ...baseInitial, filter: "blur(10px)" },
          visible: { ...baseAnimate, filter: "blur(0px)" },
        };
      case "rotate":
        return {
          hidden: { ...baseInitial, rotate: direction === "left" || direction === "up" ? -5 : 5 },
          visible: { ...baseAnimate, rotate: 0 },
        };
      case "fade":
      default:
        return {
          hidden: baseInitial,
          visible: baseAnimate,
        };
    }
  }, [direction, directions, type]);

  const Component = motion[as as keyof typeof motion] as any;

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin, amount }}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Custom ease for smoother animation
        staggerChildren,
      }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}
