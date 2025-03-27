import React, { useEffect, useState, useCallback } from 'react';
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
  isHost: boolean;
  participantCount: number;
}

function Room() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [participants, setParticipants] = useState<Array<{ id: string; username: string; vote?: number; isHost?: boolean }>>([]);
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: 'success' | 'error' }>>([]);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [showVotePopup, setShowVotePopup] = useState(false);
  const [pendingVote, setPendingVote] = useState<number | null>(null);
  const [showConnectionPopup, setShowConnectionPopup] = useState(false);

  useEffect(() => {
    const state = location.state as LocationState;
    if (!state?.roomId || !state?.username) {
      navigate('/');
      return;
    }

    setRoomId(state.roomId);
    setUsername(state.username);
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
      socket.emit('joinRoom', { roomId, username });
    }

    // Katılımcı listesi güncelleme
    const handleParticipantsUpdate = (updatedParticipants: Array<{ id: string; username: string; vote?: number; isHost?: boolean }>) => {
      setParticipants(updatedParticipants);
    };

    // Yeni katılımcı bildirimi
    const handleNewParticipant = (participant: { username: string; isHost?: boolean }) => {
      if (!participant.isHost) {
        addNotification(`${participant.username} toplantıya katıldı`, 'success');
      }
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
    socket.on('participantLeft', handleParticipantLeft);
    socket.on('voteUpdate', handleVoteUpdate);
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
      socket.off('participantLeft', handleParticipantLeft);
      socket.off('voteUpdate', handleVoteUpdate);
      socket.off('hostLeft');
    };
  }, [socket, roomId, username, isConnected, addNotification, navigate]);

  const handleVote = useCallback((value: number) => {
    if (!socket) return;

    setPendingVote(value);
    setShowVotePopup(true);
  }, [socket]);

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
              isHost={isHost}
            />
          </div>

          {/* Cards Section */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-8">
            {/* Katılımcı Listesi - Sadece moderatör için */}
            {isHost && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Katılımcılar
                  </h3>
                  <button
                    onClick={() => {
                      if (socket) {
                        socket.emit('startVoting', { roomId });
                        addNotification('Oylama başlatıldı', 'success');
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Oylamayı Başlat
                  </button>
                </div>
                <ParticipantList participants={participants} />
              </div>
            )}

            {/* Fibonacci Kartları - Sadece katılımcılar için */}
            {!isHost && (
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 text-center">
                  Fibonacci Kartları
                </h3>
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