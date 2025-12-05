import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface CoverPageProps {
  onEnter: () => void;
}

export function CoverPage({ onEnter }: CoverPageProps) {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0505] to-[#0a0a0a] flex items-center justify-center cursor-pointer relative overflow-hidden"
      onClick={onEnter}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Cardinal red glow - primary */}
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-[#991B1B] rounded-full opacity-30 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Cardinal red glow - secondary */}
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#991B1B] rounded-full opacity-25 blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.25, 0.35, 0.25],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Subtle gold accent */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#D97706] rounded-full opacity-10 blur-[80px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        {/* Logo icon */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 1
          }}
        >
          <div className="relative">
            <div className="w-24 h-24 bg-[#991B1B] rounded-2xl flex items-center justify-center shadow-2xl">
              <Sparkles size={48} className="text-white" />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#991B1B] rounded-2xl blur-xl opacity-60" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-7xl md:text-8xl lg:text-9xl mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-[#991B1B] via-[#c92424] to-[#991B1B] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              TopTrait
            </span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-gray-400 text-lg md:text-xl mb-12 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Find Your Perfect USC Roommate
        </motion.p>

        {/* Pulsing "click anywhere" hint */}
        <motion.div
          className="text-gray-500 text-sm flex items-center justify-center gap-2"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span>Click anywhere to begin</span>
          <motion.div
            animate={{
              x: [0, 5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            →
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#991B1B] to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 1.5 }}
      />
    </div>
  );
}