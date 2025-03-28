import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [extractedTeamName, setExtractedTeamName] = useState('');

  const handleRoomIdChange = (value: string) => {
    // Oda kodu ve ekip adını ayır
    const parts = value.split(' - ');
    const newRoomId = parts[0].trim().toUpperCase();
    if (parts.length > 1) {
      setExtractedTeamName(parts[1].trim());
    }
    setRoomId(newRoomId);
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate('/join', { 
      state: { 
        roomId: newRoomId,
        isHost: true
      }
    });
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      navigate('/join', { 
        state: { 
          roomId: roomId.trim().toUpperCase(),
          isHost: false,
          extractedTeamName // Ekip adını state'e ekle
        }
      });
    } else {
      alert('Lütfen oda kodunu girin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative">
        {/* Arka plan kartı */}
        <div className="absolute -top-4 -right-4 w-full h-full bg-sky-500 rounded-3xl transform rotate-3"></div>
        
        {/* Ana kart */}
        <div className="relative bg-white rounded-3xl shadow-xl p-8 sm:p-12 w-full max-w-md">
          <div className="flex flex-col items-center space-y-8">
            {/* Logo ve Başlık */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                {/* Logo arka plan efektleri */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-300 rounded-lg transform rotate-6 opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-sky-400 to-cyan-300 rounded-lg transform -rotate-3 opacity-80 blur-sm"></div>
                {/* Logo ana container */}
                <div className="relative bg-gradient-to-br from-sky-500 to-cyan-400 text-white w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-lg shadow-lg">
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-white to-sky-50">5</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-cyan-400">
                  Scrum Poker
                </h1>
                <p className="text-sm text-gray-500">Planning Made Easy</p>
              </div>
            </div>

            {/* Form */}
            <div className="w-full space-y-6">
              {/* Toplantı Oluştur Butonu */}
              <button
                onClick={handleCreateRoom}
                className="w-full flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-sky-500 to-cyan-400 rounded-xl hover:from-sky-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transform transition-transform duration-150 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Toplantı Oluştur
              </button>

              {/* Ayırıcı */}
              <div className="flex items-center w-full">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="px-4 text-sm text-gray-500">veya</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                  Oda Kodu
                </label>
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => handleRoomIdChange(e.target.value)}
                  placeholder="Oda kodunu girin"
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleJoinRoom}
                className="w-full flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-sky-500 to-cyan-400 rounded-xl hover:from-sky-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transform transition-transform duration-150 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Odaya Katıl
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 