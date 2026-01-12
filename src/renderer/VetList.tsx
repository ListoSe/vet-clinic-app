import React, { useState } from 'react';
import icon from './icon.png';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface Vet {
  id: number;
  name: string;
  phone: string;
  photoUrl?: string;
  description?: string;
}

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

  // Спрощені стани для видалення
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

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

  // Нова функція підтвердження видалення для ConfirmDeleteModal
  const handleConfirmDelete = (password: string) => {
    const correctPassword = currentUser?.password || '1234';
    if (password === correctPassword) {
      setVets(vets.filter(v => v.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setErrorMessage('');
    } else {
      setErrorMessage('Невірний пароль!');
    }
  };

  const filteredVets = vets
    .filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.name < b.name ? (sortAsc ? -1 : 1) : (sortAsc ? 1 : -1)));

  return (
    <div className="list-container" style={{ width: '100%' }}>
      {/* Панель керування */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          placeholder="Пошук лікаря..."
          className="input-field"
          style={{ flex: 1, marginBottom: 0 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setSortAsc(!sortAsc)} className="btn btn-secondary" style={{ fontSize: '14px' }}>
          {sortAsc ? 'А-Я' : 'Я-А'}
        </button>
        <button onClick={() => { setEditingVet(null); setIsModalOpen(true); }} className="btn btn-primary" style={{ fontSize: '14px' }}>
          + Додати лікаря
        </button>
      </div>

      {/* Таблиця */}
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '60px' }}>Фото</th>
            <th>ПІБ Ветеринара</th>
            <th>Телефон</th>
            <th style={{ textAlign: 'right' }}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredVets.map((v) => (
            <tr key={v.id} className="clickable-row" onClick={() => { setEditingVet(v); setIsModalOpen(true); }}>
              <td>
                <img src={v.photoUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
              </td>
              <td style={{ fontWeight: '600' }}>{v.name}</td>
              <td style={{ color: 'var(--text-light)' }}>{v.phone}</td>
              <td style={{ textAlign: 'right' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(v.id); }}
                  className="btn"
                  style={{ color: 'var(--danger)', background: 'none', padding: '4px 8px', fontSize: '13px' }}
                >
                  Видалити
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Модалка редагування/додавання */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
              {editingVet ? 'Редагувати профіль' : 'Новий фахівець'}
            </h3>
            <form onSubmit={handleSave}>
              <label className="input-label">ПІБ Лікаря</label>
              <input name="name" defaultValue={editingVet?.name} className="input-field" required />

              <label className="input-label">Контактний телефон</label>
              <input name="phone" defaultValue={editingVet?.phone} className="input-field" required />

              <label className="input-label">Спеціалізація</label>
              <textarea
                name="description"
                defaultValue={editingVet?.description}
                className="input-field"
                style={{ height: '80px', resize: 'none' }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Зберегти</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Скасувати</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ВИКОРИСТАННЯ СПІЛЬНОЇ МОДАЛКИ ВИДАЛЕННЯ */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        userName={currentUser?.name}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
}
