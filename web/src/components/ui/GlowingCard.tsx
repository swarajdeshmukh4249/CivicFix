import React from 'react';
import { cn } from '../../lib/utils';
import { GlowingEffect } from './GlowingEffect';

export interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  glow?: boolean;
  disabled?: boolean;
  borderWidth?: number;
  spread?: number;
  proximity?: number;
  variant?: 'default' | 'white';
}

export function GlowingCard({
  children,
  className = '',
  innerClassName = '',
  glow = true,
  disabled = false,
  borderWidth = 2,
  spread = 60,
  proximity = 64,
  variant = 'default',
  onClick,
  ...props
}: GlowingCardProps) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-2xl border border-border p-2 md:rounded-3xl md:p-3 bg-white/80 backdrop-blur-xs transition-all duration-200',
        isClickable && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      <GlowingEffect
        blur={0}
        borderWidth={borderWidth}
        spread={spread}
        glow={glow}
        disabled={disabled}
        proximity={proximity}
        inactiveZone={0.01}
        variant={variant}
      />
      <div
        className={cn(
          'relative flex h-full flex-col justify-between overflow-hidden rounded-xl p-5 md:p-6 bg-white border border-border/60 shadow-xs',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function GlowingCardIcon({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'w-fit rounded-lg border border-border/80 bg-muted/60 p-2.5 text-foreground shadow-xs mb-3 flex items-center justify-center',
        className
      )}
    >
      {children}
    </div>
  );
}
