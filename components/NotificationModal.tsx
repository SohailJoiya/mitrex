import React, { useState, useEffect } from 'react';
import { Notification } from '../types';
import Button from './Button';
import Card from './Card';

interface NotificationModalProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ notification, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200); // Animation duration
  };

  const animationClass = isClosing ? 'animate-fade-out' : 'animate-fade-in';
  const cardAnimationClass = isClosing ? 'animate-scale-out' : 'animate-scale-in';

  return (
    <div
      className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 ${animationClass}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-title"
    >
      <Card 
        className={`w-full max-w-lg ${cardAnimationClass}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
            <h2 id="notification-title" className="text-2xl font-bold text-white mb-2 pr-4">
                {notification.title}
            </h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-white text-3xl leading-none -mt-3 -mr-2" aria-label="Close modal">&times;</button>
        </div>
        <p className="text-sm text-gray-500 mb-6">{notification.date}</p>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 text-brand-gray">
           {notification.content.split('\n').map((paragraph, index) => (
               <p key={index}>{paragraph}</p>
           ))}
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button onClick={handleClose} variant="secondary">Close</Button>
        </div>
      </Card>

       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        .animate-fade-out {
            animation: fade-out 0.2s ease-in forwards;
        }
        @keyframes scale-in {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        @keyframes scale-out {
            from { transform: scale(1); opacity: 1; }
            to { transform: scale(0.95); opacity: 0; }
        }
        .animate-scale-in {
            animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scale-out {
            animation: scale-out 0.2s cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }
      `}</style>
    </div>
  );
};

export default NotificationModal;