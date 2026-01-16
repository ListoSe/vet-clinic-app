import React, { useState, useEffect } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface Owner {
  id: string;
  name: string;
}
interface Animal {
  id: string;
  name: string;
  type: string;
  age: number;
  ownerId: string;
}

interface Treatment {
  medicine?: string;
  dose?: string;
  duration?: string;
  procedure?: string;
}
interface MedicalRecordEntry {
  date: string;
  vetId?: string;
  diagnosis: string;
  treatments: Treatment[];
  notes?: string;
}
interface MedicalRecord {
  petId: string;
  records: MedicalRecordEntry[];
}

interface AnimalListProps {
  currentUser?: {
    id?: string;
    name: string;
    password?: string;
    role: 'admin' | 'vet';
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
  const isAdmin = currentUser?.role === 'admin';
  const isVet = currentUser?.role === 'vet';

  const [owners] = useState<Owner[]>([
    { id: '1', name: 'Петро Петренко' },
    { id: '2', name: 'Олена Іванова' },
  ]);

  const [animals, setAnimals] = useState<Animal[]>([
    {
      id: '69358759b020d08204570be7',
      name: 'Софискус',
      type: 'Кіт',
      age: 3,
      ownerId: '1',
    },
    { id: '2', name: 'Бобик', type: 'Собака', age: 5, ownerId: '2' },
  ]);

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([
    {
      petId: '69358759b020d08204570be7',
      records: [
        {
          date: '2025-12-07T10:00:00Z',
          vetId: '693584f4b020d08204570bd8',
          diagnosis: 'Гострий риніт',
          treatments: [
            { medicine: 'Антибіотик', dose: '2 мл', duration: '5 днів' },
            { procedure: 'Промивання носа' },
          ],
          notes: 'Тварина в хорошому стані',
        },
      ],
    },
  ]);

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
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedType, setSelectedType] = useState('');
  const [isCustomType, setIsCustomType] = useState(false);

  // --- СТАН ДЛЯ ДИНАМІЧНИХ ПОЛІВ (З DURATION) ---
  const [dynamicTreatments, setDynamicTreatments] = useState<Treatment[]>([
    { medicine: '', dose: '', duration: '' },
  ]);

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

  // Обновляем состояние при открытии формы редактирования
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

  // --- ХЕНДЛЕРИ ---
  const handleConfirmDelete = (password: string) => {
    const passwordToMatch = currentUser?.password || '1234';
    if (password === passwordToMatch) {
      setAnimals(animals.filter((a) => a.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setErrorMessage('');
    } else {
      setErrorMessage('Невірний пароль!');
    }
  };

  const handleSaveAnimal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) return;
    const formData = new FormData(e.currentTarget);
    const animalData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      age: Number(formData.get('age')),
      ownerId: formData.get('ownerId') as string,
    };

    if (editingAnimal) {
      setAnimals(
        animals.map((a) =>
          a.id === editingAnimal.id ? { ...editingAnimal, ...animalData } : a,
        ),
      );
    } else {
      setAnimals([...animals, { ...animalData, id: Date.now().toString() }]);
    }
    setIsFormOpen(false);
  };

  const handleSaveMedicalEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!viewingMedicalHistory) return;
    const formData = new FormData(e.currentTarget);

    const entry: MedicalRecordEntry = {
      date:
        editingRecordIndex !== null
          ? medicalRecords.find((mr) => mr.petId === viewingMedicalHistory.id)!
              .records[editingRecordIndex].date
          : new Date().toISOString(),
      vetId: currentUser?.id || 'unknown',
      diagnosis: formData.get('diagnosis') as string,
      treatments: dynamicTreatments.filter((t) => t.medicine || t.procedure),
      notes: formData.get('notes') as string,
    };

    setMedicalRecords((prev) => {
      const petRecord = prev.find(
        (mr) => mr.petId === viewingMedicalHistory.id,
      );
      if (petRecord) {
        const newRecords = [...petRecord.records];
        if (editingRecordIndex !== null) newRecords[editingRecordIndex] = entry;
        else newRecords.unshift(entry);
        return prev.map((mr) =>
          mr.petId === viewingMedicalHistory.id
            ? { ...mr, records: newRecords }
            : mr,
        );
      }
      return [...prev, { petId: viewingMedicalHistory.id, records: [entry] }];
    });
    setIsAddingNote(false);
    setEditingRecordIndex(null);
  };

  const deleteMedicalRecord = (index: number) => {
    if (!viewingMedicalHistory) return;
    setMedicalRecords((prev) =>
      prev.map((mr) =>
        mr.petId === viewingMedicalHistory.id
          ? { ...mr, records: mr.records.filter((_, idx) => idx !== index) }
          : mr,
      ),
    );
    setRecordToDelete(null);
  };

  const filteredAnimals = animals
    .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.name < b.name ? (sortAsc ? -1 : 1) : sortAsc ? 1 : -1));

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
                {/* Якщо тип є у словнику — виводимо його емодзі, інакше стандартну лапку */}
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
                      value={selectedType}
                      disabled={!isAdmin}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setIsCustomType(true);
                          setSelectedType('');
                        } else {
                          setSelectedType(e.target.value);
                        }
                      }}
                      // Используем скрытый input для передачи значения в FormData при submit
                    >
                      <option value="">Выберите вид...</option>
                      {Object.keys(emojiMap).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                      <option
                        value="custom"
                        style={{ fontWeight: 'bold', color: 'var(--primary)' }}
                      >
                        + Свой вариант...
                      </option>
                    </select>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input
                        className="input-field"
                        placeholder="Введите вид..."
                        value={selectedType}
                        autoFocus
                        onChange={(e) => setSelectedType(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomType(false)}
                        style={{
                          position: 'absolute',
                          right: '5px',
                          top: '5px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '10px',
                        }}
                      >
                        ↩ назад
                      </button>
                    </div>
                  )}
                  {/* Скрытый инпут, который реально отправляет данные в форму */}
                  <input type="hidden" name="type" value={selectedType} />
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
                          onClick={() => deleteMedicalRecord(i)}
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
