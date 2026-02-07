import { motion } from 'framer-motion';

export function ConfettiAnimation() {
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 2 + Math.random() * 0.5,
    color: ['#1e40af', '#fbbf24', '#ec4899', '#14b8a6'][
      Math.floor(Math.random() * 4)
    ],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[100]">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `${piece.left}vw`,
            y: -20,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            y: '100vh',
            opacity: 0,
            rotate: 720,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: piece.color, left: 0 }}
        />
      ))}
    </div>
  );
}
