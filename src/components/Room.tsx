import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

interface RoomProps {
  participantCount: number;
  isHost: boolean;
}

function Room({ participantCount, isHost }: RoomProps) {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;
  const [selectedCard, setSelectedCard] = useState<number | string | null>(null);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!username) {
    navigate('/');
    return null;
  }

  const handleCardClick = (number: number | string | null) => {
    setSelectedCard(selectedCard === number ? null : number);
  };

  const handleLogout = () => {
    navigate('/', { replace: true });
  };

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleEnd = () => {
    setIsStarted(false);
    setTime(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Scrum Poker
              </h1>
              <span className="text-sm text-gray-500">Oda: {roomId}</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="group relative flex items-center px-6 py-2 text-base font-medium rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform transition-all duration-150 hover:scale-105 shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-100" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-lg font-semibold text-gray-700">
            Toplam Katılımcı: {participantCount}
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Eforlama Başlat */}
              {isHost && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {isStarted ? 'Eforlama Devam Ediyor' : 'Eforlama Başlat'}
                  </h2>
                  {isStarted ? (
                    <div className="space-y-4">
                      <div className="text-lg font-mono bg-gray-100 px-4 py-2 rounded-lg text-center">
                        {formatTime(time)}
                      </div>
                      <button
                        onClick={handleEnd}
                        className="w-full px-6 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        Eforlamayı Bitir
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleStart}
                      className="w-full px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Eforlamayı Başlat
                    </button>
                  )}
                </div>
              )}

              {/* Katılımcılar */}
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Katılımcılar</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700">
                        {username} (Siz)
                      </span>
                    </div>
                    {selectedCard !== null ? (
                      <span className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {selectedCard}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Bekliyor...</span>
                    )}
                  </div>
                  {Array.from({ length: participantCount - 1 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-medium">
                          ?
                        </div>
                        <span className="font-medium text-gray-700">
                          Katılımcı {index + 1}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">Bekliyor...</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Kartlar */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'].map((number, index) => (
                <div
                  key={index}
                  onClick={() => handleCardClick(number)}
                  className={`relative rounded-lg shadow-lg p-6 cursor-pointer transition-all duration-300 flex items-center justify-center aspect-square
                    ${selectedCard === number 
                      ? 'ring-4 ring-blue-500 transform scale-105 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200' 
                      : 'bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-blue-100 hover:shadow-xl hover:-translate-y-1'
                    }`}
                >
                  <span className={`text-2xl font-bold ${selectedCard === number ? 'text-white' : 'text-gray-800'}`}>
                    {number}
                  </span>
                  {selectedCard === number && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg"></div>
                  )}
                </div>
              ))}
            </div>

            {isStarted && selectedCard !== null && (
              <div className="mt-6 text-center space-y-4">
                <p className="text-lg text-gray-600">
                  Seçilen puan: <span className="font-bold text-blue-600">{selectedCard}</span>
                </p>
                <button
                  onClick={() => handleCardClick(null)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Seçimi İptal Et
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Room; 