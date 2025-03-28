import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { Card } from '../components/Card';
import { ParticipantList } from '../components/ParticipantList';
import { Notification } from '../components/Notification';
import { RoomHeader } from '../components/RoomHeader';
import { VotePopup } from '../components/VotePopup';

interface LocationState {
  roomId: string;
  username: string;
  teamName: string;
  isHost: boolean;
  participantCount: number;
}

function Room() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [participants, setParticipants] = useState<Array<{ id: string; username: string; teamName: string; vote?: number; isHost?: boolean }>>([]);
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: 'success' | 'error' }>>([]);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [username, setUsername] = useState('');
  const [teamName, setTeamName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [showVotePopup, setShowVotePopup] = useState(false);
  const [pendingVote, setPendingVote] = useState<number | null>(null);
  const [showConnectionPopup, setShowConnectionPopup] = useState(false);
  const [isVotingEnabled, setIsVotingEnabled] = useState(false);
  const [votingDuration, setVotingDuration] = useState<number>(60); // Varsayılan 60 saniye
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const state = location.state as LocationState;
    if (!state?.roomId || !state?.username || !state?.teamName) {
      navigate('/');
      return;
    }

    setRoomId(state.roomId);
    setUsername(state.username);
    setTeamName(state.teamName);
    setIsHost(state.isHost);
  }, [location, navigate]);

  // Bağlantı durumu değişikliğini izle
  useEffect(() => {
    if (!isConnected) {
      setShowConnectionPopup(true);
    } else {
      setShowConnectionPopup(false);
    }
  }, [isConnected]);

  const addNotification = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    if (!socket || !roomId || !username) return;

    // Odaya katılma
    if (!isConnected) {
      socket.emit('joinRoom', { roomId, username, teamName });
    }

    // Katılımcı listesi güncelleme
    const handleParticipantsUpdate = (updatedParticipants: Array<{ id: string; username: string; teamName: string; vote?: number; isHost?: boolean }>) => {
      setParticipants(updatedParticipants);
    };

    // Yeni katılımcı bildirimi
    const handleNewParticipant = (participant: { username: string; teamName: string }) => {
      addNotification(`${participant.username} toplantıya katıldı`, 'success');
    };

    // Ekip adı güncelleme
    const handleTeamNameUpdate = (data: { teamName: string }) => {
      setTeamName(data.teamName);
    };

    // Katılımcı ayrılma bildirimi
    const handleParticipantLeft = (participant: { username: string }) => {
      addNotification(`${participant.username} toplantıdan ayrıldı`, 'error');
    };

    // Oy güncelleme
    const handleVoteUpdate = (data: { username: string; vote: number }) => {
      console.log('Oy güncellendi:', data);
      setParticipants(prev => 
        prev.map(p => 
          p.username === data.username 
            ? { ...p, vote: data.vote }
            : p
        )
      );
    };

    // Event listener'ları ekle
    socket.on('participantsUpdate', handleParticipantsUpdate);
    socket.on('newParticipant', handleNewParticipant);
    socket.on('teamNameUpdate', handleTeamNameUpdate);
    socket.on('participantLeft', handleParticipantLeft);
    socket.on('voteUpdate', handleVoteUpdate);
    socket.on('votingStarted', () => {
      console.log('Oylama başladı event alındı');
      setIsVotingEnabled(true);
      setSelectedCard(null);
      addNotification('Oylama başladı!', 'success');
    });
    socket.on('roundStarted', () => {
      console.log('Yeni tur başladı event alındı');
      setIsVotingEnabled(false);
      setSelectedCard(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        setRemainingTime(null);
      }
      addNotification('Eforlama baştan başlatılıyor...', 'success');
    });
    socket.on('hostLeft', () => {
      addNotification('Moderatör toplantıdan ayrıldı. Ana sayfaya yönlendiriliyorsunuz.', 'error');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    });

    // Cleanup
    return () => {
      socket.off('participantsUpdate', handleParticipantsUpdate);
      socket.off('newParticipant', handleNewParticipant);
      socket.off('teamNameUpdate', handleTeamNameUpdate);
      socket.off('participantLeft', handleParticipantLeft);
      socket.off('voteUpdate', handleVoteUpdate);
      socket.off('votingStarted');
      socket.off('roundStarted');
      socket.off('hostLeft');
      setIsVotingEnabled(false);
    };
  }, [socket, roomId, username, teamName, isConnected, addNotification, navigate]);

  // Timer fonksiyonu
  const startTimer = useCallback((duration: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setRemainingTime(duration);
    
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev === null || prev <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Timer'ı temizle
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer bittiğinde
  useEffect(() => {
    if (remainingTime === 0) {
      setIsVotingEnabled(false);
      addNotification('Oylama süresi doldu!', 'error');
    }
  }, [remainingTime, addNotification]);

  const handleStartVoting = useCallback(() => {
    if (!socket) return;
    console.log('Oylama başlatılıyor...');
    socket.emit('startVoting', { roomId });
    setIsVotingEnabled(true);
    startTimer(votingDuration);
  }, [socket, roomId, votingDuration, startTimer]);

  const handleNewRound = useCallback(() => {
    if (!socket) return;
    console.log('Yeni tur başlatılıyor...');
    socket.emit('newRound', { roomId });
    setIsVotingEnabled(false); // Oylama durumunu sıfırla
    setSelectedCard(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setRemainingTime(null);
    }
  }, [socket, roomId]);

  const handleVote = useCallback((value: number) => {
    if (!socket || !isVotingEnabled) return;

    setPendingVote(value);
    setShowVotePopup(true);
  }, [socket, isVotingEnabled]);

  const handleConfirmVote = useCallback(() => {
    if (!socket || !pendingVote) return;

    console.log('Oy verildi:', {
      username,
      vote: pendingVote
    });

    setSelectedCard(pendingVote);
    socket.emit('vote', {
      roomId,
      username,
      vote: pendingVote
    });

    setShowVotePopup(false);
    setPendingVote(null);
  }, [socket, roomId, username, pendingVote]);

  const handleLeaveRoom = useCallback(() => {
    if (socket) {
      socket.emit('leaveRoom', { roomId, username });
    }
    navigate('/');
  }, [socket, roomId, username, navigate]);

  const cards = [1, 2, 3, 5, 8, 13, 21, 34, 55];

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bağlantı Durumu Popup */}
        {showConnectionPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Bağlantı Kesildi
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Sunucu ile bağlantı kesildi. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Sayfayı Yenile
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              message={notification.message}
              type={notification.type}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Header */}
          <div className="lg:col-span-3">
            <RoomHeader
              roomId={roomId}
              username={username}
              teamName={teamName}
              isHost={isHost}
              onLeaveRoom={handleLeaveRoom}
            />
          </div>

          {/* Cards Section */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-8">
            {/* Katılımcı Listesi - Sadece moderatör için */}
            {isHost && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Katılımcılar
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {!isVotingEnabled && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Eforlama Süresi</label>
                          <input
                            type="number"
                            min="10"
                            max="300"
                            value={votingDuration}
                            onChange={(e) => setVotingDuration(Math.max(10, Math.min(300, parseInt(e.target.value) || 60)))}
                            className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Süre (sn)"
                            title="Oylama süresini saniye cinsinden belirleyin (10-300 saniye)"
                          />
                        </div>
                        <button
                          onClick={handleStartVoting}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Oylamayı Başlat
                        </button>
                        <button
                          onClick={handleNewRound}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Sıfırla
                        </button>
                      </div>
                    )}
                    {isVotingEnabled && (
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-semibold text-blue-600">
                          {formatTime(remainingTime)}
                        </div>
                        <button
                          onClick={handleNewRound}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Sıfırla
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <ParticipantList participants={participants} />
              </div>
            )}

            {/* Fibonacci Kartları - Sadece katılımcılar için */}
            {!isHost && (
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Fibonacci Kartları
                  </h3>
                </div>
                {isVotingEnabled ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-4 sm:gap-6 max-w-5xl mx-auto">
                    {cards.map((card) => (
                      <Card
                        key={card}
                        value={card}
                        isSelected={selectedCard === card}
                        onSelect={handleVote}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    Oylama henüz başlamadı. Moderatörün oylamayı başlatmasını bekleyin.
                  </div>
                )}
              </div>
            )}

            {/* Toplantıdan Ayrıl Butonu */}
            <div className="flex justify-end">
              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Toplantıdan Ayrıl
              </button>
            </div>
          </div>
        </div>

        <VotePopup
          isOpen={showVotePopup}
          onClose={() => {
            setShowVotePopup(false);
            setPendingVote(null);
          }}
          onConfirm={handleConfirmVote}
          value={pendingVote || 0}
        />
      </div>
    </div>
  );
}

export default Room; 