import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect } from 'react';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export function LightboxModal({
  isOpen,
  onClose,
  images,
  activeIndex,
  onPrev,
  onNext,
}: LightboxModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onPrev, onNext, onClose]);

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-10 overflow-hidden"
        onClick={onClose}
      >
        {/* Ambient Background - blurred version of active image */}
        <div className="absolute inset-0 opacity-20 pointer-events-none scale-110 blur-3xl overflow-hidden">
          <motion.img
            key={`bg-${activeIndex}`}
            src={images[activeIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className="relative max-w-6xl w-full h-full flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Arrow */}
          <div className="absolute inset-y-0 left-0 flex items-center p-4 z-50">
            <motion.button
              onClick={onPrev}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              className="p-4 bg-white/5 hover:bg-primary/20 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-colors border border-white/10 group active:scale-90"
            >
              <ChevronLeft className="h-8 w-8 group-hover:-translate-x-0.5 transition-transform" />
            </motion.button>
          </div>

          {/* Right Arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center p-4 z-50">
            <motion.button
              onClick={onNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              className="p-4 bg-white/5 hover:bg-primary/20 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-colors border border-white/10 group active:scale-90"
            >
              <ChevronRight className="h-8 w-8 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </div>

          {/* Image Container — px-24 md:px-28 leaves room for the nav arrows */}
          <div className="relative w-full h-full flex items-center justify-center px-24 md:px-28 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative h-full flex items-center justify-center"
              >
                {/* Inline wrapper sized to the image so the X anchors to its corner */}
                <div className="relative inline-block">
                  <img
                    src={images[activeIndex]}
                    alt={`Image ${activeIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10 block"
                  />
                  {/* Close Button – anchored to top-right of the image */}
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute -top-4 -right-4 p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-all z-[60] border border-white/20 shadow-xl"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                  {/* Image Glow */}
                  <div className="absolute inset-0 bg-primary/5 rounded-2xl pointer-events-none" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pill Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white/80 text-[13px] font-bold tracking-widest uppercase shadow-2xl pointer-events-none">
            {String(activeIndex + 1).padStart(2, '0')}{' '}
            <span className="text-white/30 mx-2">/</span>{' '}
            {String(images.length).padStart(2, '0')}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
