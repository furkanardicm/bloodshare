import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(userId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // WebSocket bağlantısını kur
    socketRef.current = io('http://localhost:3001', {
      query: { userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Bağlantı durumunu dinle
    socketRef.current.on('connect', () => {
      console.log('WebSocket bağlantısı kuruldu');
      setIsConnected(true);
    });

    // Bağlantı hatalarını dinle
    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket bağlantı hatası:', error);
      setIsConnected(false);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket bağlantısı kesildi');
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [userId]);

  return { socket: socketRef.current, isConnected };
} 