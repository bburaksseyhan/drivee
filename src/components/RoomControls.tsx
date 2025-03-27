import React from 'react';

interface RoomControlsProps {
  isVoting: boolean;
  isHost: boolean;
  onStartVoting: () => void;
  onShowResults: () => void;
  onResetVoting: () => void;
  onLeaveRoom: () => void;
}

export function RoomControls({
  isVoting,
  isHost,
  onStartVoting,
  onShowResults,
  onResetVoting,
  onLeaveRoom,
}: RoomControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {isHost && (
        <>
          {!isVoting && (
            <button
              onClick={onStartVoting}
              className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Oylamayı Başlat
            </button>
          )}
          {isVoting && (
            <button
              onClick={onShowResults}
              className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sonuçları Göster
            </button>
          )}
          <button
            onClick={onResetVoting}
            className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Sıfırla
          </button>
        </>
      )}
      <button
        onClick={onLeaveRoom}
        className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Toplantıdan Ayrıl
      </button>
    </div>
  );
} 