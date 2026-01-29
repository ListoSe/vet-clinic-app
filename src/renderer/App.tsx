import React, { JSX, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './Login';
import Vet from './MainAppVet';
import Admin from './MainAppAdmin';

import './App.css';

function ProtectedRoute({
  user,
  requiredRole,
  children,
}: {
  user: any;
  requiredRole: string;
  children: JSX.Element;
}): JSX.Element {
  if (!user) return <Navigate to="/" replace />;

  const rolesUpper = (user.roles || []).map((r: string) =>
    String(r).toUpperCase(),
  );
  if (!rolesUpper.includes(String(requiredRole).toUpperCase()))
    return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={user.roles.includes('ADMIN') ? '/admin' : '/vet'}
                replace
              />
            ) : (
              <Login setUser={handleLogin} />
            )
          }
        />

        {/* Маршрут Ветеринара */}
        <Route
          path="/vet"
          element={
            <ProtectedRoute user={user} requiredRole="VET">
              <Vet user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Маршрут Админа */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} requiredRole="ADMIN">
              <Admin user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
