import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function Login({ setUser }: { setUser: any }) {
  const navigate = useNavigate();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!login || !password) {
      setError('Будь ласка, заповніть усі поля');
      return;
    }

    setError('');

    try {
      const response = await api.post('/auth/login', {
        login,
        password,
      });

      const { user, access_token: accessToken } = response.data;

      if (user && accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('temp_pc', password); // Переробити на запрос до бекенду пізніше
        setUser(user);

        if (user.roles.includes('ADMIN')) {
          navigate('/admin');
        } else if (user.roles.includes('VET')) {
          navigate('/vet');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Невірний логін або пароль');
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2
          style={{
            textAlign: 'center',
            color: '#1e293b',
            marginBottom: '1.5rem',
          }}
        >
          VetControl
        </h2>

        {error && <div className="error-banner">{error}</div>}

        <label className="input-label">Login</label>
        <input
          type="text"
          className="input-field"
          placeholder="login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />

        <label className="input-label">Пароль</label>
        <input
          type="password"
          className="input-field"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Запам&apos;ятати мене
        </label>

        <button type="submit" className="btn btn-primary">
          Увійти
        </button>
      </form>
    </div>
  );
}
