import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket, useConnectionStatus } from '../socket/SocketContext.jsx';
import CallTimeoutNotice from './calls/CallTimeoutNotice.jsx';
import CallOverlay from './CallOverlay.jsx';
import { soundService } from '../services/soundService.js';
import MobileChatLayout from './chat/MobileChatLayout.jsx';
import { API_URL } from '../config/api.js';
import { getWebRTCConfig } from '../config/webrtcConfig.js';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  // Defensive check to prevent crashes if user is not loaded yet
  if (!user) {
    return <div className="loading-screen" style={{ padding: '20px', textAlign: 'center' }}>Loading User Data... If this persists, please refresh or check login.</div>;
  }

  const socket = useSocket();
  const connectionStatus = useConnectionStatus();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [incomingCall, setIncomingCall] = useState(null);
  const [callType, setCallType] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isLoudspeaker, setIsLoudspeaker] = useState(true);
  const [callError, setCallError] = useState('');
  const [callTimeout, setCallTimeout] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [lastSeen, setLastSeen] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 769);
  const [isMobileChat, setIsMobileChat] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 769;
      setIsMobileView(mobile);
      if (!mobile) {
        setIsMobileChat(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setIsMobileChat(true);
    markAsRead(u.id);
  };

  const handleBack = () => {
    setIsMobileChat(false);
    setSelectedUser(null);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('zymi_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const callActiveRef = useRef(false);
  const socketEventsInitialized = useRef(false);

  const createTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const scrollToBottom = useCallback((smooth = true) => {
    const el = messagesContainerRef.current;
    if (el) {
      const scrollTop = el.scrollHeight;
      if (smooth) {
        el.scrollTo({ top: scrollTop, behavior: 'smooth' });
      } else {
        el.scrollTop = scrollTop;
      }
    }
  }, []);

  const formatLastSeen = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleNewMessage = useCallback((msg) => {
    const isRelevant = (String(msg.sender_id) === String(user.id) && String(msg.receiver_id) === String(selectedUser.id)) ||
                      (String(msg.sender_id) === String(selectedUser.id) && String(msg.receiver_id) === String(user.id));
    if (isRelevant) {
      setMessages(prev => {
        // Check if this message is already in state to prevent duplicates
        if (prev.some(m => m.id === msg.id)) return prev;

        const pendingIndex = prev.findIndex(m => m.tempId === msg.tempId);
        if (pendingIndex !== -1) {
          const updated = [...prev];
          updated[pendingIndex] = { ...msg, pending: false };
          return updated;
        }
        return [...prev, msg];
      });

      if (String(msg.sender_id) !== String(user.id)) {
        soundService.playReceivedSound();
      }

      // Force scroll to bottom on new message
      requestAnimationFrame(() => scrollToBottom(false));
    }
  }, [selectedUser, user.id, scrollToBottom]);

  const handleMessageEdited = useCallback((editedMsg) => {
    setMessages(prev => prev.map(msg =>
      msg.id === editedMsg.id ? { ...msg, ...editedMsg } : msg
    ));
  }, []);

  const handleMessageDeleted = useCallback((data) => {
    setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
  }, []);

  useEffect(() => {
    // Use rAF to ensure DOM has updated before scrolling
    const raf = requestAnimationFrame(() => {
      scrollToBottom(false);
    });
    return () => cancelAnimationFrame(raf);
  }, [messages, scrollToBottom]);

  const createPeerConnection = useCallback((targetId, hasRemoteDesc = false) => {
    const pc = new RTCPeerConnection(getWebRTCConfig());

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', { to: targetId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      console.log('Got remote track:', event.streams[0]);
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      }
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        if (callActiveRef.current) {
          endCall(false);
        }
      }
    };

    peerConnectionRef.current = pc;

    // Do not add pending candidates here; handle after setRemoteDescription in callers

    return pc;
  }, [socket]);

  const startCall = async (targetId, type) => {
    setCallError('');
    setCallType(type);
    setCallStatus('calling');
    try {
      const constraints = type === 'video'
        ? { video: true, audio: true }
        : { video: false, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      const pc = createPeerConnection(targetId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('call-user', { to: targetId, from: user.id, offer, type });
setCallStatus('calling');
    callActiveRef.current = true;
    } catch (err) {
      setCallError('Camera/microphone access denied');
      setCallStatus('idle');
      setCallType(null);
    }
  };

  const handleAnswer = async (offer, from, type) => {
    try {
      const pc = createPeerConnection(from, true);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      // Now add any pending ICE candidates
      for (const candidate of pendingCandidatesRef.current) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      pendingCandidatesRef.current = [];
      const constraints = type === 'video'
        ? { video: true, audio: true }
        : { video: false, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('make-answer', { to: from, answer });
      setCallStatus('connected');
    } catch (err) {
      setCallError('Failed to answer call');
    }
  };

  const endCall = (emitToPeer = true) => {
    callActiveRef.current = false;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setCallStatus('idle');
    setCallType(null);
    setIncomingCall(null);
    setIsFullscreen(false);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (socket && selectedUser && emitToPeer) {
      socket.emit('end-call', { to: selectedUser.id });
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = async ({ from, offer, type }) => {
      const caller = users.find(u => String(u.id) === String(from));
      setIncomingCall({ from, offer, type, fromName: caller?.username || 'Unknown User' });
      soundService.playCallRingtone();
    };

    const handleCallAnswer = async ({ answer }) => {
      try {
        if (!peerConnectionRef.current) return;
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        if (peerConnectionRef.current.remoteDescription) {
          for (const candidate of pendingCandidatesRef.current) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
          pendingCandidatesRef.current = [];
        }
      } catch (err) {
        setCallError('Failed to connect call');
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      try {
        if (peerConnectionRef.current?.remoteDescription) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingCandidatesRef.current.push(candidate);
        }
      } catch (err) {
        console.error('ICE candidate error:', err);
      }
    };

    const handleCallEnded = () => {
      soundService.stopCallRingtone();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      setRemoteStream(null);
      setCallStatus('idle');
      setIncomingCall(null);
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-answer', handleCallAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('call-ended', handleCallEnded);
    socket.on('call-rejected', () => {
      setCallError('Call was rejected');
      setCallStatus('idle');
    });

    const handleUserTyping = ({ from }) => {
      setTypingUsers(prev => ({ ...prev, [from]: true }));
    };

    const handleUserStopTyping = ({ from }) => {
      setTypingUsers(prev => {
        const newState = { ...prev };
        delete newState[from];
        return newState;
      });
    };

    socket.on('user-typing', handleUserTyping);
    socket.on('user-stop-typing', handleUserStopTyping);

    const handleUserOnline = (userId) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: true }));
    };

    const handleUserOffline = (userId) => {
      setOnlineUsers(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      setLastSeen(prev => ({ ...prev, [userId]: new Date().toISOString() }));
      setTypingUsers(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    };

    socket.on('user-online', handleUserOnline);
    socket.on('user-offline', handleUserOffline);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-answer', handleCallAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('call-ended', handleCallEnded);
      socket.off('call-rejected');
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stop-typing', handleUserStopTyping);
      socket.off('user-online', handleUserOnline);
      socket.off('user-offline', handleUserOffline);
    };
  }, [socket, user, localStream, callType, createPeerConnection, selectedUser]);

  // Handle stream to video element binding
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callStatus]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callStatus]);

  useEffect(() => {
    soundService.init();
    soundService.loadSettings();

    const handleResize = () => {
      const mobile = window.innerWidth < 769;
      setIsMobileView(mobile);
      if (!mobile) {
        setIsMobileChat(false);
      }
    };

    window.addEventListener('resize', handleResize);

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        setUsers(data.filter(u => u.id !== user.id));
      } catch (err) {
        console.error('Failed to fetch users');
      }
    };
    fetchUsers();

    return () => window.removeEventListener('resize', handleResize);
  }, [user.id]);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch(`${API_URL}/api/unread/${user.id}`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        const counts = {};
        data.forEach(item => {
          counts[item.sender_id] = item.unread_count;
        });
        setUnreadCounts(counts);
      } catch (err) {
        console.error('Failed to fetch unread counts');
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

   useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/messages/${user.id}/${selectedUser.id}`, {
          headers: getAuthHeaders()
        });
        if (!res.ok) return;
        const data = await res.json();
        setMessages(prev => {
          const pending = prev.filter(m => m.pending);
          const existingIds = new Set(prev.map(m => m.id).filter(id => id));
          const newMessages = data.filter(m => !existingIds.has(m.id));
          const allMessages = [...newMessages, ...pending];
          return allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
      } catch (err) {
        console.error('Failed to fetch messages');
      }
    };
    fetchMessages();
  }, [selectedUser, user.id]);

    useEffect(() => {
    if (!selectedUser || !socket) return;

    socket.on('new-message', handleNewMessage);
    socket.on('receive_message', handleNewMessage);
    socket.on('message-edited', handleMessageEdited);
    socket.on('message-deleted', handleMessageDeleted);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('receive_message', handleNewMessage);
      socket.off('message-edited', handleMessageEdited);
      socket.off('message-deleted', handleMessageDeleted);
    };
  }, [selectedUser, socket, handleNewMessage, handleMessageEdited, handleMessageDeleted]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket) return;

    const tempId = createTempId();
    const tempMessage = {
      tempId,
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      pending: true
    };

    socket.emit('private-message', {
      to: selectedUser.id,
      from: user.id,
      content: newMessage.trim(),
      tempId
    });

    setMessages(prev => [...prev, tempMessage]);
    soundService.playSentSound();
    setNewMessage('');
    socket.emit('stop-typing', { to: selectedUser.id });
    requestAnimationFrame(() => scrollToBottom(false));
  };

  const startEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const saveEdit = async (msg) => {
    if (!editContent.trim()) return;

    try {
      const token = localStorage.getItem('zymi_token');
      const res = await fetch(`${API_URL}/api/messages/${msg.id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ messageId: msg.id, content: editContent.trim() })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to edit message');
        return;
      }

      // Optimistic update - server will broadcast message-edited event
      setEditingMessageId(null);
      setEditContent('');
    } catch (err) {
      alert('Failed to edit message');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedUser && socket) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit('typing', { to: selectedUser.id });
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', { to: selectedUser.id });
      }, 2000);
    }
  };

   const handleMessageSearch = async (e) => {
     setSearchQuery(e.target.value);
     if (e.target.value.trim().length > 0) {
       try {
         const res = await fetch(`${API_URL}/api/messages/search/${user.id}?q=${encodeURIComponent(e.target.value)}`, {
           headers: getAuthHeaders()
         });
         const data = await res.json();
         setSearchResults(data);
       } catch (err) {
         console.error('Search failed');
       }
     } else {
       setSearchResults([]);
     }
   };

  const markAsRead = async (senderId) => {
    try {
      await fetch(`${API_URL}/api/messages/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ userId: user.id, senderId })
      });
      setUnreadCounts(prev => ({ ...prev, [senderId]: 0 }));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    soundService.stopCallRingtone();
    callActiveRef.current = true;
    setSelectedUser(users.find(u => String(u.id) === String(incomingCall.from)));
    setCallType(incomingCall.type);
    await handleAnswer(incomingCall.offer, incomingCall.from, incomingCall.type);
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    if (socket && incomingCall) {
      soundService.stopCallRingtone();
      socket.emit('reject-call', { to: incomingCall.from });
    }
    setIncomingCall(null);
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !micOn;
      });
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !cameraOn;
      });
      setCameraOn(!cameraOn);
    }
  };

  const toggleLoudspeaker = async () => {
    const newState = !isLoudspeaker;
    setIsLoudspeaker(newState);
    
    // In many browsers, switching output device requires setSinkId
    // which is not supported everywhere. We'll attempt it if available.
    try {
      if (remoteVideoRef.current && remoteVideoRef.current.setSinkId) {
        // This is a simplification. Real speaker toggle usually involves 
        // selecting a different device from navigator.mediaDevices.enumerateDevices()
        console.log('Attempting to toggle loudspeaker');
      }
    } catch (error) {
      console.error('Loudspeaker toggle error:', error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.querySelector('.video-call-overlay')?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    if ((connectionStatus === 'disconnected' || connectionStatus === 'offline') && !callActiveRef.current) {
      setCallError('Connection lost. Please check your internet.');
    } else if (connectionStatus === 'connected') {
      setCallError(prev => (prev === 'Connection lost. Please check your internet.' || prev === 'Connection lost. Attempting to reconnect...') ? '' : prev);
    }
  }, [connectionStatus]);

   useEffect(() => {
     socket?.on('call-failed', ({ reason }) => {
       soundService.stopCallRingtone();
       setCallError(reason || 'Call failed');
       setCallStatus('idle');
       setCallType(null);
       if (localStream) {
         localStream.getTracks().forEach(track => track.stop());
         setLocalStream(null);
       }
     });

     socket?.on('call-timeout', () => {
       soundService.stopCallRingtone();
       setCallTimeout(true);
       setCallStatus('idle');
       setCallType(null);
       if (localStream) {
         localStream.getTracks().forEach(track => track.stop());
         setLocalStream(null);
       }
     });

     return () => {
       socket?.off('call-failed');
       socket?.off('call-timeout');
     };
   }, [socket, localStream]);

  const handleCloseTimeout = () => {
    setCallTimeout(false);
  };

  // Mobile layout
  const handleMobileSendMessage = useCallback((content) => {
    if (!selectedUser || !socket || !content.trim()) return;

    const tempId = createTempId();
    const tempMessage = {
      tempId,
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      pending: true
    };

    socket.emit('private-message', {
      to: selectedUser.id,
      from: user.id,
      content: content.trim(),
      tempId
    });

    setMessages(prev => [...prev, tempMessage]);
    socket.emit('stop-typing', { to: selectedUser.id });
  }, [selectedUser, socket, user.id]);

  // Empty state for no chat selected
  const renderNoChatSelected = () => (
    <div className="no-chat-selected">
      <div className="welcome-icon">💬</div>
      <h2>Welcome to ZYMI</h2>
      <p>Choose a conversation to start messaging or calling</p>
    </div>
  );

  // Enhanced mobile layout with proper navigation
  if (isMobileView) {
    if (isMobileChat && selectedUser) {
      // Chat view - full screen
      return (
        <div className="dashboard mobile-chat-view">
          {connectionStatus !== 'connected' && (
            <div className={`connection-banner ${connectionStatus}`}>
              {connectionStatus === 'connecting' && '🔄 Connecting...'}
              {connectionStatus === 'reconnecting' && '🔄 Reconnecting...'}
              {connectionStatus === 'disconnected' && '⚠️ Disconnected'}
              {connectionStatus === 'offline' && '❌ Offline - Please check your connection'}
            </div>
          )}

          {/* Chat Header with Back Button */}
          <div className="mobile-chat-header">
            <button className="back-btn" onClick={handleBack}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="chat-user-info">
              <div className="avatar">{selectedUser.username[0].toUpperCase()}</div>
              <div className="user-details">
                <span className="username">{selectedUser.username}</span>
                <span className="status">
                  {typingUsers[selectedUser?.id] ? 'typing...' :
                   onlineUsers[selectedUser.id] ? 'online' :
                   lastSeen[selectedUser.id] ? `Last seen ${formatLastSeen(lastSeen[selectedUser.id])}` : 'offline'}
                </span>
              </div>
            </div>
            <div className="chat-actions">
              <button className="call-btn audio" onClick={() => startCall(selectedUser.id, 'audio')}>
                📞
              </button>
              <button className="call-btn video" onClick={() => startCall(selectedUser.id, 'video')}>
                📹
              </button>
            </div>
          </div>



          {/* Message Composer */}
          <div className="message-composer">
            <button className="composer-btn emoji" disabled title="Emoji (coming soon)">😊</button>
            <button className="composer-btn attach" disabled title="Attach file (coming soon)">📎</button>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
            <button className="composer-btn mic" disabled title="Voice message (coming soon)">🎤</button>
            <button className="composer-btn send" onClick={sendMessage} disabled={!newMessage.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

          {/* Call Overlays */}
          {incomingCall && (
            <div className="incoming-call-modal">
              <div className="modal-content">
                <div className="caller-avatar">
                  {users.find(u => u.id === incomingCall.from)?.username[0].toUpperCase() || '?'}
                </div>
                <h3>{incomingCall.type === 'video' ? 'Incoming Video Call' : 'Incoming Audio Call'}</h3>
                <p>@{users.find(u => u.id === incomingCall.from)?.username}</p>
                <div className="modal-buttons">
                  <button className="reject-btn" onClick={handleRejectCall}>Reject</button>
                  <button className="accept-btn" onClick={handleAcceptCall}>Accept</button>
                </div>
              </div>
            </div>
          )}

          <CallOverlay
            callStatus={callStatus}
            callType={callType}
            incomingCall={incomingCall}
            selectedUser={selectedUser}
            localStream={localStream}
            remoteStream={remoteStream}
            onAccept={handleAcceptCall}
            onReject={handleRejectCall}
            onEndCall={() => endCall()}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onToggleSpeaker={toggleLoudspeaker}
            micOn={micOn}
            cameraOn={cameraOn}
            isLoudspeaker={isLoudspeaker}
          />
        </div>
      );
    } else {
      // Chat list view - full screen
      return (
        <div className="dashboard mobile-chat-list">
          {connectionStatus !== 'connected' && (
            <div className={`connection-banner ${connectionStatus}`}>
              {connectionStatus === 'connecting' && '🔄 Connecting...'}
              {connectionStatus === 'reconnecting' && '🔄 Reconnecting...'}
              {connectionStatus === 'disconnected' && '⚠️ Disconnected'}
              {connectionStatus === 'offline' && '❌ Offline - Please check your connection'}
            </div>
          )}

          {/* Mobile Header */}
          <div className="mobile-header">
            <div className="user-info-mini" onClick={() => setShowProfile(!showProfile)}>
              <div className="avatar">{user.username[0].toUpperCase()}</div>
              <span>{user.username}</span>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={() => setShowSearch(!showSearch)} title="Search messages">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
              <button className="logout-btn" onClick={onLogout} title="Logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="search-box">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={handleMessageSearch}
              />
            </div>
          )}

          {/* User Search */}
          <div className="user-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search contacts..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
            />
          </div>

{/* Chat List */}
          <div className="users-list">
            {users.map(u => (
              <div key={u.id} className="user-item" onClick={() => handleSelectUser(u)}>
                <div className="user-avatar">{u.username[0].toUpperCase()}</div>
                <span className="user-name">{u.username}</span>
              </div>
            ))}
          </div>

              {/* Floating Action Button */}
          <button className="fab" title="New chat (coming soon)" disabled>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>

          {showProfile && (
            <div className="profile-modal" onClick={() => setShowProfile(false)}>
              <div className="profile-content" onClick={(e) => e.stopPropagation()}>
                <div className="profile-avatar">{user.username[0].toUpperCase()}</div>
                <div className="profile-name">{user.username}</div>
                <div className="profile-id">User ID: {user.id}</div>
                <button className="profile-close-btn" onClick={() => setShowProfile(false)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
  }

  // Desktop layout - WhatsApp-style split design
  return (
    <div className="dashboard desktop-layout">
      {connectionStatus !== 'connected' && (
        <div className={`connection-banner ${connectionStatus}`}>
          {connectionStatus === 'connecting' && '🔄 Connecting...'}
          {connectionStatus === 'reconnecting' && '🔄 Reconnecting...'}
          {connectionStatus === 'disconnected' && '⚠️ Disconnected'}
          {connectionStatus === 'offline' && '❌ Offline - Please check your connection'}
        </div>
      )}

      {/* Left Sidebar - Chat List */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="user-info-mini" onClick={() => setShowProfile(!showProfile)}>
            <div className="avatar">{user.username[0].toUpperCase()}</div>
            <span>{user.username}</span>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setShowSearch(!showSearch)} title="Search messages">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <button className="logout-btn" onClick={onLogout} title="Logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="search-box">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={handleMessageSearch}
            />
          </div>
        )}

        <div className="user-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search contacts..."
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
          />
        </div>

        {/* Chat List */}
        <div className="users-list">
          {users.map(u => (
            <div key={u.id} className="user-item">
              <span>{u.username}</span>
            </div>
          ))}
        </div>

        {/* Search Messages */}
        {showSearch && (
          <div className="search-box">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={handleMessageSearch}
            />
          </div>
        )}

        {/* Search Contacts */}
        <div className="user-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search contacts..."
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
          />
          {userSearchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setUserSearchQuery('')}
              title="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Chat List */}
        <div className="users-list">
          {users.map(u => (
              <div
                className={`user-item ${selectedUser?.id === u.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedUser(u);
                  markAsRead(u.id);
                }}
              >
                <div className="user-avatar-wrapper">
                  <div className="user-avatar">{u.username[0].toUpperCase()}</div>
                  {onlineUsers[u.id] && <div className="online-dot" />}
                </div>
                <div className="user-info">
                  <div className="user-name-row">
                    <span className="user-name">{u.username}</span>
                    <span className="last-message-time">12:34</span>
                  </div>
                  <div className="last-message-preview">
                    {typingUsers[u.id] ? (
                      <span className="typing-indicator">typing...</span>
                    ) : (
                      <span>
                        {(() => {
                          // Find the most recent message for this user
                          const userMessages = messages.filter(msg =>
                            (msg.sender_id === user.id && msg.receiver_id === u.id) ||
                            (msg.sender_id === u.id && msg.receiver_id === user.id)
                          );
                          const lastMessage = userMessages.sort((a, b) =>
                            new Date(b.timestamp) - new Date(a.timestamp)
                          )[0];
                          return lastMessage ? lastMessage.content.substring(0, 30) + (lastMessage.content.length > 30 ? '...' : '') : 'No messages yet';
                        })()}
                      </span>
                    )}
                  </div>
                </div>
                {unreadCounts[u.id] > 0 && (
                  <span className="unread-badge">{unreadCounts[u.id]}</span>
                )}
              </div>
            ))}
        </div>

        {/* Floating Action Button */}
        <button className="fab" title="New chat (coming soon)" disabled>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>

      {/* Right Side - Chat Area */}
<div className="main-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
              <div className="chat-user-info">
                <div className="avatar-wrapper">
                  <div className="avatar">{selectedUser.username[0].toUpperCase()}</div>
                  {onlineUsers[selectedUser.id] && <div className="online-dot" />}
                </div>
                <div className="user-details">
                  <span className="username">{selectedUser.username}</span>
                  <span className="status">
                    {typingUsers[selectedUser?.id] ? 'typing...' :
                     onlineUsers[selectedUser.id] ? 'online' :
                     lastSeen[selectedUser.id] ? `Last seen ${formatLastSeen(lastSeen[selectedUser.id])}` : 'offline'}
                  </span>
                </div>
              </div>
              {callStatus === 'idle' && (
                <div className="chat-actions">
                  <button className="call-btn audio" onClick={() => startCall(selectedUser.id, 'audio')} title="Audio call">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </button>
                  <button className="call-btn video" onClick={() => startCall(selectedUser.id, 'video')} title="Video call">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="23 7 16 12 23 17 23 7"/>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                  </button>
                  <button className="more-btn" title="More options" disabled>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="12" cy="5" r="1"/>
                      <circle cx="12" cy="19" r="1"/>
                    </svg>
                  </button>
                </div>
              )}
              {callStatus !== 'idle' && (
                <span className="call-status-badge">
                  {callStatus === 'calling' ? 'Calling...' : 'Connected'}
                </span>
              )}
            </div>

            {/* Video Call Overlay */}
            {(callStatus === 'connected' || callStatus === 'calling') && (
              <div className="video-call-overlay">
                <div className="video-container">
                  {callType === 'video' && (
                    <div className="video-grid">
                      <div className="video-box remote">
                        <video ref={remoteVideoRef} autoPlay playsInline />
                        <span className="video-label">{selectedUser?.username}</span>
                      </div>
                      <div className="video-box local">
                        <video ref={localVideoRef} autoPlay playsInline muted />
                        <span className="video-label">You</span>
                      </div>
                    </div>
                  )}
                  {callType === 'audio' && (
                    <div className="audio-call-view">
                      <div className="audio-avatar">
                        {selectedUser.username[0].toUpperCase()}
                      </div>
                      <h3>{selectedUser.username}</h3>
                      <p>{callStatus === 'calling' ? 'Calling...' : 'Connected'}</p>
                    </div>
                  )}

                  <div className="call-info">
                    {callStatus === 'calling' && <span>Calling...</span>}
                    {callStatus === 'connected' && <span className="connected-dot">Connected</span>}
                  </div>

                  <div className="call-controls">
                    <button className={`control-btn ${!micOn ? 'off' : ''}`} onClick={toggleMic}>
                      {micOn ? '🎤' : '🔇'}
                    </button>
                    {callType === 'video' && (
                      <button className={`control-btn ${!cameraOn ? 'off' : ''}`} onClick={toggleCamera} title="Toggle Camera">
                        {cameraOn ? '📹' : '📷'}
                      </button>
                    )}
                    <button className={`control-btn ${!isLoudspeaker ? 'off' : ''}`} onClick={toggleLoudspeaker} title="Toggle Loudspeaker">
                      {isLoudspeaker ? '🔊' : '🔈'}
                    </button>
                    {callType === 'video' && (
                      <button className="control-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
                        {isFullscreen ? '⤓' : '⤢'}
                      </button>
                    )}
                    <button className="control-btn end-call" onClick={() => endCall()}>📞</button>
                  </div>
                </div>
              </div>
            )}

{/* Messages Area */}
            <div className="messages-area" ref={messagesContainerRef}>
              <div className="messages-spacer" />
              {messages.length === 0 && selectedUser ? (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                [...messages]
                  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                  .map((msg, i) => {
                    const isOwn = msg.sender_id === user.id;
                    const isEditing = editingMessageId === msg.id;

                    return (
                      <div key={msg.id || msg.tempId || i} className={`message ${isOwn ? 'sent' : 'received'}`}>
                        <div className="message-bubble">
                          {isEditing ? (
                            <div className="message-edit-form">
                              <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                autoFocus
                              />
                              <div className="edit-actions">
                                <button onClick={() => saveEdit(msg)}>✓</button>
                                <button onClick={() => cancelEdit()}>✕</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {msg.content}
                              {msg.edited_at && <span className="edited-indicator"> (edited)</span>}
                            </>
                          )}
                        </div>
                        <div className="message-meta">
                          <span className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && !msg.pending && (
                            <span className="message-status">✓✓</span>
                          )}
                          {isOwn && !isEditing && (
                            <div className="message-actions">
                              <button
                                className="edit-btn"
                                onClick={() => startEdit(msg)}
                                title="Edit message"
                              >
                                ✏️
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
              {typingUsers[selectedUser?.id] && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer */}
            <div className="message-composer">
              <button className="composer-btn emoji" disabled title="Emoji (coming soon)">😊</button>
              <button className="composer-btn attach" disabled title="Attach file (coming soon)">📎</button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
              <button className="composer-btn mic" disabled title="Voice message (coming soon)">🎤</button>
              <button className="composer-btn send" onClick={sendMessage} disabled={!newMessage.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </>
        ) : (
          renderNoChatSelected()
          )}
        </div>

        <div className="user-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            id="user-search-input"
            name="user-search"
            type="text"
            placeholder="Search contacts..."
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
          />
        </div>

        {showSearch && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(msg => (
              <div key={msg.id} className="search-result-item">
                <span className="search-sender">{msg.sender_id === user.id ? 'You' : 'User ' + msg.sender_id}:</span>
                <span className="search-content">{msg.content}</span>
              </div>
            ))}
          </div>
        )}

        <div className="users-list">
          {users
            .filter(u => u.username.toLowerCase().includes(userSearchQuery.toLowerCase()))
            .map(u => (
              <div
                key={u.id}
                className={`user-item ${selectedUser?.id === u.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedUser(u);
                  markAsRead(u.id);
                }}
              >
                <div className="user-avatar-wrapper">
                  <div className="user-avatar">{u.username[0].toUpperCase()}</div>
                  {onlineUsers[u.id] && <div className="online-dot" />}
                </div>
                <div className="user-info">
                  <span className="user-name">{u.username}</span>
                  {!onlineUsers[u.id] && lastSeen[u.id] && (
                    <span className="user-last-seen">Last seen {formatLastSeen(lastSeen[u.id])}</span>
                  )}
                </div>
                {unreadCounts[u.id] > 0 && (
                  <span className="unread-badge">{unreadCounts[u.id]}</span>
                )}
              </div>
            ))}
        </div>

        <div className="main-area">
        {selectedUser ? (
          <>
            <div className="chat-header flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-white/10 bg-slate-800/40 sticky top-0 z-10 backdrop-blur-md">
              <div className="chat-user-info flex items-center gap-3 min-w-0 flex-1">
                <div className="avatar-wrapper relative flex-shrink-0">
                  <div className="avatar w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-slate-900">
                    {selectedUser.username[0].toUpperCase()}
                  </div>
                  {onlineUsers[selectedUser.id] && <div className="online-dot absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-800 rounded-full" />}
                </div>
                <div className="chat-user-details flex flex-col min-w-0">
                  <span className="chat-user-name font-semibold text-slate-200 truncate">{selectedUser.username}</span>
                  <div className="chat-user-status text-xs flex items-center gap-1">
                    {typingUsers[selectedUser?.id] ? (
                      <span className="typing-status text-cyan-400 italic animate-pulse">typing...</span>
                    ) : onlineUsers[selectedUser.id] ? (
                      <span className="online-status text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> online
                      </span>
                    ) : lastSeen[selectedUser.id] ? (
                      <span className="offline-status text-slate-400">Last seen {formatLastSeen(lastSeen[selectedUser.id])}</span>
                    ) : (
                      <span className="offline-status text-slate-500">offline</span>
                    )}
                  </div>
                </div>
                {callStatus !== 'idle' && (
                  <span className="call-status-badge ml-2 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    {callStatus === 'calling' ? 'Calling...' : 'Connected'}
                  </span>
                )}
              </div>
              
              {callStatus === 'idle' && (
                <div className="call-buttons flex items-center gap-2 md:gap-3 flex-shrink-0">
                  <button 
                    className="call-btn audio-btn group flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg hover:shadow-emerald-500/20"
                    onClick={() => startCall(selectedUser.id, 'audio')}
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span className="hidden sm:inline">Audio</span>
                  </button>
                  <button 
                    className="call-btn video-btn group flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-900 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg hover:shadow-cyan-500/20"
                    onClick={() => startCall(selectedUser.id, 'video')}
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="23 7 16 12 23 17 23 7"/>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                    <span className="hidden sm:inline">Video</span>
                  </button>
                </div>
              )}
            </div>

{(callStatus === 'connected' || callStatus === 'calling') && (
              <div className="video-call-overlay">
                <div className="video-container">
                  {callType === 'video' && (
                    <div className="video-grid">
                      <div className="video-box remote">
                        <video ref={remoteVideoRef} autoPlay playsInline />
                        <span className="video-label">{selectedUser?.username}</span>
                      </div>
                      <div className="video-box local">
                        <video ref={localVideoRef} autoPlay playsInline muted />
                        <span className="video-label">You</span>
                      </div>
                    </div>
                  )}
                  {callType === 'audio' && (
                    <div className="audio-call-view">
                      <div className="audio-avatar">
                        {selectedUser.username[0].toUpperCase()}
                      </div>
                      <h3>{selectedUser.username}</h3>
                      <p>{callStatus === 'calling' ? 'Calling...' : 'Connected'}</p>
                    </div>
                  )}

                  <div className="call-info">
                    {callStatus === 'calling' && <span>Calling...</span>}
                    {callStatus === 'connected' && <span className="connected-dot">Connected</span>}
                  </div>

                  <div className="call-controls">
                    <button className={`control-btn ${!micOn ? 'off' : ''}`} onClick={toggleMic}>
                      {micOn ? '🎤' : '🔇'}
                    </button>
                    {callType === 'video' && (
                      <button className={`control-btn ${!cameraOn ? 'off' : ''}`} onClick={toggleCamera} title="Toggle Camera">
                        {cameraOn ? '📹' : '📷'}
                      </button>
                    )}
                    <button className={`control-btn ${!isLoudspeaker ? 'off' : ''}`} onClick={toggleLoudspeaker} title="Toggle Loudspeaker">
                      {isLoudspeaker ? '🔊' : '🔈'}
                    </button>
                    {callType === 'video' && (
                      <button className="control-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
                        {isFullscreen ? '⤓' : '⤢'}
                      </button>
                    )}
                    <button className="control-btn end-call" onClick={() => endCall()}>📞</button>
                  </div>
                </div>
</div>
              )}
            </div>
                    )}
                  </div>
                </div>
              ))}
              {typingUsers[selectedUser?.id] && (
                <div className="typing-indicator">
                  <span>{selectedUser.username} is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-area" onSubmit={sendMessage}>
              <button type="button" className="emoji-btn" onClick={() => setShowEmojiPicker && setShowEmojiPicker(!showEmojiPicker)} title="Emoji">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </button>
              <button type="button" className="attach-btn" title="Attach file (coming soon)" disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleTyping}
              />
              <button type="submit" disabled={!newMessage.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="welcome-icon">💬</div>
            <h2>Welcome to ZYMI</h2>
            <p>Select a user to start messaging or calling</p>
          </div>
        )}
      </div>

      {incomingCall && (
        <div className="incoming-call-modal">
          <div className="modal-content">
            <div className="caller-avatar">
              {users.find(u => u.id === incomingCall.from)?.username[0].toUpperCase() || '?'}
            </div>
            <h3>{incomingCall.type === 'video' ? 'Incoming Video Call' : 'Incoming Audio Call'}</h3>
            <p>@{users.find(u => u.id === incomingCall.from)?.username}</p>
            <div className="modal-buttons">
              <button className="reject-btn" onClick={handleRejectCall}>Reject</button>
              <button className="accept-btn" onClick={handleAcceptCall}>Accept</button>
            </div>
          </div>
        </div>
      )}

      {callError && (
        <div className="call-error-toast" onClick={() => setCallError('')}>
          {callError}
        </div>
      )}

      {callTimeout && (
        <CallTimeoutNotice onClose={handleCloseTimeout} />
      )}

      {showProfile && (
        <div className="profile-modal" onClick={() => setShowProfile(false)}>
          <div className="profile-content" onClick={(e) => e.stopPropagation()}>
            <div className="profile-avatar">{user.username[0].toUpperCase()}</div>
            <div className="profile-name">{user.username}</div>
            <div className="profile-id">User ID: {user.id}</div>
            <button className="profile-close-btn" onClick={() => setShowProfile(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <CallOverlay
        callStatus={callStatus}
        callType={callType}
        incomingCall={incomingCall}
        selectedUser={selectedUser}
        localStream={localStream}
        remoteStream={remoteStream}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
        onEndCall={() => endCall()}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleSpeaker={toggleLoudspeaker}
        micOn={micOn}
        cameraOn={cameraOn}
        isLoudspeaker={isLoudspeaker}
      />
    </div>
  );
}

export default Dashboard;