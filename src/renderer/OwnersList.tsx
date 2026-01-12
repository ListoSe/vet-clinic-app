import React, { useState } from 'react';

interface Owner {
  id: number;
  name: string;
  phone: string;
  address?: string;
}

// Додано інтерфейс для пропсів
interface OwnersListProps {
  currentUser?: {
    name: string;
    password?: string;
  };
}

export default function OwnersList({ currentUser }: OwnersListProps) {
  const [owners, setOwners] = useState<Owner[]>([
    { id: 1, name: 'Петро Петренко', phone: '0509876543', address: 'вул. Шевченка, 12' },
    { id: 2, name: 'Олена Іванова', phone: '0671234567', address: 'просп. Свободи, 45' },
  ]);

  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Стан для помилки

  const theme = {
    primary: '#3b82f6',
    danger: '#ef4444',
    border: '#e2e8f0',
    text: '#1e293b',
    textLight: '#64748b'
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { width: '100%', color: theme.text },
    controls: { display: 'flex', gap: '12px', marginBottom: '20px' },
    input: {
      padding: '10px 14px', borderRadius: '8px', border: `1px solid ${theme.border}`,
      fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%', display: 'block'
    },
    button: { padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' },
    table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
    th: { textAlign: 'left', padding: '12px', borderBottom: `2px solid ${theme.border}`, color: theme.textLight, fontSize: '13px' },
    td: { padding: '14px 12px', borderBottom: `1px solid ${theme.border}`, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '420px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', boxSizing: 'border-box' }
  };

  const closeDeleteModal = () => {
    setDeleteConfirmId(null);
    setAdminPassword('');
    setErrorMessage('');
  };

  const handleOpenEdit = (owner: Owner) => {
    setEditingOwner(owner);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingOwner(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ownerData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
    };

    if (editingOwner) {
      setOwners(owners.map(o => o.id === editingOwner.id ? { ...editingOwner, ...ownerData } : o));
    } else {
      setOwners([...owners, { ...ownerData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    // Порівняння з паролем залогіненого юзера (або 1234 як запасний)
    const passwordToMatch = currentUser?.password || '1234';

    if (adminPassword === passwordToMatch) {
      setOwners(owners.filter(o => o.id !== deleteConfirmId));
      closeDeleteModal();
    } else {
      setErrorMessage('Невірний пароль!');
      setAdminPassword(''); // Очищуємо для повторного вводу
    }
  };

  const filteredOwners = owners
    .filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.name < b.name ? (sortAsc ? -1 : 1) : (sortAsc ? 1 : -1)));

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Пошук власника..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...styles.input, flex: 1 }}
        />
        <button onClick={() => setSortAsc(!sortAsc)} style={{ ...styles.button, backgroundColor: '#f1f5f9' }}>
          {sortAsc ? 'А-Я' : 'Я-А'}
        </button>
        <button onClick={handleOpenAdd} style={{ ...styles.button, backgroundColor: theme.primary, color: 'white' }}>
          + Додати власника
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: '45%' }}>Власник</th>
            <th style={{ ...styles.th, width: '35%' }}>Телефон</th>
            <th style={{ ...styles.th, width: '20%', textAlign: 'right' }}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredOwners.map((o) => (
            <tr
              key={o.id}
              onClick={() => handleOpenEdit(o)}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              style={{ cursor: 'pointer' }}
            >
              <td style={{ ...styles.td, fontWeight: '600' }}>👤 {o.name}</td>
              <td style={{ ...styles.td, color: theme.textLight }}>{o.phone}</td>
              <td style={{ ...styles.td, textAlign: 'right' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(o.id); }}
                  style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '12px' }}
                >
                  Видалити
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', marginTop: 0 }}>
              {editingOwner ? 'Редагувати власника' : 'Нова картка власника'}
            </h3>
            <form onSubmit={handleSave}>
              <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>ПІБ Власника</label>
              <input name="name" defaultValue={editingOwner?.name} style={{ ...styles.input, marginBottom: '15px', marginTop: '5px' }} required />

              <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Контактний телефон</label>
              <input name="phone" defaultValue={editingOwner?.phone} style={{ ...styles.input, marginBottom: '15px', marginTop: '5px' }} required />

              <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Адреса проживання</label>
              <input name="address" defaultValue={editingOwner?.address} style={{ ...styles.input, marginBottom: '20px', marginTop: '5px' }} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ ...styles.button, backgroundColor: theme.primary, color: 'white', flex: 1 }}>Зберегти</button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ ...styles.button, backgroundColor: '#f1f5f9', flex: 1 }}>Скасувати</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛКА ВИДАЛЕННЯ З ПЕРЕВІРКОЮ ПАРОЛЯ */}
      {deleteConfirmId && (
        <div style={styles.modalOverlay} onClick={closeDeleteModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: theme.danger, marginTop: 0 }}>Підтвердити видалення</h3>
            <p style={{ fontSize: '14px', color: theme.textLight, marginBottom: '16px' }}>
              Підтвердіть паролем користувача <strong>{currentUser?.name || 'Адмін'}</strong>:
            </p>
            <input
              type="password"
              style={{
                ...styles.input,
                borderColor: errorMessage ? theme.danger : theme.border,
                backgroundColor: errorMessage ? '#fff5f5' : 'white'
              }}
              value={adminPassword}
              onChange={e => {
                setAdminPassword(e.target.value);
                setErrorMessage('');
              }}
              autoFocus
              placeholder="Введіть ваш пароль"
            />
            {errorMessage && (
              <div style={{ color: theme.danger, fontSize: '12px', marginTop: '8px', fontWeight: 'bold', textAlign: 'center' }}>
                {errorMessage}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleDelete} style={{ ...styles.button, backgroundColor: theme.danger, color: 'white', flex: 1 }}>
                Видалити
              </button>
              <button onClick={closeDeleteModal} style={{ ...styles.button, backgroundColor: '#f1f5f9', flex: 1 }}>
                Назад
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
