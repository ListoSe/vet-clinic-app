import React, { useState } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface Owner { id: string; name: string; }
interface Animal { id: string; name: string; type: string; age: number; ownerId: string; }
interface Treatment { medicine?: string; dose?: string; duration?: string; procedure?: string; }
interface MedicalRecordEntry { date: string; vetId?: string; diagnosis: string; treatments: Treatment[]; notes?: string; }
interface MedicalRecord { petId: string; records: MedicalRecordEntry[]; }

interface AnimalListProps {
  currentUser?: {
    id: string;
    name: string;
    password?: string;
  };
}

export default function AnimalList({ currentUser }: AnimalListProps) {
  const [owners] = useState<Owner[]>([
    { id: '1', name: 'Петро Петренко' },
    { id: '2', name: 'Олена Іванова' },
  ]);

  const [animals, setAnimals] = useState<Animal[]>([
    { id: '1', name: 'Софискус', type: 'Кіт', age: 3, ownerId: '1' },
    { id: '2', name: 'Бобик', type: 'Пес', age: 5, ownerId: '2' },
  ]);

  const [medicalRecords] = useState<MedicalRecord[]>([
    {
      petId: '1',
      records: [
        {
          date: '2025-12-07',
          diagnosis: 'Гострий риніт',
          treatments: [
            { medicine: 'Антибіотик', dose: '2 мл', duration: '5 днів' },
            { procedure: 'Промивання носа' },
          ],
          notes: 'Повторний огляд через тиждень',
        },
      ],
    },
  ]);

  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  // Стани для форм та медкартки
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [viewingMedicalHistory, setViewingMedicalHistory] = useState<Animal | null>(null);

  // Стани для видалення (через окрему модалку)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Логіка видалення
  const handleConfirmDelete = (password: string) => {
    const passwordToMatch = currentUser?.password || '1234';
    if (password === passwordToMatch) {
      setAnimals(animals.filter(a => a.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setErrorMessage('');
    } else {
      setErrorMessage('Невірний пароль!');
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const animalData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      age: Number(formData.get('age')),
      ownerId: formData.get('ownerId') as string,
    };

    if (editingAnimal) {
      setAnimals(animals.map(a => a.id === editingAnimal.id ? { ...editingAnimal, ...animalData } : a));
    } else {
      setAnimals([...animals, { ...animalData, id: Date.now().toString() }]);
    }
    setIsFormOpen(false);
  };

  const filteredAnimals = animals
    .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.name < b.name ? (sortAsc ? -1 : 1) : (sortAsc ? 1 : -1)));

  return (
    <div style={{ width: '100%' }}>
      {/* ПАНЕЛЬ УПРАВЛІННЯ */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          placeholder="Пошук тварини за кличкою..."
          className="input-field"
          style={{ flex: 1, marginBottom: 0 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setSortAsc(!sortAsc)} className="btn btn-secondary" style={{ fontSize: '14px' }}>
          {sortAsc ? 'А-Я' : 'Я-А'}
        </button>
        <button onClick={() => { setEditingAnimal(null); setIsFormOpen(true); }} className="btn btn-primary" style={{ fontSize: '14px' }}>
          + Додати тварину
        </button>
      </div>

      {/* ТАБЛИЦЯ */}
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '30%' }}>Кличка</th>
            <th style={{ width: '20%' }}>Вид</th>
            <th style={{ width: '30%' }}>Власник</th>
            <th style={{ width: '20%', textAlign: 'right' }}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredAnimals.map((a) => (
            <tr
              key={a.id}
              className="clickable-row"
              onClick={() => { setEditingAnimal(a); setIsFormOpen(true); }}
            >
              <td style={{ fontWeight: 'bold' }}>🐾 {a.name}</td>
              <td>
                <span style={{
                  padding: '4px 8px', borderRadius: '6px', backgroundColor: '#eff6ff',
                  color: 'var(--primary)', fontSize: '12px', fontWeight: 'bold'
                }}>
                  {a.type}
                </span>
              </td>
              <td>{owners.find(o => o.id === a.ownerId)?.name || '—'}</td>
              <td style={{ textAlign: 'right' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(a.id); }}
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

      {/* МОДАЛЬНЕ ВІКНО: ФОРМА ТА ІСТОРІЯ ЛІКУВАННЯ */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
              {editingAnimal ? 'Редагувати профіль' : 'Реєстрація тварини'}
            </h3>
            <form onSubmit={handleSave}>
              <label className="input-label">Кличка</label>
              <input name="name" defaultValue={editingAnimal?.name} className="input-field" required />

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Вид</label>
                  <input name="type" defaultValue={editingAnimal?.type} className="input-field" required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Вік</label>
                  <input name="age" type="number" defaultValue={editingAnimal?.age} className="input-field" required />
                </div>
              </div>

              <label className="input-label">Власник</label>
              <select name="ownerId" defaultValue={editingAnimal?.ownerId} className="input-field" style={{ cursor: 'pointer' }} required>
                <option value="">Оберіть власника...</option>
                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Зберегти</button>
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Скасувати</button>
              </div>
            </form>

            {editingAnimal && (
               <button
                 onClick={() => { setIsFormOpen(false); setViewingMedicalHistory(editingAnimal); }}
                 className="btn btn-secondary"
                 style={{ width: '100%', marginTop: '10px', color: 'var(--primary)', border: '1px solid var(--primary)' }}
               >
                 📜 Переглянути історію лікування
               </button>
            )}
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО: МЕДКАРТКА */}
      {viewingMedicalHistory && (
        <div className="modal-overlay" onClick={() => setViewingMedicalHistory(null)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: 0 }}>📋 Медкарта: {viewingMedicalHistory.name}</h3>
            <p className="input-label" style={{ textTransform: 'none', marginTop: '5px' }}>
              Власник: {owners.find(o => o.id === viewingMedicalHistory.ownerId)?.name}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', maxHeight: '350px', overflowY: 'auto' }}>
              {medicalRecords.find(mr => mr.petId === viewingMedicalHistory.id)?.records.map((r, i) => (
                <div key={i} style={{ padding: '12px', backgroundColor: 'var(--bg-admin)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{r.date} — {r.diagnosis}</div>
                  <div style={{ marginTop: '5px' }}>
                    {r.treatments.map((t, ti) => (
                      <div key={ti} style={{ fontSize: '13px', color: 'var(--text-light)' }}>• {t.medicine || t.procedure}</div>
                    ))}
                  </div>
                  {r.notes && <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '5px' }}>{r.notes}</div>}
                </div>
              )) || <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Записів не знайдено</p>}
            </div>
            <button onClick={() => setViewingMedicalHistory(null)} className="btn btn-secondary" style={{ width: '100%', marginTop: '20px' }}>Закрити</button>
          </div>
        </div>
      )}

      {/* ОКРЕМА МОДАЛКА ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ */}
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
