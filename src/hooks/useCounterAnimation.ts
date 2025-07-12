
import { useState, useEffect } from 'react';

interface UseCounterAnimationProps {
  end: number;
  duration?: number;
  start?: number;
  isVisible?: boolean;
}

export const useCounterAnimation = ({
  end,
  duration = 2000,
  start = 0,
  isVisible = true
}: UseCounterAnimationProps) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Utiliser une fonction d'easing pour un effet plus naturel
      const easeOutCubic = 1 - Math.pow(1 - percentage, 3);
      const current = Math.floor(start + (end - start) * easeOutCubic);
      
      setCount(current);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start, isVisible]);

  return count;
};
