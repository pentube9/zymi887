import { useState, useEffect } from 'react';
import { SocketProvider } from './socket/SocketContext.jsx';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import AdminPanel from './components/admin/AdminPanel.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('zymi_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('zymi_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const path = window.location.pathname;

  useEffect(() => {
    if (path === '/exclusivesecure' && !admin) {
      window.location.href = '/exclusivesecure/login';
    }
  }, [path, admin]);

  const handleLogin = (userData) => {
    // Store token for API auth
    localStorage.setItem('zymi_token', userData.token);
    // Store user info (without token for convenience)
    const userInfo = { id: userData.id, username: userData.username, role: userData.role };
    localStorage.setItem('zymi_user', JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const handleLogout = () => {
    localStorage.removeItem('zymi_user');
    setUser(null);
  };

  const handleAdminLogin = (adminData) => {
    setAdmin(adminData);
    window.location.href = '/exclusivesecure';
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('zymi_admin_token');
    localStorage.removeItem('zymi_admin');
    setAdmin(null);
    window.location.href = '/exclusivesecure/login';
  };

  if (path.startsWith('/exclusivesecure')) {
    if (path === '/exclusivesecure/login') {
      if (admin) {
        window.location.href = '/exclusivesecure';
        return null;
      }
      return <AdminLogin onLogin={handleAdminLogin} />;
    }
    if (!admin) {
      return <AdminLogin onLogin={handleAdminLogin} />;
    }
    return <AdminPanel admin={admin} onLogout={handleAdminLogout} />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <SocketProvider user={user}>
      <Dashboard user={user} onLogout={handleLogout} />
    </SocketProvider>
  );
}

export default App;