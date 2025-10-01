import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ 
  images, 
  currentIndex, 
  onClose, 
  onNavigate 
}) => {
  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  const goToPrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(images.length - 1); // Loop to last image
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0); // Loop to first image
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasMultipleImages) goToPrevious();
          break;
        case 'ArrowRight':
          if (hasMultipleImages) goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, hasMultipleImages]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-600 rounded-full w-12 h-12 flex items-center justify-center hover:bg-red-700 transition-colors z-20 text-white shadow-lg"
          title="Close (Esc)"
        >
          <X size={24} />
        </button>

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg z-20 font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Previous Button */}
        {hasMultipleImages && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all z-20 shadow-lg hover:scale-110"
            title="Previous image (←)"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Next Button */}
        {hasMultipleImages && (
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all z-20 shadow-lg hover:scale-110"
            title="Next image (→)"
          >
            <ChevronRight size={28} />
          </button>
        )}

        {/* Main Image */}
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <img
            src={currentImage}
            alt={`Design ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          />
        </div>

        {/* Thumbnail Navigation */}
        {hasMultipleImages && images.length <= 10 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black bg-opacity-70 p-3 rounded-lg">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onNavigate(index)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-110 ${
                  index === currentIndex 
                    ? 'border-yellow-500 shadow-lg' 
                    : 'border-gray-600 hover:border-yellow-400'
                }`}
                title={`View image ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Navigation Dots for Many Images */}
        {hasMultipleImages && images.length > 10 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black bg-opacity-70 p-3 rounded-lg">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => onNavigate(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-yellow-500' 
                    : 'bg-gray-600 hover:bg-yellow-400'
                }`}
                title={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Swipe Instructions */}
        {hasMultipleImages && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg">
            Use ← → keys or click buttons to navigate
          </div>
        )}
      </div>
    </div>
  );
};