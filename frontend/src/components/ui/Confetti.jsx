import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Confetti = ({ show, onComplete }) => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (show) {
      const newPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        rotation: Math.random() * 360,
        color: ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)],
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: piece.x,
            y: piece.y,
            rotate: piece.rotation,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 100,
            rotate: piece.rotation + 720,
            opacity: 0,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            ease: 'easeIn',
          }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: piece.color,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;