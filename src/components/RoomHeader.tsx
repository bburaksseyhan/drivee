import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RoomHeaderProps {
  roomId: string;
  username: string;
  teamName: string;
  isHost: boolean;
  onLeaveRoom?: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({ roomId, username, teamName, isHost, onLeaveRoom }) => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showCopyPopup, setShowCopyPopup] = useState(false);

  const handleCopyRoomId = () => {
    if (isHost) {
      // Moderatör için oda ID ve ekip adını birlikte kopyala
      const copyText = `${roomId} - ${teamName}`;
      navigator.clipboard.writeText(copyText);
    } else {
      // Katılımcılar için sadece oda ID'yi kopyala
      navigator.clipboard.writeText(roomId);
    }
    setShowCopyPopup(true);
    setTimeout(() => {
      setShowCopyPopup(false);
    }, 2000);
  };

  const handleLeaveRoom = () => {
    if (onLeaveRoom) {
      onLeaveRoom();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl">
      <div className="max-w-7xl mx-auto">
        {/* Ana Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Sol Taraf - Logo ve Bilgiler */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              {/* Logo arka plan efektleri */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-300 rounded-lg transform rotate-6 opacity-90"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-sky-400 to-cyan-300 rounded-lg transform -rotate-3 opacity-80 blur-sm"></div>
              {/* Logo ana container */}
              <div className="relative bg-gradient-to-br from-sky-500 to-cyan-400 text-white w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-lg shadow-lg">
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-white to-sky-50">5</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-cyan-400">
                Scrum Poker
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={handleCopyRoomId}
                  className="text-sm px-3 py-1 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors duration-200"
                >
                  Oda: {roomId}
                </button>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-600">
                  {isHost ? 'Moderatör' : 'Katılımcı'}: {username}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-600">
                  Ekip: {teamName}
                </span>
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Butonlar */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors duration-200"
              title="Dökümanlar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Ayarlar Paneli */}
        {showSettings && (
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Dökümanlar</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <a 
                  href="https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf#zoom=100" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-sky-600 hover:text-sky-700 hover:underline"
                >
                  Scrum Guide 2020
                </a>
              </div>
              <p className="text-sm text-gray-500">Scrum metodolojisi hakkında detaylı bilgi için resmi Scrum Guide dökümanını inceleyebilirsiniz.</p>
            </div>
          </div>
        )}

        {/* Kopyalama Popup */}
        {showCopyPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Kopyalama Başarılı
              </h3>
              <p className="text-gray-600 mb-6">
                {isHost ? 'Toplantı ID ve Ekip adı kopyalandı!' : 'Toplantı ID kopyalandı!'}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCopyPopup(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Tamam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 