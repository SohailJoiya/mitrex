import React from 'react';
import Card from './Card';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Transaction Screenshot" className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-brand-orange text-white rounded-full h-10 w-10 flex items-center justify-center text-2xl font-bold shadow-lg transition-transform hover:scale-110"
          aria-label="Close image preview"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
