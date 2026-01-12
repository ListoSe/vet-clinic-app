import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Кольорова палітра як у твоїх списках
const theme = {
  primary: '#3b82f6',
  danger: '#ef4444',
  border: '#e2e8f0',
  text: '#1e293b',
  textLight: '#64748b',
  bg: '#f8fafc'
};

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.bg,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    padding: '2.5rem',
    borderRadius: '12px', // Як у модалках
    background: '#fff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    width: '350px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: theme.text,
    fontSize: '24px',
    fontWeight: '700',
  },
  label: {
    fontSize: '12px',
    color: theme.textLight,
    fontWeight: 'bold',
    marginBottom: '5px',
    textTransform: 'uppercase',
  },
  input: {
    padding: '12px 14px',
    marginBottom: '1rem',
    borderRadius: '8px', // Як у списках
    border: `1px solid ${theme.border}`,
    fontSize: '14px',
    outline: 'none',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: theme.textLight,
    fontSize: '14px',
    marginBottom: '1.5rem',
    cursor: 'pointer',
  },
  button: {
    padding: '12px',
    background: theme.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
  },
  error: {
    color: theme.danger,
    backgroundColor: '#fff5f5',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '1rem',
    textAlign: 'center',
    border: `1px solid #feb2b2`,
  },
};

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
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Вхід до системи</h2>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Email</label>
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <label style={styles.label}>Пароль</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <label style={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Запам'ятати мене
        </label>

        <button type="submit" style={styles.button}>
          Увійти
        </button>
      </form>
    </div>
  );
}
