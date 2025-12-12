
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [show, setShow] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    // Start exit animation after 2.5 seconds
    const timer1 = setTimeout(() => {
      setAnimateOut(true);
    }, 2500);

    // Call onFinish after animation completes (3s total)
    const timer2 = setTimeout(() => {
      setShow(false);
      onFinish();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-700 ${
        animateOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <style>{`
        @keyframes customSlideUpFade {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-custom-slide {
          animation: customSlideUpFade 0.8s ease-out forwards;
        }
      `}</style>
      <div className="text-center p-8">
        <div className="mb-4">
          <p className="text-gray-500 text-xl md:text-2xl font-serif tracking-[0.2em] uppercase animate-custom-slide opacity-0" style={{ animationDelay: '0.2s' }}>
            Made for
          </p>
        </div>
        <div>
          <h1 className="text-6xl md:text-8xl font-cursive text-pakGreen-600 font-bold animate-custom-slide opacity-0 drop-shadow-sm" style={{ animationDelay: '0.6s' }}>
            Heer
          </h1>
        </div>
        
        {/* Decorative element */}
        <div className="mt-12 flex justify-center gap-3 animate-fade-in opacity-0" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
          <span className="w-2.5 h-2.5 rounded-full bg-pakGreen-300 animate-bounce" style={{ animationDelay: '0s' }}></span>
          <span className="w-2.5 h-2.5 rounded-full bg-pakGreen-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-2.5 h-2.5 rounded-full bg-pakGreen-700 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
