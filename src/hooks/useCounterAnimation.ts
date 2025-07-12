
import { useState, useEffect } from 'react';

interface UseCounterAnimationProps {
  end: number;
  duration?: number;
  start?: number;
  isVisible?: boolean;
  step?: number;
}

export const useCounterAnimation = ({
  end,
  duration = 2000,
  start = 0,
  isVisible = true,
  step = 1
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
      const rawValue = start + (end - start) * easeOutCubic;
      
      // Arrondir à l'incrément spécifié
      const current = Math.round(rawValue / step) * step;
      
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
  }, [end, duration, start, isVisible, step]);

  return count;
};
