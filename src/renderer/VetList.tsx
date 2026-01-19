import React, { useEffect, useState, useCallback } from 'react';
import icon from './icon.png';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import api from '../api/api'; // Твій налаштований axios з інтерцептором

interface Vet {
  id: string; // В базі це UUID (рядок)
  name: string;
  phone: string;
  photo: string | null; // В базі 'photo'
  info: string | null; // В базі 'info'
  roles: string[];
}

interface VetListProps {
  currentUser?: {
    name: string;
    roles: string[];
  };
}

export default function VetList({ currentUser }: VetListProps) {
  const SERVER_URL = 'http://localhost:3000';
  // --- СТАН ДАНИХ (тепер з сервера) ---
  const [vets, setVets] = useState<Vet[]>([]);

  // --- СТАНИ ІНТЕРФЕЙСУ ---
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVet, setEditingVet] = useState<Vet | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // --- СТАНИ ВИДАЛЕННЯ ---
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const isAdmin = currentUser?.roles?.includes('ADMIN');

  // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
  const loadData = useCallback(async () => {
    try {
      const res = await api.get<Vet[]>('/users');
      // Фільтруємо тільки ветеринарів
      const data = Array.isArray(res.data) ? res.data : [];
      setVets(data.filter((u) => u.roles?.includes('VET')));
    } catch (e) {
      console.error('Помилка завантаження:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Синхронізуємо превью при відкритті модалки
  useEffect(() => {
    if (isModalOpen) {
      // Беремо фото саме з поля .photo, як воно приходить з бази
      setPhotoPreview(editingVet?.photo || null);
    } else {
      setPhotoPreview(null);
    }
  }, [isModalOpen, editingVet]);

  // --- ОБРОБНИКИ ПОДІЙ ---
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;

    // 1. Використовуємо FormData замість звичайного об'єкта
    const formData = new FormData();

    // 2. Додаємо текстові дані з форми
    formData.append(
      'name',
      (formElement.elements.namedItem('name') as HTMLInputElement).value,
    );
    formData.append(
      'phone',
      (formElement.elements.namedItem('phone') as HTMLInputElement).value,
    );
    formData.append(
      'info',
      (formElement.elements.namedItem('description') as HTMLTextAreaElement)
        .value,
    );

    // 3. Отримуємо файл з інпуту (а не Base64 рядок)
    const fileInput = document.getElementById(
      'photo-upload',
    ) as HTMLInputElement;
    if (fileInput.files?.[0]) {
      formData.append('photo', fileInput.files[0]);
    }

    try {
      if (editingVet) {
        // Оновлення існуючого
        await api.patch(`/users/${editingVet.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Створення нового (додаємо обов'язкові поля для бекенда)
        formData.append('login', `vet_${Date.now()}`);
        formData.append('password', 'TemporaryPassword123');
        formData.append('roles', 'VET');

        await api.post('/users', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setIsModalOpen(false);
      loadData(); // Перезавантажуємо список, щоб побачити зміни та фото
    } catch (err: any) {
      // Обробка помилки 409 (унікальність телефону)
      if (err.response?.status === 409) {
        alert('Помилка: Користувач з таким номером телефону вже існує!');
      } else {
        alert('Помилка при збереженні даних');
      }
      console.error(err);
    }
  };

  const handleConfirmDelete = async (password: string) => {
    // Тут можна залишити перевірку пароля або просто видаляти через API
    // Для простоти робимо запит до API:
    try {
      if (deleteConfirmId) {
        await api.delete(`/users/${deleteConfirmId}`, {
          data: { password },
        });
        setDeleteConfirmId(null);
        setErrorMessage('');
        loadData();
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          'Не вдалося видалити. Можливо, невірний пароль або права.',
      );
    }
  };

  const filteredVets = vets
    .filter((v) => (v.name || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA < nameB ? (sortAsc ? -1 : 1) : sortAsc ? 1 : -1;
    });

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
        {isAdmin && (
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
        )}
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
                if (isAdmin) {
                  setEditingVet(v);
                  setIsModalOpen(true);
                }
              }}
            >
              <td>
                <img
                  src={v.photo ? `${SERVER_URL}${v.photo}` : icon}
                  alt=""
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              </td>
              <td style={{ fontWeight: '600' }}>{v.name || 'Без імені'}</td>
              <td style={{ color: 'var(--text-light)' }}>{v.phone || '—'}</td>
              <td style={{ textAlign: 'right' }}>
                {isAdmin && (
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
                )}
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
                  {/* Пріоритет: нове прев'ю -> старе фото з бази -> дефолтна іконка */}
                  {photoPreview || editingVet?.photo ? (
                    <img
                      src={
                        photoPreview?.startsWith('data:image') // 1. Якщо це нове завантажене фото (Base64)
                          ? photoPreview
                          : photoPreview || editingVet?.photo // 2. Якщо це шлях з бази
                            ? `${SERVER_URL}${photoPreview || editingVet?.photo}`
                            : icon // 3. Якщо фото взагалі немає
                      }
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={icon}
                        style={{ width: '40px', opacity: 0.5 }}
                        alt=""
                      />
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        Додати фото
                      </div>
                    </div>
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
                defaultValue={editingVet?.name || ''}
                className="input-field"
                required
              />

              <label className="input-label">Контактний телефон</label>
              <input
                name="phone"
                defaultValue={editingVet?.phone || ''}
                className="input-field"
                required
              />

              <label className="input-label">Спеціалізація</label>
              <textarea
                name="description"
                defaultValue={editingVet?.info || ''}
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
