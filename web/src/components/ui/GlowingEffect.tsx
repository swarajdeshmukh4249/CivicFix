import React, { memo, useCallback, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: 'default' | 'white';
  glow?: boolean;
  className?: string;
  movementDuration?: number;
  borderWidth?: number;
  disabled?: boolean;
}

export const GlowingEffect = memo(function GlowingEffect({
  blur = 0,
  inactiveZone = 0.05,
  proximity = 64,
  spread = 60,
  variant = 'default',
  glow = true,
  className = '',
  movementDuration = 1.5,
  borderWidth = 2,
  disabled = false,
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(0);

  const handleMove = useCallback((e?: MouseEvent) => {
    if (!containerRef.current) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const element = containerRef.current;
      if (!element) return;

      const { left, top, width, height } = element.getBoundingClientRect();
      const mouseX = e?.x ?? lastPosition.current.x;
      const mouseY = e?.y ?? lastPosition.current.y;

      if (e) {
        lastPosition.current = { x: mouseX, y: mouseY };
      }

      const center = [left + width * 0.5, top + height * 0.5];
      const distanceFromCenter = Math.hypot(mouseX - center[0], mouseY - center[1]);
      const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

      if (distanceFromCenter < inactiveRadius) {
        element.style.setProperty('--active', '0');
        return;
      }

      const isActive =
        mouseX > left - proximity &&
        mouseX < left + width + proximity &&
        mouseY > top - proximity &&
        mouseY < top + height + proximity;

      element.style.setProperty('--active', isActive ? '1' : '0');

      if (!isActive) return;

      const currentAngle = parseFloat(element.style.getPropertyValue('--start') || '0');
      const targetAngle = (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) / Math.PI + 90;

      const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
      const newAngle = currentAngle + angleDiff;

      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (movementDuration * 1000), 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const animatedValue = currentAngle + (newAngle - currentAngle) * easedProgress;
        element.style.setProperty('--start', String(animatedValue));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    });
  }, [inactiveZone, proximity, movementDuration]);

  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => handleMove();
    const handlePointerMove = (e: MouseEvent) => handleMove(e);

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.body.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      document.body.removeEventListener('pointermove', handlePointerMove);
    };
  }, [handleMove, disabled]);

  const gradientStyle =
    variant === 'white'
      ? 'repeating-conic-gradient(from 236.84deg at 50% 50%, #ffffff, #ffffff calc(25% / var(--repeating-conic-gradient-times)))'
      : 'radial-gradient(circle, #3b82f6 10%, #3b82f600 20%), radial-gradient(circle at 40% 40%, #8b5cf6 5%, #8b5cf600 15%), radial-gradient(circle at 60% 60%, #10b981 10%, #10b98100 20%), radial-gradient(circle at 40% 60%, #06b6d4 10%, #06b6d400 20%), repeating-conic-gradient(from 236.84deg at 50% 50%, #3b82f6 0%, #8b5cf6 calc(25% / var(--repeating-conic-gradient-times)), #10b981 calc(50% / var(--repeating-conic-gradient-times)), #06b6d4 calc(75% / var(--repeating-conic-gradient-times)), #3b82f6 calc(100% / var(--repeating-conic-gradient-times)))';

  return (
    <>
      <div
        className={cn(
          'pointer-events-none absolute -inset-px hidden rounded-[inherit] border border-transparent opacity-0 transition-opacity',
          glow && 'opacity-100',
          variant === 'white' && 'border-white',
          disabled && '!block'
        )}
      />
      <div
        ref={containerRef}
        style={{
          '--blur': `${blur}px`,
          '--spread': spread,
          '--start': '0',
          '--active': '0',
          '--glowingeffect-border-width': `${borderWidth}px`,
          '--repeating-conic-gradient-times': '5',
          '--gradient': gradientStyle,
        } as React.CSSProperties}
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity',
          glow && 'opacity-100',
          blur > 0 && 'blur-[var(--blur)]',
          className,
          disabled && '!hidden'
        )}
      >
        <div className="glowing-effect-glow rounded-[inherit]" />
      </div>
    </>
  );
});

export default GlowingEffect;
