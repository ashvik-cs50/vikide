import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function SectionReveal({
  children,
  className = "",
  delay = 0,
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{
          duration: 0.7,
          ease: [0.25, 0.1, 0.25, 1],
          delay,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
