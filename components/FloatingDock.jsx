"use client"

import { cn } from "@/app/lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import Link from "next/link";

export const FloatingDock = ({
  items,
  desktopClassName,
}) => {

  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
    </>
  );
};


const FloatingDockDesktop = ({
  items,
  className,
}) => {
  
  let mouseX = useMotionValue(Infinity);
  const dockRef = useRef(null);

  // Animation effect for floating dock on page load
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const animatedElements = dock.querySelectorAll('[data-animate]');
    
    // Set initial state
    gsap.set(animatedElements, { opacity: 0, y: 50, scale: 0.8 });

    // Animate on page load with delay
    gsap.to(animatedElements, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.1,
      delay: 1.2, // Delay after other elements
      ease: 'back.out(1.2)',
    });
  }, []);

  return (
    <motion.div
      ref={dockRef}
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "fixed bottom-2 left-[50%] translate-x-[-50%] items-end gap-4 rounded-full bg-white/80 px-4 flex shadow-lg backdrop-blur z-40",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.title} data-animate>
          <IconContainer mouseX={mouseX} {...item} />
        </div>
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
}) {
  let ref = useRef(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-100, 0, 100], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-0, 0, 0], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-100, 0, 100], [20, 40, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center text-black"
        >
          {icon}
        </motion.div>
      </motion.div>
    </Link>
  );
}