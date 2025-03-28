import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
  roomId: string;
  isHost: boolean;
  extractedTeamName?: string;
}

function Join() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [participantCount, setParticipantCount] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');

  const state = location.state as LocationState;
  const roomId = state?.roomId;
  const isHost = state?.isHost;
  const extractedTeamName = state?.extractedTeamName;

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

    if (isHost) {
      if (participantCount < 1) {
        setError('Katılımcı sayısı en az 1 olmalıdır');
        return;
      }
      if (!teamName.trim()) {
        setError('Lütfen ekip adını girin');
        return;
      }
    }

    navigate('/room', {
      state: {
        roomId,
        username: username.trim(),
        teamName: isHost ? teamName.trim() : (extractedTeamName || 'Takım 1'),
        isHost,
        participantCount
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative">
        {/* Arka plan kartı */}
        <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-3xl transform rotate-3"></div>
        
        {/* Ana kart */}
        <div className="relative bg-white rounded-3xl shadow-xl p-8 sm:p-12 w-full max-w-md">
          <div className="flex flex-col items-center space-y-8">
            {/* Logo ve Başlık */}
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
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-cyan-400">
                  Scrum Poker
                </h1>
                <p className="text-sm text-gray-500">Oda: {roomId}</p>
              </div>
            </div>

            {/* Form */}
            <div className="w-full space-y-6">
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
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-lg"
                />
              </div>

              {isHost && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="team-name" className="block text-sm font-medium text-gray-700">
                      Ekip Adı
                    </label>
                    <input
                      id="team-name"
                      type="text"
                      placeholder="Ekip adını girin"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-lg"
                    />
                  </div>

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
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-lg"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <button
                onClick={handleJoin}
                disabled={!username.trim() || (isHost && (participantCount < 1 || !teamName.trim()))}
                className="w-full flex justify-center py-3 px-6 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform transition-all duration-150 hover:scale-105 shadow-md hover:shadow-lg"
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
      </div>
    </div>
  );
}

export default Join; 