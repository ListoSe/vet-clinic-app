import React, { JSX, useState, useEffect } from 'react';
import {
  BrowserRouter as Router, // Заменили для корректной работы путей
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './Login';
import Vet from './MainAppVet';
import Admin from './MainAppAdmin';

import './App.css';

// Компонент защиты маршрутов
function ProtectedRoute({
  user,
  requiredRole,
  children,
}: {
  user: any;
  requiredRole: string;
  children: JSX.Element;
}): JSX.Element {
  // Если пользователя нет — на страницу входа
  if (!user) return <Navigate to="/" replace />;

  // Если роль не совпадает — можно кидать на страницу "Доступ запрещен" или обратно
  if (user.role !== requiredRole) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  // Инициализируем состояние из localStorage, чтобы не разлогиниваться при F5
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Функция для входа: сохраняет и в state, и в память браузера
  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Функция для выхода (пригодится позже)
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <Routes>
        {/* Если пользователь уже вошел, при заходе на "/" редиректим его по роли */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? "/admin" : "/vet"} replace />
            ) : (
              <Login setUser={handleLogin} />
            )
          }
        />

        {/* Маршрут Ветеринара */}
        <Route
          path="/vet"
          element={
            <ProtectedRoute user={user} requiredRole="vet">
              <Vet user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Маршрут Админа */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <Admin user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Редирект для несуществующих страниц */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
