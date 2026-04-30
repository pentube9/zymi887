import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);
const ConnectionStatusContext = createContext('disconnected');

export const useSocket = () => useContext(SocketContext);
export const useConnectionStatus = () => useContext(ConnectionStatusContext);

export const SocketProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    if (socketRef.current) {
      socketRef.current.close();
    }

    setConnectionStatus('connecting');
    const newSocket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on('connect', () => {
      setConnectionStatus('connected');
      newSocket.emit('join', user.id);
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    newSocket.on('reconnect_attempt', () => {
      setConnectionStatus('reconnecting');
    });

    newSocket.on('reconnect', () => {
      setConnectionStatus('connected');
      newSocket.emit('join', user.id);
    });

    newSocket.on('reconnect_failed', () => {
      setConnectionStatus('offline');
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [user?.id]);

  return (
    <ConnectionStatusContext.Provider value={connectionStatus}>
      <SocketContext.Provider value={socket}>
        {children}
      </SocketContext.Provider>
    </ConnectionStatusContext.Provider>
  );
};