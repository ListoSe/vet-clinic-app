import React, { useEffect, useState } from 'react';
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
  // --- СТАН ДАНИХ ---
  const [vets, setVets] = useState<Vet[]>([
    {
      id: 1,
      name: 'Іван Іваненко',
      phone: '0501234567',
      photoUrl: icon,
      description: 'Спеціаліст з великим досвідом. 10 років практики.',
    },
    {
      id: 2,
      name: 'Марія Петрівна',
      phone: '0677654321',
      photoUrl: icon,
      description: 'Хірург, стаж 6 років.',
    },
  ]);

  // --- СТАНИ ІНТЕРФЕЙСУ ---
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVet, setEditingVet] = useState<Vet | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // --- СТАНИ ВИДАЛЕННЯ ---
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // --- ЕФЕКТИ ---
  // Синхронізуємо превью при відкритті модалки
  useEffect(() => {
    if (isModalOpen) {
      setPhotoPreview(editingVet?.photoUrl || null);
    } else {
      setPhotoPreview(null);
    }
  }, [isModalOpen, editingVet]);

  // --- ОБРОБНИКИ ПОДІЙ ---
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const vetData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      description: formData.get('description') as string,
      photoUrl: photoPreview || icon,
    };

    if (editingVet) {
      setVets(
        vets.map((v) => (v.id === editingVet.id ? { ...v, ...vetData } : v)),
      );
    } else {
      setVets([...vets, { ...vetData, id: Date.now() }]);
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = (password: string) => {
    const correctPassword = currentUser?.password || '1234';
    if (password === correctPassword) {
      setVets(vets.filter((v) => v.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setErrorMessage('');
    } else {
      setErrorMessage('Невірний пароль!');
    }
  };

  const filteredVets = vets
    .filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.name < b.name ? (sortAsc ? -1 : 1) : sortAsc ? 1 : -1));

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
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="btn btn-secondary"
          style={{ fontSize: '14px' }}
        >
          {sortAsc ? 'А-Я' : 'Я-А'}
        </button>
        <button
          onClick={() => {
            setEditingVet(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
          style={{ fontSize: '14px' }}
        >
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
            <tr
              key={v.id}
              className="clickable-row"
              onClick={() => {
                setEditingVet(v);
                setIsModalOpen(true);
              }}
            >
              <td>
                <img
                  src={v.photoUrl}
                  alt=""
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              </td>
              <td style={{ fontWeight: '600' }}>{v.name}</td>
              <td style={{ color: 'var(--text-light)' }}>{v.phone}</td>
              <td style={{ textAlign: 'right' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(v.id);
                  }}
                  className="btn"
                  style={{
                    color: 'var(--danger)',
                    background: 'none',
                    padding: '4px 8px',
                    fontSize: '13px',
                  }}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ marginTop: 0 }}>
                {editingVet ? 'Редагувати профіль' : 'Новий фахівець'}
              </h3>

              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div
                  onClick={() =>
                    document.getElementById('photo-upload')?.click()
                  }
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    border: '2px dashed #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    margin: '0 auto',
                  }}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      Додати фото
                    </span>
                  )}
                </div>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <form onSubmit={handleSave}>
              <label className="input-label">ПІБ Лікаря</label>
              <input
                name="name"
                defaultValue={editingVet?.name}
                className="input-field"
                required
              />

              <label className="input-label">Контактний телефон</label>
              <input
                name="phone"
                defaultValue={editingVet?.phone}
                className="input-field"
                required
              />

              <label className="input-label">Спеціалізація</label>
              <textarea
                name="description"
                defaultValue={editingVet?.description}
                className="input-field"
                style={{ height: '80px', resize: 'none' }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Зберегти
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
