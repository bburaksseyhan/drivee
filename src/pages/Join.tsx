import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
  roomId: string;
  isHost: boolean;
}

function Join() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [participantCount, setParticipantCount] = useState(1);
  const [error, setError] = useState('');

  const state = location.state as LocationState;
  const roomId = state?.roomId;
  const isHost = state?.isHost;

  useEffect(() => {
    if (!roomId) {
      navigate('/');
    }
  }, [roomId, navigate]);

  const handleJoin = () => {
    if (!username.trim()) {
      setError('Lütfen kullanıcı adınızı girin');
      return;
    }

    if (isHost && participantCount < 1) {
      setError('Katılımcı sayısı en az 1 olmalıdır');
      return;
    }

    navigate('/room', {
      state: {
        roomId,
        username: username.trim(),
        isHost,
        participantCount
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Scrum Poker
          </h1>
          <p className="mt-2 text-gray-600">Oda: {roomId}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {isHost && (
            <div className="space-y-2">
              <label htmlFor="participant-count" className="block text-sm font-medium text-gray-700">
                Toplantıya katılacak kişi sayısı
              </label>
              <input
                id="participant-count"
                type="number"
                min="1"
                value={participantCount}
                onChange={(e) => setParticipantCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              placeholder="Adınız"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            onClick={handleJoin}
            disabled={!username.trim() || (isHost && participantCount < 1)}
            className="w-full flex justify-center py-3 px-6 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform transition-all duration-150 hover:scale-105 shadow-md hover:shadow-lg"
          >
            Toplantıya Katıl
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full flex justify-center py-3 px-6 border border-transparent text-lg font-medium rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transform transition-all duration-150 hover:scale-105"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}

export default Join; 