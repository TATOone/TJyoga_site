import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-dark-brown/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="disclaimer-title"
          >
            <motion.div
              className="bg-light-text rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-light-text border-b border-light-sandy px-6 py-4 flex justify-between items-center">
                <h2 id="disclaimer-title" className="text-2xl font-bold text-dark-brown">
                  Отказ от ответственности
                </h2>
                <button
                  onClick={onClose}
                  className="text-dark-brown hover:text-terracotta transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-terracotta rounded"
                  aria-label="Закрыть"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="px-6 py-6 text-dark-brown">
                <div className="space-y-4">
                  <p>
                    <strong>Отказ от ответственности:</strong>
                  </p>
                  <p>
                    Занимаясь йогой под руководством TJ Yoga, я понимаю и принимаю, что:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Йога — это физическая активность, которая может привести к травмам</li>
                    <li>Я несу полную ответственность за своё здоровье и безопасность во время практики</li>
                    <li>Я обязуюсь следовать инструкциям преподавателя и не выполнять упражнения, которые могут навредить моему здоровью</li>
                    <li>Я уведомлю преподавателя о любых медицинских противопоказаниях, травмах или ограничениях</li>
                    <li>TJ Yoga, Евгения Старовойтова и Тимур Аблаев не несут ответственности за любые травмы, полученные во время практики йоги</li>
                  </ul>
                  <div className="bg-light-olive border border-light-sandy rounded-lg p-4 mt-6">
                    <p className="text-sm italic text-gray-brown">
                      <strong>Важно:</strong> Если у тебя есть сомнения относительно состояния здоровья, обязательно проконсультируйся с врачом перед началом практики.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-light-text border-t border-light-sandy px-6 py-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="bg-terracotta text-light-text px-6 py-2 rounded-lg hover:bg-golden-sandy transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta"
                >
                  Понятно
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DisclaimerModal;

