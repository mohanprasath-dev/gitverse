'use client';

import { motion } from 'framer-motion';

/**
 * Skeleton 3D loader — shown while the galaxy is being generated.
 */
export function GalaxyLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0f]">
      {/* Animated cosmic loading visualization */}
      <div className="relative h-48 w-48">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-indigo-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        {/* Middle ring */}
        <motion.div
          className="absolute inset-4 rounded-full border border-purple-500/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner ring */}
        <motion.div
          className="absolute inset-8 rounded-full border border-indigo-400/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Central star */}
        <motion.div
          className="absolute inset-0 m-auto h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ filter: 'blur(1px)' }}
        />

        {/* Orbiting planets */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: '100%',
              height: '100%',
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 3 + i * 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: 6 + i * 2,
                height: 6 + i * 2,
                top: `${15 + i * 15}%`,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa'][i],
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Loading text */}
      <div className="text-center">
        <motion.p
          className="text-lg font-semibold cosmic-text-gradient"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Generating Your Galaxy
        </motion.p>
        <p className="mt-1 text-xs text-white/30">
          Mapping repositories to planets and analyzing your cosmic footprint...
        </p>
      </div>

      {/* Progress skeleton bars */}
      <div className="w-64 space-y-2">
        {['Fetching GitHub data...', 'Analyzing activity...', 'Building star system...'].map(
          (text, i) => (
            <div key={text} className="flex items-center gap-2">
              <motion.div
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.3 }}
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    delay: i * 1.5,
                    duration: 2,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
              <motion.span
                className="whitespace-nowrap text-[10px] text-white/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.3 }}
              >
                {text}
              </motion.span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
