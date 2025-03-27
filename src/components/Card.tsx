import React from 'react';

interface CardProps {
  value: number;
  isSelected: boolean;
  onSelect: (value: number) => void;
}

export const Card: React.FC<CardProps> = ({ value, isSelected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(value)}
      className={`
        relative w-full aspect-[3/4] rounded-xl shadow-lg transition-all duration-300
        ${isSelected 
          ? 'bg-blue-600 text-white transform scale-105 shadow-blue-200' 
          : 'bg-white text-gray-800 hover:bg-gray-50 hover:shadow-xl hover:transform hover:scale-105'
        }
        group overflow-hidden
      `}
    >
      {/* Arka plan deseni - Dairesel gradyan */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-400 to-purple-400 rounded-full blur-3xl" />
      </div>

      {/* Arka plan deseni - Nokta deseni */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Ana içerik */}
      <div className="relative h-full flex flex-col items-center justify-center p-4">
        {/* Sayı çerçevesi */}
        <div className={`
          relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center
          transition-all duration-300
          ${isSelected 
            ? 'bg-white/20 ring-2 ring-white/30' 
            : 'bg-blue-50/50 group-hover:bg-blue-100/50'
          }
        `}>
          <span className={`
            text-2xl sm:text-3xl font-bold transition-colors duration-300
            ${isSelected ? 'text-white' : 'text-gray-800 group-hover:text-blue-600'}
          `}>
            {value}
          </span>
        </div>
        
        {/* Hover efekti */}
        <div className={`
          absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0
          transition-opacity duration-300
          ${isSelected ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'}
        `} />
      </div>

      {/* Seçili durum göstergesi */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* Kenar çizgisi efekti */}
      <div className={`
        absolute inset-0 rounded-xl
        transition-all duration-300
        ${isSelected 
          ? 'ring-2 ring-white/30' 
          : 'ring-1 ring-gray-200/50 group-hover:ring-blue-200/50'
        }
      `} />
    </button>
  );
}; 