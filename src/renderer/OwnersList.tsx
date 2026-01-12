import React, { useState } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface Owner {
  id: number;
  name: string;
  phone: string;
  address?: string;
}

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
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleConfirmDelete = (password: string) => {
    const passwordToMatch = currentUser?.password || '1234';
    if (password === passwordToMatch) {
      setOwners(owners.filter(o => o.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setErrorMessage('');
    } else {
      setErrorMessage('Невірний пароль!');
    }
  };

  const filteredOwners = owners
    .filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.name < b.name ? (sortAsc ? -1 : 1) : (sortAsc ? 1 : -1)));

  return (
    <div className="list-container">
      {/* Керування */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          type="text"
          className="input-field"
          style={{ flex: 1, marginBottom: 0 }}
          placeholder="Пошук власника..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setSortAsc(!sortAsc)} className="btn btn-secondary">
          {sortAsc ? 'А-Я' : 'Я-А'}
        </button>
        <button onClick={() => { setEditingOwner(null); setIsModalOpen(true); }} className="btn btn-primary">
          + Додати власника
        </button>
      </div>

      {/* Таблиця */}
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '45%' }}>Власник</th>
            <th style={{ width: '35%' }}>Телефон</th>
            <th style={{ width: '20%', textAlign: 'right' }}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredOwners.map((o) => (
            <tr
              key={o.id}
              className="clickable-row"
              onClick={() => { setEditingOwner(o); setIsModalOpen(true); }}
            >
              <td style={{ fontWeight: '600' }}>👤 {o.name}</td>
              <td style={{ color: 'var(--text-light)' }}>{o.phone}</td>
              <td style={{ textAlign: 'right' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(o.id); }}
                  className="btn"
                  style={{ background: 'none', color: 'var(--danger)', fontSize: '12px', padding: '4px 8px' }}
                >
                  Видалити
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Модалка додавання/редагування */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
              {editingOwner ? 'Редагувати власника' : 'Нова картка власника'}
            </h3>
            <form onSubmit={handleSave}>
              <label className="input-label">ПІБ Власника</label>
              <input name="name" defaultValue={editingOwner?.name} className="input-field" required />

              <label className="input-label">Контактний телефон</label>
              <input name="phone" defaultValue={editingOwner?.phone} className="input-field" required />

              <label className="input-label">Адреса проживання</label>
              <input name="address" defaultValue={editingOwner?.address} className="input-field" />

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Зберегти</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Скасувати</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка видалення */}
      <ConfirmDeleteModal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={handleConfirmDelete}
          userName={currentUser?.name}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
    </div>
  );
}
