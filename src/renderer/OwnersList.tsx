import React, { useState } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface Pet {
  name: string;
  species: string; // собака, кіт і т.д.
}

interface Owner {
  id: number;
  name: string;
  phone: string;
  email?: string;
  pets: Pet[]; // Масив тварин власника
}

interface OwnersListProps {
  currentUser?: {
    name: string;
    password?: string;
    role: 'admin' | 'vet';
  };
}

export default function OwnersList({ currentUser }: OwnersListProps) {
  const [owners, setOwners] = useState<Owner[]>([
    {
      id: 1,
      name: 'Петро Петренко',
      phone: '0509876543',
      email: 'mihail@example.com',
      pets: [
        { name: 'Бакс', species: 'собака' },
        { name: 'Мурка', species: 'кіт' },
      ],
    },
    {
      id: 2,
      name: 'Олена Іванова',
      phone: '0671234567',
      email: 'pavel@example.com',
      pets: [{ name: 'Рекс', species: 'собака' }],
    },
  ]);

  const isAdmin = currentUser?.role === 'admin';
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const filteredOwners = owners
    .filter(
      (o) =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.pets.some((p) => p.name.toLowerCase().includes(search.toLowerCase())), // Пошук також по кличці тварини
    )
    .sort((a, b) => (a.name < b.name ? (sortAsc ? -1 : 1) : sortAsc ? 1 : -1));

  // ... handleSave та handleConfirmDelete залишаються такими ж ...
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) return;
    const formData = new FormData(e.currentTarget);
    const ownerData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
    };

    if (editingOwner) {
      setOwners(
        owners.map((o) =>
          o.id === editingOwner.id ? { ...o, ...ownerData } : o,
        ),
      );
    } else {
      setOwners([...owners, { ...ownerData, id: Date.now(), pets: [] }]); // Новий власник без тварин
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = (password: string) => {
    const passwordToMatch = currentUser?.password || '1234';
    if (password === passwordToMatch) {
      setOwners(owners.filter((o) => o.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setErrorMessage('');
    } else {
      setErrorMessage('Невірний пароль!');
    }
  };

  return (
    <div className="list-container">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          type="text"
          className="input-field"
          style={{ flex: 1, marginBottom: 0 }}
          placeholder="Пошук за власником або твариною..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="btn btn-secondary"
        >
          {sortAsc ? 'А-Я' : 'Я-А'}
        </button>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingOwner(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
            + Додати власника
          </button>
        )}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '30%' }}>Власник</th>
            <th style={{ width: '25%' }}>Тварини</th>
            <th style={{ width: '25%' }}>Телефон</th>
            {isAdmin && (
              <th style={{ width: '20%', textAlign: 'right' }}>Дії</th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredOwners.map((o) => (
            <tr
              key={o.id}
              className="clickable-row"
              onClick={() => {
                setEditingOwner(o);
                setIsModalOpen(true);
              }}
            >
              <td>
                <div style={{ fontWeight: '600' }}>👤 {o.name}</div>
              </td>
              <td>
                {o.pets.length > 0 ? (
                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}
                  >
                    {o.pets.map((pet, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          borderRadius: '12px',
                          border: '1px solid #dbeafe',
                        }}
                      >
                        {pet.species === 'собака' ? '🐕' : '🐈'} {pet.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                    Немає тварин
                  </span>
                )}
              </td>
              <td style={{ color: 'var(--text-light)' }}>{o.phone}</td>
              {isAdmin && (
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(o.id);
                    }}
                    className="btn"
                    style={{
                      background: 'none',
                      color: 'var(--danger)',
                      fontSize: '12px',
                      padding: '4px 8px',
                    }}
                  >
                    Видалити
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Модалка (залишаємо поля, додаємо список тварин для перегляду) */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
              {!isAdmin
                ? 'Картка власника'
                : editingOwner
                  ? 'Редагувати власника'
                  : 'Нова картка власника'}
            </h3>
            <form onSubmit={handleSave}>
              <label className="input-label">ПІБ Власника</label>
              <input
                name="name"
                defaultValue={editingOwner?.name}
                className="input-field"
                required
                readOnly={!isAdmin}
              />

              <label className="input-label">Контактний телефон</label>
              <input
                name="phone"
                defaultValue={editingOwner?.phone}
                className="input-field"
                required
                readOnly={!isAdmin}
              />

              <label className="input-label">Email</label>
              <input
                name="email"
                defaultValue={editingOwner?.email}
                className="input-field"
                required
                readOnly={!isAdmin}
              />

              {editingOwner && (
                <div style={{ marginBottom: '15px' }}>
                  <label className="input-label">Тварини власника</label>
                  <div
                    style={{
                      padding: '10px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {editingOwner.pets.map((p, i) => (
                      <div
                        key={i}
                        style={{ fontSize: '14px', marginBottom: '4px' }}
                      >
                        {p.species === 'собака' ? '🐕' : '🐈'}{' '}
                        <strong>{p.name}</strong> ({p.species})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                {isAdmin && (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Зберегти
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  {isAdmin ? 'Скасувати' : 'Закрити'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
