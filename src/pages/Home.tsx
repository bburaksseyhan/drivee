import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = React.useState('');

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
          isHost: false
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Scrum Poker
            </span>
          </h1>
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5">
            Takımınızla birlikte hızlı ve etkili eforlama yapın
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={handleCreateRoom}
            className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-150 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-blue-200 group-hover:text-blue-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </span>
            Toplantı Oluştur
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-500 bg-white">
                veya mevcut bir toplantıya katılın
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="room-id" className="block text-sm font-medium text-gray-700">
                Toplantı ID'si
              </label>
              <input
                id="room-id"
                type="text"
                placeholder="Örn: ABC123"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg uppercase"
              />
            </div>
            <button
              onClick={handleJoinRoom}
              disabled={!roomId.trim()}
              className="w-full flex justify-center py-3 px-6 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform transition-all duration-150 hover:scale-105 shadow-md hover:shadow-lg"
            >
              Toplantıya Katıl
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 