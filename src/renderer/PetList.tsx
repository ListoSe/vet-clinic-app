import React, { useState, useEffect, useCallback } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import api from '../api/api';

// --- ІНТЕРФЕЙСИ ---
interface Owner {
  id: string;
  name: string;
}
interface Treatment {
  medicine?: string;
  dose?: string;
  duration?: string;
  procedure?: string;
}
interface MedicalRecordEntry {
  id?: string;
  date: string;
  vetId?: string;
  diagnosis: string;
  treatments: Treatment[];
  notes?: string;
}
interface MedicalRecord {
  id: string;
  petId: string;
  records: MedicalRecordEntry[];
}
interface Animal {
  id: string;
  name: string;
  type: string;
  age: number;
  ownerId: string;
  medicalRecords?: {
    id: string;
    petId: string;
    records: MedicalRecordEntry[];
  };
}

interface AnimalListProps {
  currentUser?: {
    id?: string;
    name: string;
    roles: string[];
  };
}

const emojiMap: { [key: string]: string } = {
  Кіт: '🐈',
  Собака: '🐕',
  Папуга: '🦜',
  'Хом’як': '🐹',
  Рибка: '🐟',
};

export default function AnimalList({ currentUser }: AnimalListProps) {
  const isAdmin = currentUser?.roles?.includes('ADMIN');
  const isVet = currentUser?.roles?.includes('VET');

  // Данні з серверу
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  // Стан інтерфейсу
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [viewingMedicalHistory, setViewingMedicalHistory] =
    useState<Animal | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingRecordIndex, setEditingRecordIndex] = useState<number | null>(
    null,
  );
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [entryToDeleteIndex, setEntryToDeleteIndex] = useState<number | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState('');

  // Стан форми
  const [selectedType, setSelectedType] = useState('');
  const [isCustomType, setIsCustomType] = useState(false);
  const [dynamicTreatments, setDynamicTreatments] = useState<Treatment[]>([
    { medicine: '', dose: '', duration: '' },
  ]);

  const loadData = useCallback(async () => {
    try {
      const [petsRes, ownersRes, recordsRes] = await Promise.all([
        api.get('/pets'),
        api.get('/owners'),
        api.get('/medical-records'),
      ]);
      setAnimals(petsRes.data);
      setOwners(ownersRes.data); // ??? не так как в OwnersList
      setMedicalRecords(recordsRes.data);
    } catch (err) {
      console.error('Помилка завантаження:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ефекти для форми
  useEffect(() => {
    if (editingRecordIndex !== null && viewingMedicalHistory) {
      const recs = medicalRecords.find(
        (mr) => mr.petId === viewingMedicalHistory.id,
      )?.records;
      if (recs && recs[editingRecordIndex]) {
        setDynamicTreatments(recs[editingRecordIndex].treatments);
      }
    } else {
      setDynamicTreatments([{ medicine: '', dose: '', duration: '' }]);
    }
  }, [editingRecordIndex, isAddingNote, viewingMedicalHistory, medicalRecords]);

  useEffect(() => {
    if (editingAnimal) {
      const typeExists = Object.keys(emojiMap).includes(editingAnimal.type);
      setSelectedType(editingAnimal.type);
      setIsCustomType(!typeExists);
    } else {
      setSelectedType('');
      setIsCustomType(false);
    }
  }, [editingAnimal, isFormOpen]);

  // --- ХЕНДЛЕРИ ПОЛІВ ЛІКУВАННЯ ---
  const addTreatmentField = () =>
    setDynamicTreatments([
      ...dynamicTreatments,
      { medicine: '', dose: '', duration: '' },
    ]);

  const updateTreatmentField = (
    idx: number,
    field: keyof Treatment,
    val: string,
  ) => {
    const updated = [...dynamicTreatments];
    updated[idx] = { ...updated[idx], [field]: val };
    setDynamicTreatments(updated);
  };

  const removeTreatmentField = (idx: number) => {
    if (dynamicTreatments.length > 1) {
      setDynamicTreatments(dynamicTreatments.filter((_, i) => i !== idx));
    }
  };

  // --- API ХЕНДЛЕРИ (ОСНОВНА ЛОГІКА) ---

  const handleSaveMedicalEntry = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!viewingMedicalHistory) return;

    const formData = new FormData(e.currentTarget);
    try {
      const currentRecordObj = medicalRecords.find(
        (mr) => mr.petId === viewingMedicalHistory.id,
      );
      let recordId = currentRecordObj?.id;

      if (!recordId) {
        try {
          const newRecordRes = await api.post('/medical-records', {
            petId: viewingMedicalHistory.id,
          });
          recordId = newRecordRes.data.id;
        } catch {
          setErrorMessage('Не вдалося створити медичну карту для тварини');
          return;
        }
      }

      const records = currentRecordObj?.records || [];
      const entryPayload = {
        date:
          editingRecordIndex !== null && records[editingRecordIndex]
            ? records[editingRecordIndex].date
            : new Date().toISOString(),
        diagnosis: formData.get('diagnosis') as string,
        notes: (formData.get('notes') as string) || undefined,
        treatments: dynamicTreatments
          .filter((t) => t.medicine || t.procedure)
          .map((t) => ({
            type: t.procedure ? 'PROCEDURE' : 'MEDICINE',
            medicine: t.medicine || undefined,
            dose: t.dose || undefined,
            duration: t.duration || undefined,
            procedure: t.procedure || undefined,
          })),
      };

      if (editingRecordIndex !== null && records[editingRecordIndex]) {
        const entryId = records[editingRecordIndex].id;
        await api.patch(
          `/medical-records/${recordId}/entries/${entryId}`,
          entryPayload,
        );
      } else {
        await api.post(`/medical-records/${recordId}/entries`, entryPayload);
      }

      setIsAddingNote(false);
      setEditingRecordIndex(null);
      setErrorMessage('');
      await loadData();
    } catch (err: any) {
      console.error('Save error:', err.response?.data || err);
      setErrorMessage(err.response?.data?.message || 'Помилка збереження');
    }
  };

  const handleSaveAnimal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) return;

    const formData = new FormData(e.currentTarget);
    const rawType = formData.get('type') as string;
    const typeValue = rawType ? rawType.trim() : '';

    if (!typeValue || typeValue === 'custom') {
      setErrorMessage(
        'Будь ласка, вкажіть коректний вид тварини (наприклад, Кіт або Собака)',
      );
      return;
    }

    const animalData = {
      name: (formData.get('name') as string).trim(),
      type: typeValue,
      age: Number(formData.get('age')),
      ownerId: formData.get('ownerId') as string,
    };

    try {
      if (editingAnimal) {
        await api.patch(`/pets/${editingAnimal.id}`, animalData);
      } else {
        await api.post('/pets', animalData);
      }
      setErrorMessage('');
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Помилка збереження даних тварини',
      );
    }
  };

  const handleConfirmDelete = async (password: string) => {
    try {
      // ЛОГІКА ДЛЯ ВИДАЛЕННЯ МЕДИЧНОГО ЗАПИСУ
      if (entryToDeleteIndex !== null && viewingMedicalHistory) {
        const currentPetRecords = medicalRecords.find(
          (mr) => mr.petId === viewingMedicalHistory.id,
        );

        if (currentPetRecords) {
          const recordId = currentPetRecords.id;
          const entryId = currentPetRecords.records[entryToDeleteIndex].id;

          await api.delete(`/medical-records/${recordId}/entries/${entryId}`, {
            data: { password },
          });

          if (currentPetRecords.records.length === 1) {
            await api.delete(`/medical-records/${recordId}`, {
              data: { password },
            });
          }
        }
        setEntryToDeleteIndex(null);
      }

      // ЛОГІКА ДЛЯ ВИДАЛЕННЯ ТВАРИНИ
      else if (deleteConfirmId) {
        await api.delete(`/pets/${deleteConfirmId}`, {
          data: { password },
        });
        setDeleteConfirmId(null);
      }

      setRecordToDelete(null);
      setErrorMessage('');
      await loadData();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Помилка видалення. Перевірте пароль.',
      );
    }
  };

  const filteredAnimals = animals
    .filter((a) => (a.name || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      (a.name || '').toLowerCase() < (b.name || '').toLowerCase()
        ? sortAsc
          ? -1
          : 1
        : sortAsc
          ? 1
          : -1,
    );

  return (
    <div className="list-container">
      {/* ПАНЕЛЬ ПОШУКУ */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          placeholder="Пошук тварини за кличкою..."
          className="input-field"
          style={{ flex: 1, marginBottom: 0 }}
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
              setEditingAnimal(null);
              setIsFormOpen(true);
            }}
            className="btn btn-primary"
          >
            + Додати тварину
          </button>
        )}
      </div>

      {/* ТАБЛИЦЯ */}
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '30%' }}>Кличка</th>
            <th style={{ width: '20%' }}>Вид</th>
            <th style={{ width: '30%' }}>Власник</th>
            {isAdmin && (
              <th style={{ width: '20%', textAlign: 'right' }}>Дії</th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredAnimals.map((a) => (
            <tr
              key={a.id}
              className="clickable-row"
              onClick={() => {
                setEditingAnimal(a);
                setIsFormOpen(true);
              }}
            >
              <td style={{ fontWeight: 'bold' }}>
                {emojiMap[a.type] || '🐾'} {a.name}
              </td>
              <td>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#eff6ff',
                    color: 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {a.type}
                </span>
              </td>
              <td>{owners.find((o) => o.id === a.ownerId)?.name || '—'}</td>
              {isAdmin && (
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(a.id);
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

      {/* МОДАЛКА ПРОФІЛЮ */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
              {!isAdmin
                ? 'Картка пацієнта'
                : editingAnimal
                  ? 'Редагувати профіль'
                  : 'Реєстрація тварини'}
            </h3>
            <form onSubmit={handleSaveAnimal}>
              <label className="input-label">Кличка</label>
              <input
                name="name"
                defaultValue={editingAnimal?.name}
                className="input-field"
                required
                readOnly={!isAdmin}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Вид</label>
                  {!isCustomType ? (
                    <select
                      className="input-field"
                      name="type"
                      value={selectedType}
                      required
                      disabled={!isAdmin}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setIsCustomType(true);
                          setSelectedType('');
                        } else {
                          setSelectedType(e.target.value);
                        }
                      }}
                    >
                      <option value="">Оберіть вид...</option>
                      {Object.keys(emojiMap).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                      <option
                        value="custom"
                        style={{ fontWeight: 'bold', color: 'var(--primary)' }}
                      >
                        + Свій варіант...
                      </option>
                    </select>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input
                        className="input-field"
                        name="type"
                        placeholder="Введіть вид..."
                        value={selectedType}
                        autoFocus
                        required
                        disabled={!isAdmin}
                        onChange={(e) => setSelectedType(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomType(false);
                          setSelectedType('');
                        }}
                        style={{
                          position: 'absolute',
                          right: '5px',
                          top: '5px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        ↩
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Вік</label>
                  <input
                    name="age"
                    type="number"
                    defaultValue={editingAnimal?.age}
                    className="input-field"
                    required
                    readOnly={!isAdmin}
                  />
                </div>
              </div>
              <label className="input-label">Власник</label>
              <select
                name="ownerId"
                defaultValue={editingAnimal?.ownerId}
                className="input-field"
                disabled={!isAdmin}
                required
              >
                <option value="">Оберіть власника...</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
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
                  onClick={() => setIsFormOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  {isAdmin ? 'Скасувати' : 'Закрити'}
                </button>
              </div>
            </form>
            {editingAnimal && (
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setViewingMedicalHistory(editingAnimal);
                }}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  marginTop: '10px',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary)',
                }}
              >
                📜 Переглянути історію лікування
              </button>
            )}
          </div>
        </div>
      )}

      {/* МОДАЛКА МЕДКАРТКИ */}
      {viewingMedicalHistory && (
        <div
          className="modal-overlay"
          onClick={() => {
            setViewingMedicalHistory(null);
            setIsAddingNote(false);
            setEditingRecordIndex(null);
            setRecordToDelete(null);
          }}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '550px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
              }}
            >
              <h3 style={{ margin: 0 }}>
                📋 Медкарта: {viewingMedicalHistory.name}
              </h3>
              {isVet && !isAddingNote && (
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="btn btn-primary"
                >
                  + Додати запис
                </button>
              )}
            </div>

            {isAddingNote && (
              <form
                onSubmit={handleSaveMedicalEntry}
                style={{
                  marginBottom: '20px',
                  padding: '15px',
                  border: '1px solid var(--primary)',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                  {editingRecordIndex !== null
                    ? '✏️ Редагувати запис'
                    : '🆕 Новий запис'}
                </div>

                <label className="input-label">Діагноз</label>
                <input
                  name="diagnosis"
                  defaultValue={
                    editingRecordIndex !== null
                      ? medicalRecords.find(
                          (mr) => mr.petId === viewingMedicalHistory.id,
                        )?.records[editingRecordIndex].diagnosis
                      : ''
                  }
                  className="input-field"
                  required
                />

                <label className="input-label">
                  Лікування (Препарат/Процедура | Доза | Тривалість)
                </label>
                {dynamicTreatments.map((t, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      placeholder="Препарат/Процедура"
                      value={t.medicine || t.procedure || ''}
                      onChange={(e) =>
                        updateTreatmentField(idx, 'medicine', e.target.value)
                      }
                      className="input-field"
                      style={{ flex: 2, marginBottom: 0 }}
                      required
                    />
                    <input
                      placeholder="Доза"
                      value={t.dose || ''}
                      onChange={(e) =>
                        updateTreatmentField(idx, 'dose', e.target.value)
                      }
                      className="input-field"
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    <input
                      placeholder="Час"
                      value={t.duration || ''}
                      onChange={(e) =>
                        updateTreatmentField(idx, 'duration', e.target.value)
                      }
                      className="input-field"
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    {dynamicTreatments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTreatmentField(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--danger)',
                          fontSize: '18px',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTreatmentField}
                  className="btn"
                  style={{
                    width: '100%',
                    marginBottom: '15px',
                    fontSize: '11px',
                    padding: '6px',
                    border: '1px dashed var(--primary)',
                    color: 'var(--primary)',
                  }}
                >
                  + Додати ще препарат/процедуру
                </button>

                <label className="input-label">Нотатки</label>
                <textarea
                  name="notes"
                  defaultValue={
                    editingRecordIndex !== null
                      ? medicalRecords.find(
                          (mr) => mr.petId === viewingMedicalHistory.id,
                        )?.records[editingRecordIndex].notes
                      : ''
                  }
                  className="input-field"
                  style={{ height: '60px', resize: 'none' }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Зберегти
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNote(false);
                      setEditingRecordIndex(null);
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '400px',
                overflowY: 'auto',
                paddingRight: '5px',
              }}
            >
              {medicalRecords
                .find((mr) => mr.petId === viewingMedicalHistory.id)
                ?.records.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      borderLeft: '4px solid var(--primary)',
                      position: 'relative',
                    }}
                  >
                    {recordToDelete === i ? (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          zIndex: 10,
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                          Видалити запис?
                        </span>
                        <button
                          onClick={() => setEntryToDeleteIndex(i)}
                          className="btn"
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: 'var(--danger)',
                            color: 'white',
                          }}
                        >
                          Так
                        </button>
                        <button
                          onClick={() => setRecordToDelete(null)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          Ні
                        </button>
                      </div>
                    ) : (
                      isVet && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            display: 'flex',
                            gap: '10px',
                          }}
                        >
                          <button
                            onClick={() => {
                              setEditingRecordIndex(i);
                              setIsAddingNote(true);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setRecordToDelete(i)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      )
                    )}

                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {new Date(r.date).toLocaleDateString()}{' '}
                      {new Date(r.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div
                      style={{
                        fontWeight: 'bold',
                        fontSize: '14px',
                        marginBottom: '5px',
                      }}
                    >
                      {r.diagnosis}
                    </div>

                    <div style={{ marginTop: '5px' }}>
                      {r.treatments.map((t, ti) => (
                        <div
                          key={ti}
                          style={{
                            fontSize: '13px',
                            color: '#334155',
                            backgroundColor: '#fff',
                            margin: '2px 0',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          • <b>{t.medicine || t.procedure}</b>
                          {t.dose && ` — ${t.dose}`}
                          {t.duration && (
                            <span
                              style={{
                                color: 'var(--primary)',
                                marginLeft: '5px',
                              }}
                            >
                              ({t.duration})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {r.notes && (
                      <div
                        style={{
                          fontSize: '12px',
                          fontStyle: 'italic',
                          marginTop: '8px',
                          borderTop: '1px solid #e2e8f0',
                          paddingTop: '5px',
                          color: '#444',
                        }}
                      >
                        {r.notes}
                      </div>
                    )}
                  </div>
                )) || (
                <p
                  style={{
                    textAlign: 'center',
                    color: '#64748b',
                    margin: '20px 0',
                  }}
                >
                  Записів не знайдено
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setViewingMedicalHistory(null);
                setIsAddingNote(false);
                setEditingRecordIndex(null);
                setRecordToDelete(null);
              }}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '20px' }}
            >
              Закрити
            </button>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteConfirmId || entryToDeleteIndex !== null}
        onClose={() => {
          setDeleteConfirmId(null);
          setEntryToDeleteIndex(null);
          setErrorMessage('');
        }}
        onConfirm={handleConfirmDelete}
        userName={currentUser?.name}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
}
