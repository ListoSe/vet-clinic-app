import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem',
    borderRadius: '8px',
    background: '#fff',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    width: '300px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1rem',
    color: 'black',
  },
  input: {
    padding: '0.5rem',
    marginBottom: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  checkbox: {
    color: 'black',
    textAlign: 'right',
  },
  buttons: {
    display: 'flex',
    gap: '20px',
    marginTop: '20px',
    justifyContent: 'center',
  },
  button: {
    padding: '0.5rem',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  backButton: {
    width: '2rem',
    padding: '0',
  },
};

const users = [
  { role: 'admin', email: 'admin@mail.com', password: '1234' },
  { role: 'vet', email: 'vet@mail.com', password: '1234' },
];

export default function Login({ setUser }: { setUser: any }) {
  const navigate = useNavigate();

  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Простая валидация
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    const user = users.find(
      (u) => u.email === email && u.password === password && u.role === role,
    );

    if (!user) {
      setError('Неверный логин или пароль!');
      return;
    }

    setError('');
    setUser(user);

    if (role === 'vet') navigate('/vet');
    if (role === 'admin') navigate('/admin');
  };

  if (!role) {
    return (
      <div>
        <h2>Выберите роль для входа</h2>
        <div style={styles.buttons}>
          <button type="button" onClick={() => setRole('admin')}>
            Админ
          </button>
          <button type="button" onClick={() => setRole('vet')}>
            Ветеринар
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <button
          type="button"
          style={styles.backButton}
          onClick={() => setRole('')}
        >
          &larr;
        </button>
        <h2 style={styles.title}>
          {role === 'admin' ? 'Вітаю Адмін' : 'Вітаю Ветеринар'}
        </h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <label htmlFor="rememberMe" style={styles.checkbox}>
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ ...styles.checkbox, ...styles.input }}
          />
          Запам&apos;ятати мене
        </label>

        <button type="submit" style={styles.button}>
          Увійти
        </button>
      </form>
    </div>
  );
}
