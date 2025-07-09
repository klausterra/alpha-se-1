
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ImageGallery({ images }) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageError, setImageError] = useState({});

  // Garante que images é um array válido e não vazio
  const imageArray = Array.isArray(images) ? images.filter(img => img && typeof img === 'string' && img.trim() !== '') : [];

  if (imageArray.length === 0) {
    return (
      <div className="aspect-[4/3] md:aspect-[16/9] w-full bg-gray-100 flex items-center justify-center rounded-t-lg">
        <div className="flex flex-col items-center text-gray-500 p-8">
          <ImageIcon className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium">Sem imagens</p>
          <p className="text-sm text-gray-400">Este anúncio não possui imagens</p>
        </div>
      </div>
    );
  }

  const imageIndex = page % imageArray.length;
  const currentImage = imageArray[imageIndex];

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="relative bg-gray-100">
      <div className="aspect-[4/3] md:aspect-[16/9] w-full rounded-t-lg overflow-hidden relative">
        {imageError[imageIndex] ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Erro ao carregar imagem</p>
            </div>
          </div>
        ) : (
          <img
            key={`${imageIndex}-${currentImage}`}
            src={currentImage}
            alt={`Imagem ${imageIndex + 1}`}
            className="w-full h-full object-cover"
            onError={() => handleImageError(imageIndex)}
            onLoad={() => console.log(`Imagem ${imageIndex + 1} carregada:`, currentImage)}
            style={{ display: 'block' }}
          />
        )}

        {/* Botão de zoom */}
        {!imageError[imageIndex] && (
          <button
            onClick={() => setIsZoomed(true)}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        )}

        {/* Controles de navegação */}
        {imageArray.length > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Indicadores */}
        {imageArray.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {imageArray.map((_, index) => (
              <button
                key={index}
                onClick={() => setPage([index, index > imageIndex ? 1 : -1])}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === imageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Contador de imagens */}
        {imageArray.length > 1 && (
          <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm z-10">
            {imageIndex + 1} / {imageArray.length}
          </div>
        )}
      </div>

      {/* Modal de zoom */}
      {isZoomed && !imageError[imageIndex] && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={currentImage}
            alt={`Imagem ${imageIndex + 1} - Ampliada`}
            className="max-w-full max-h-full object-contain"
            onClick={() => setIsZoomed(false)} 
          />
        </div>
      )}
    </div>
  );
}
