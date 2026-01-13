import React, { useState } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface Record {
  id: number;
  petName: string;
  ownerName: string;
  vetName: string;
  date: string;
  reason: string;
  details: string;
  status: 'Заплановано' | 'Завершено' | 'Скасовано';
}

interface RecordsListProps {
  currentUser?: {
    name: string;
    role: 'admin' | 'vet';
    password?: string;
  };
}

export default function RecordsList({ currentUser }: RecordsListProps) {
  // Визначаємо ролі для зручності
  const isAdmin = currentUser?.role === 'admin';
  const isVet = currentUser?.role === 'vet';

  const [records, setRecords] = useState<Record[]>([
    {
      id: 1,
      petName: 'Бакс',
      ownerName: 'Іван Іванов',
      vetName: 'Д-р Коваль',
      date: '2024-05-20',
      reason: 'Щеплення',
      details: 'Перша вакцинація.',
      status: 'Заплановано',
    },
    {
      id: 2,
      petName: 'Мурка',
      ownerName: 'Ганна Сидорова',
      vetName: 'Д-р Петренко',
      date: '2024-05-19',
      reason: 'Огляд',
      details: 'Скарги на апетит.',
      status: 'Завершено',
    },
  ]);

  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortNewest, setSortNewest] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    const colors = {
      Завершено: { bg: '#dcfce7', text: '#166534' },
      Заплановано: { bg: '#fef3c7', text: '#92400e' },
      Скасовано: { bg: '#fee2e2', text: '#991b1b' },
    };
    const config =
      colors[status as keyof typeof colors] || colors['Заплановано'];
    return {
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: config.bg,
      color: config.text,
      display: 'inline-block',
    };
  };

  const filteredRecords = records
    .filter((r) => {
      const matchesSearch =
        r.petName.toLowerCase().includes(search.toLowerCase()) ||
        r.vetName.toLowerCase().includes(search.toLowerCase());
      const matchesDate = filterDate ? r.date === filterDate : true;
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortNewest ? dateB - dateA : dateA - dateB;
    });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const recordData = Object.fromEntries(formData.entries()) as any;

    if (selectedRecord) {
      // Ветеринар може змінити лише статус та деталі, інші поля беремо зі старого запису
      const updatedRecord = isVet
        ? {
            ...selectedRecord,
            status: recordData.status,
            details: recordData.details,
          }
        : { ...recordData, id: selectedRecord.id };

      setRecords(
        records.map((r) => (r.id === selectedRecord.id ? updatedRecord : r)),
      );
    } else {
      setRecords([...records, { ...recordData, id: Date.now() }]);
    }
    setIsAdding(false);
    setSelectedRecord(null);
  };

  const handleConfirmDelete = (password: string) => {
    const correctPassword = currentUser?.password || '1234';
    if (password === correctPassword) {
      setRecords(records.filter((r) => r.id !== selectedRecord?.id));
      setIsDeleteModalOpen(false);
      setSelectedRecord(null);
      setErrorMessage('');
    } else {
      setErrorMessage('Невірний пароль!');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          placeholder="Пошук за твариною або лікарем..."
          className="input-field"
          style={{ flex: 1, marginBottom: 0 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="input-field"
          style={{ width: '160px', marginBottom: 0 }}
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <button
          onClick={() => setSortNewest(!sortNewest)}
          className="btn btn-secondary"
          style={{ minWidth: '160px', fontSize: '14px' }}
        >
          {sortNewest ? '📅 Спочатку нові' : '📅 Спочатку старі'}
        </button>
        {/* Кнопка додавання доступна всім (або можна isAdmin) */}
        <button
          onClick={() => setIsAdding(true)}
          className="btn btn-primary"
          style={{ fontSize: '14px' }}
        >
          + Новий візит
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '15%' }}>Дата</th>
            <th style={{ width: '25%' }}>Тварина</th>
            <th style={{ width: '25%' }}>Лікар</th>
            <th style={{ width: '20%' }}>Статус</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((r) => (
            <tr
              key={r.id}
              className="clickable-row"
              onClick={() => setSelectedRecord(r)}
            >
              <td>{r.date}</td>
              <td style={{ fontWeight: '600' }}>🐾 {r.petName}</td>
              <td>{r.vetName}</td>
              <td>
                <span style={getStatusBadgeStyle(r.status)}>{r.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(isAdding || selectedRecord) && (
        <div
          className="modal-overlay"
          onClick={() => {
            setIsAdding(false);
            setSelectedRecord(null);
          }}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
              {selectedRecord ? 'Деталі візиту' : 'Новий візит'}
            </h3>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Тварина</label>
                  <input
                    name="petName"
                    defaultValue={selectedRecord?.petName}
                    className="input-field"
                    required
                    readOnly={isVet && !!selectedRecord}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Власник</label>
                  <input
                    name="ownerName"
                    defaultValue={selectedRecord?.ownerName}
                    className="input-field"
                    required
                    readOnly={isVet && !!selectedRecord}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Дата</label>
                  <input
                    name="date"
                    type="date"
                    defaultValue={selectedRecord?.date}
                    className="input-field"
                    required
                    readOnly={isVet && !!selectedRecord}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Статус</label>
                  <select
                    name="status"
                    defaultValue={selectedRecord?.status || 'Заплановано'}
                    className="input-field"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Заплановано">Заплановано</option>
                    <option value="Завершено">Завершено</option>
                    <option value="Скасовано">Скасовано</option>
                  </select>
                </div>
              </div>

              <label className="input-label">Лікар</label>
              <input
                name="vetName"
                defaultValue={selectedRecord?.vetName}
                className="input-field"
                required
                readOnly={isVet && !!selectedRecord}
              />

              <label className="input-label">Причина візиту</label>
              <input
                name="reason"
                defaultValue={selectedRecord?.reason}
                className="input-field"
                required
                readOnly={isVet && !!selectedRecord}
              />

              <label className="input-label">Деталі прийому</label>
              <textarea
                name="details"
                defaultValue={selectedRecord?.details}
                className="input-field"
                style={{ height: '80px', resize: 'none' }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Зберегти зміни
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setSelectedRecord(null);
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Закрити
                </button>
              </div>

              {/* Видалення тільки для Адміна */}
              {selectedRecord && isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="btn"
                  style={{
                    background: 'none',
                    color: 'var(--danger)',
                    fontSize: '12px',
                    padding: '4px 8px',
                    width: '100%',
                    marginTop: '10px',
                  }}
                >
                  Видалити цей запис
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
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
