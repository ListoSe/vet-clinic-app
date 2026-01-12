import React, { useState } from 'react';
import icon from './icon.png';

interface Vet {
  id: number;
  name: string;
  phone: string;
  photoUrl?: string;
  description?: string;
}

// Додано інтерфейс пропсів для отримання поточного юзера
interface VetListProps {
  currentUser?: {
    name: string;
    password?: string;
  };
}

export default function VetList({ currentUser }: VetListProps) {
  const [vets, setVets] = useState<Vet[]>([
    { id: 1, name: 'Іван Іваненко', phone: '0501234567', photoUrl: icon, description: 'Спеціаліст з великим досвідом. 10 років практики.' },
    { id: 2, name: 'Марія Петрівна', phone: '0677654321', photoUrl: icon, description: 'Хірург, стаж 6 років.' },
  ]);

  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVet, setEditingVet] = useState<Vet | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Стан для помилки пароля

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
    td: { padding: '14px 12px', borderBottom: `1px solid ${theme.border}`, fontSize: '14px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', boxSizing: 'border-box' }
  };

  // Закриття модалки видалення з очищенням станів
  const closeDeleteModal = () => {
    setDeleteConfirmId(null);
    setAdminPassword('');
    setErrorMessage('');
  };

  const handleOpenEdit = (vet: Vet) => {
    setEditingVet(vet);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingVet(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vetData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      description: formData.get('description') as string,
    };

    if (editingVet) {
      setVets(vets.map(v => v.id === editingVet.id ? { ...editingVet, ...vetData } : v));
    } else {
      setVets([...vets, { ...vetData, id: Date.now(), photoUrl: icon }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    // ПОРІВНЯННЯ: Беремо пароль залогіненого юзера або '1234'
    const correctPassword = currentUser?.password || '1234';

    if (adminPassword === correctPassword) {
      setVets(vets.filter(v => v.id !== deleteConfirmId));
      closeDeleteModal();
    } else {
      setErrorMessage('Невірний пароль користувача!');
      setAdminPassword(''); // Очищуємо поле для нової спроби
    }
  };

  const filteredVets = vets
    .filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.name < b.name ? (sortAsc ? -1 : 1) : (sortAsc ? 1 : -1)));

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <input
          placeholder="Пошук лікаря..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...styles.input, flex: 1 }}
        />
        <button onClick={() => setSortAsc(!sortAsc)} style={{ ...styles.button, backgroundColor: '#f1f5f9' }}>
          {sortAsc ? 'А-Я' : 'Я-А'}
        </button>
        <button onClick={handleOpenAdd} style={{ ...styles.button, backgroundColor: theme.primary, color: 'white' }}>
          + Додати лікаря
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: '45px' }}></th>
            <th style={styles.th}>ПІБ Ветеринара</th>
            <th style={styles.th}>Телефон</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredVets.map((v) => (
            <tr
              key={v.id}
              onClick={() => handleOpenEdit(v)}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              style={{ cursor: 'pointer' }}
            >
              <td style={styles.td}>
                <img src={v.photoUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              </td>
              <td style={{ ...styles.td, fontWeight: '600' }}>{v.name}</td>
              <td style={{ ...styles.td, color: theme.textLight }}>{v.phone}</td>
              <td style={{ ...styles.td, textAlign: 'right' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(v.id); }}
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
              {editingVet ? 'Редагувати профіль' : 'Новий фахівець'}
            </h3>
            <form onSubmit={handleSave}>
              <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>ПІБ Лікаря</label>
              <input name="name" defaultValue={editingVet?.name} style={{ ...styles.input, marginBottom: '15px', marginTop: '5px' }} required />

              <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Контактний телефон</label>
              <input name="phone" defaultValue={editingVet?.phone} style={{ ...styles.input, marginBottom: '15px', marginTop: '5px' }} required />

              <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Спеціалізація та опис</label>
              <textarea name="description" defaultValue={editingVet?.description} style={{ ...styles.input, height: '100px', resize: 'none', marginBottom: '20px', marginTop: '5px' }} />

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
            <h3 style={{ color: theme.danger, marginTop: 0 }}>Підтвердження видалення</h3>
            <p style={{ fontSize: '14px', color: theme.textLight, marginBottom: '16px' }}>
              Введіть пароль користувача <strong>{currentUser?.name || 'Адміністратор'}</strong>:
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
              <button onClick={handleDelete} style={{ ...styles.button, backgroundColor: theme.danger, color: 'white', flex: 1 }}>Видалити</button>
              <button onClick={closeDeleteModal} style={{ ...styles.button, backgroundColor: '#f1f5f9', flex: 1 }}>Назад</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
