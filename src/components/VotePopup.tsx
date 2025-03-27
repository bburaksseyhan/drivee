import React from 'react';

interface VotePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  value: number;
}

export const VotePopup: React.FC<VotePopupProps> = ({ isOpen, onClose, onConfirm, value }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Oy Onayı
        </h3>
        <p className="text-gray-600 mb-6">
          <span className="font-medium">{value}</span> puanlık oyunuzu onaylıyor musunuz?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Onayla
          </button>
        </div>
      </div>
    </div>
  );
}; 