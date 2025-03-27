import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    // Socket.IO istemcisini oluştur
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      forceNew: true,
      path: '/socket.io/'
    });

    // Bağlantı olaylarını dinle
    socket.on('connect', () => {
      console.log('Socket.IO bağlantısı başarılı');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO bağlantısı kesildi');
      setIsConnected(false);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket.IO bağlantı hatası:', error);
    });

    // Socket referansını sakla
    socketRef.current = socket;

    // Cleanup
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return { socket: socketRef.current, isConnected };
} 