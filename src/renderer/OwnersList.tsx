import React, { useState, useEffect, useCallback } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import api from '../api/api';

interface Pet {
  id: string;
  name: string;
  type: string; // собака, кіт і т.д.
}

interface Owner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  petModels: Pet[]; // Масив тварин власника
}

interface OwnersListProps {
  currentUser?: {
    name: string;
    roles: string[];
  };
}

export default function OwnersList({ currentUser }: OwnersListProps) {
  // --- СТАН ДАНИХ ---
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  // --- СТАНИ ІНТЕРФЕЙСУ ---
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);

  // --- СТАНИ ВИДАЛЕННЯ ---
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const isAdmin = currentUser?.roles?.includes('ADMIN');

  const emojiMap: { [key: string]: string } = {
    собака: '🐕',
    кіт: '🐈',
    папуга: '🦜',
    'хом’як': '🐹',
    рибка: '🐟',
  };

  // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Owner[]>('/owners');
      setOwners(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Помилка завантаження власників:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredOwners = owners
    .filter(
      (o) =>
        (o.name || '').toLowerCase().includes(search.toLowerCase()) ||
        o.petModels?.some((p) =>
          p.name.toLowerCase().includes(search.toLowerCase()),
        ), // Пошук також по кличці тварини
    )
    .sort((a, b) => (a.name < b.name ? (sortAsc ? -1 : 1) : sortAsc ? 1 : -1));

  // --- ОБРОБНИКИ ПОДІЙ ---
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ownerData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
    };

    try {
      if (editingOwner) {
        await api.patch(`/owners/${editingOwner.id}`, ownerData);
      } else {
        await api.post('/owners', ownerData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Помилка при збереженні');
    }
  };

  const handleConfirmDelete = async (password: string) => {
    try {
      if (deleteConfirmId) {
        await api.delete(`/owners/${deleteConfirmId}`, {
          data: { password },
        });
        setDeleteConfirmId(null);
        setErrorMessage('');
        loadData();
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Помилка видалення. Перевірте пароль.',
      );
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Завантаження...</div>;

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
                {o.petModels && o.petModels.length > 0 ? (
                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}
                  >
                    {o.petModels.map((pet, idx) => (
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
                        {emojiMap[pet.type.toLowerCase()] || '🐾'} {pet.name}
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

              {editingOwner?.petModels && editingOwner.petModels.length > 0 && (
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
                    {editingOwner.petModels.map((p, i) => (
                      <div
                        key={i}
                        style={{ fontSize: '14px', marginBottom: '4px' }}
                      >
                        {emojiMap[p.type.toLowerCase()] || '🐾'}{' '}
                        <strong>{p.name}</strong> ({p.type})
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
