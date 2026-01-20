import React, { useState } from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  userName?: string;
  errorMessage?: string;
  setErrorMessage: (msg: string) => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  errorMessage,
  setErrorMessage,
}: ConfirmDeleteModalProps) {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(password);
    setPassword('');
  };

  const handleClose = () => {
    setPassword('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: 'var(--danger)', marginTop: 0 }}>
          Підтвердити видалення
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-light)',
            marginBottom: '16px',
          }}
        >
          Підтвердіть паролем користувача <strong>{userName || 'Адмін'}</strong>
          :
        </p>
        <input
          type="password"
          className="input-field"
          style={{ borderColor: errorMessage ? 'var(--danger)' : '' }}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrorMessage('');
          }}
          autoFocus
          placeholder="Введіть ваш пароль"
        />
        {errorMessage && <div className="error-banner">{errorMessage}</div>}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={handleConfirm}
            className="btn btn-danger"
            style={{ flex: 1 }}
          >
            Видалити
          </button>
          <button
            onClick={handleClose}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}
