import React from 'react';

interface RoomHeaderProps {
  roomId: string;
  username: string;
  isHost: boolean;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({ roomId, username, isHost }) => {
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Toplantı ID kopyalandı!');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Scrum Poker
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isHost ? 'Moderatör' : 'Katılımcı'}: {username}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Toplantı ID:</span>
          <button
            onClick={handleCopyRoomId}
            className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {roomId}
          </button>
        </div>
      </div>
    </div>
  );
}; 