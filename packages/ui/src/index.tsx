'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

// ==========================================
// Loading Spinner
// ==========================================
export function CosmicLoader({ size = 48 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center" role="status" aria-label="Loading">
      <motion.div
        className="rounded-full border-2 border-t-transparent border-indigo-500"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// ==========================================
// Fade In Wrapper
// ==========================================
export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// ==========================================
// Glassmorphism Card
// ==========================================
export function GlassCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

// ==========================================
// Cosmic Button
// ==========================================
export function CosmicButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
}) {
  const baseStyles =
    'relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25',
    secondary:
      'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm',
    ghost: 'text-white/70 hover:text-white hover:bg-white/5',
  };

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {children}
    </motion.button>
  );
}

// ==========================================
// Animated Presence Wrapper
// ==========================================
export function PresenceWrapper({
  children,
  isVisible,
}: {
  children: ReactNode;
  isVisible: boolean;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// Badge
// ==========================================
export function ArchetypeBadge({
  archetype,
  colorHex,
}: {
  archetype: string;
  colorHex: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        backgroundColor: `${colorHex}20`,
        color: colorHex,
        border: `1px solid ${colorHex}40`,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: colorHex }}
      />
      {archetype}
    </span>
  );
}
