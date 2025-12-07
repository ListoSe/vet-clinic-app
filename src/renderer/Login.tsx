import React, { useState } from 'react';

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
};

export default function Login() {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Простая валидация
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setError('');
    console.log('Email:', email, 'Password:', password);
    alert('Вход выполнен (симуляция)');
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
        <h2 style={styles.title}>Login</h2>

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

        <button type="submit" style={styles.button}>
          Sign In
        </button>
      </form>
    </div>
  );
}
