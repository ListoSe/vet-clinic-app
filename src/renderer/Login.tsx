import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


// Додав поле 'name' для кожного користувача
const users = [
  { id: '1', role: 'admin', name: 'Адміністратор', email: 'admin@mail.com', password: '12345678' },
  { id: '2', role: 'vet', name: 'Черговий лікар', email: 'vet@mail.com', password: '1234' },
];

export default function Login({ setUser }: { setUser: any }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Будь ласка, заповніть усі поля');
      return;
    }

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      setError('Невірний логін або пароль!');
      return;
    }

    setError('');
    setUser(user); // Передаємо весь об'єкт (включаючи name та password) в App.tsx

    // Редірект залежно від ролі
    if (user.role === 'vet') {
      navigate('/vet');
    } else if (user.role === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '1.5rem' }}>VetControl</h2>

        {error && <div className="error-banner">{error}</div>}

        <label className="input-label">Email</label>
        <input
          type="email"
          className="input-field"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          Запам'ятати мене
        </label>

        <button type="submit" className="btn btn-primary">
          Увійти
        </button>
      </form>
    </div>
  );
}
