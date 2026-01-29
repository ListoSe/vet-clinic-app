import React, { useState, useEffect, useCallback } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import api from '../api/api';

interface Record {
  id: string | number;
  petId: string;
  userId: string;
  visitDate: string;
  reason: string;
  visitDetails: string;
  status: 'NEW' | 'COMPLETED' | 'CANCELLED';
  pet?: { name: string };
  user?: { name: string };
}

interface RecordsListProps {
  currentUser?: {
    name: string;
    roles: string[];
    password?: string;
  };
}
const STATUS_LABELS: { [key: string]: string } = {
  NEW: 'Заплановано',
  COMPLETED: 'Завершено',
  CANCELLED: 'Скасовано',
};

export default function RecordsList({ currentUser }: RecordsListProps) {
  // Визначаємо ролі для зручності
  const isAdmin = currentUser?.roles.includes('ADMIN');
  const isVet = currentUser?.roles.includes('VET');

  const [records, setRecords] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [availablePets, setAvailablePets] = useState<any[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [selectedPetId, setSelectedPetId] = useState<string>('');

  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortNewest, setSortNewest] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorLoadMessage, setErrorLoadMessage] = useState('');

  const loadData = useCallback(async () => {
    setErrorLoadMessage('');
    try {
      const [recsRes, ownersRes, usersRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/owners'),
        api.get('/users'),
      ]);

      setRecords(recsRes.data);
      setOwners(ownersRes.data);
      setVets(usersRes.data.filter((u: any) => u.roles.includes('VET')));
    } catch {
      setErrorLoadMessage('Помилка завантаження');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedRecord) {
      const { ownerId } = (selectedRecord.pet as any) || {};
      if (ownerId) setSelectedOwnerId(ownerId);
      setSelectedPetId(selectedRecord.petId || '');
    } else {
      setSelectedOwnerId('');
      setSelectedPetId('');
    }
  }, [selectedRecord]);

  useEffect(() => {
    if (selectedOwnerId) {
      api
        .get(`/pets?ownerId=${selectedOwnerId}`)
        .then((res) => setAvailablePets(res.data))
        .catch(() => {
          setErrorMessage('Помилка завантаження тварин:');
          setAvailablePets([]);
        });
    } else {
      setAvailablePets([]);
    }
  }, [selectedOwnerId]);

  const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    const colors = {
      COMPLETED: { bg: '#dcfce7', text: '#166534' },
      NEW: { bg: '#fef3c7', text: '#92400e' },
      CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
      DEFAULT: { bg: '#f3f4f6', text: '#374151' },
    };
    const config = colors[status as keyof typeof colors] || colors.DEFAULT;
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
      if (!isAdmin && isVet) {
        if (r.userId !== (currentUser as any)?.id) return false;
      }
      const matchesSearch =
        (r.pet?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.reason || '').toLowerCase().includes(search.toLowerCase());

      const matchesDate = filterDate
        ? r.visitDate?.split('T')[0] === filterDate
        : true;
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.visitDate || 0).getTime();
      const dateB = new Date(b.visitDate || 0).getTime();
      return sortNewest ? dateB - dateA : dateA - dateB;
    });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    const formData = new FormData(e.currentTarget);
    const appointmentData = {
      status: formData.get('status') || 'NEW',
      type: 'CONSULTATION',
      userId: formData.get('userId') as string,
      petId: formData.get('petId') as string,
      visitDate: new Date(formData.get('visitDate') as string).toISOString(),
      reason: formData.get('reason') as string,
      visitDetails: formData.get('visitDetails') as string,
    };

    try {
      if (selectedRecord) {
        await api.patch(`/appointments/${selectedRecord.id}`, appointmentData);
      } else {
        await api.post('/appointments', appointmentData);
      }
      setIsAdding(false);
      setSelectedRecord(null);
      loadData();
    } catch {
      setErrorMessage('Помилка при збереженні');
    }
  };

  const handleConfirmDelete = async (password: string) => {
    setErrorMessage('');
    const savedPassword =
      localStorage.getItem('temp_pc') || sessionStorage.getItem('temp_pc');
    if (!savedPassword || password !== savedPassword) {
      setErrorMessage('Невірний пароль користувача! Спробуйте ще раз.');
      return;
    }
    try {
      if (selectedRecord?.id) {
        await api.delete(`/appointments/${selectedRecord.id}`);
        setIsDeleteModalOpen(false);
        setSelectedRecord(null);
        setErrorMessage('');

        loadData();
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Помилка видалення. Перевірте пароль.',
      );
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
        <button
          onClick={() => {
            setErrorMessage('');
            setSelectedOwnerId('');
            setSelectedPetId('');
            setIsAdding(true);
            setSelectedRecord(null);
          }}
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
          {errorLoadMessage && (
            <tr>
              <td colSpan={4}>
                <div className="error-banner">{errorLoadMessage}</div>
              </td>
            </tr>
          )}
          {filteredRecords.map((r) => (
            <tr
              key={r.id}
              className="clickable-row"
              onClick={() => {
                setErrorMessage('');
                setSelectedRecord(r);
                setSelectedPetId(r.petId || '');
              }}
            >
              <td>
                {r.visitDate
                  ? new Date(r.visitDate).toLocaleString('uk-UA', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </td>
              <td style={{ fontWeight: '600' }}>🐾 {r.pet?.name}</td>
              <td>{r.user?.name}</td>
              <td>
                <span style={getStatusBadgeStyle(r.status)}>
                  {STATUS_LABELS[r.status] || r.status}
                </span>
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
            setSelectedPetId('');
            setErrorMessage('');
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
                  <label className="input-label">Власник</label>
                  <select
                    name="ownerId"
                    className="input-field"
                    required
                    value={selectedOwnerId}
                    onChange={(e) => setSelectedOwnerId(e.target.value)}
                    disabled={isVet && !!selectedRecord}
                  >
                    <option value="">Оберіть власника</option>
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} {o.surname}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Тварина</label>
                  <select
                    name="petId"
                    className="input-field"
                    required
                    disabled={!selectedOwnerId}
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                  >
                    <option value="">
                      {selectedOwnerId
                        ? 'Оберіть тварину'
                        : 'Спочатку оберіть власника'}
                    </option>
                    {availablePets
                      .filter(
                        (p) => String(p.ownerId) === String(selectedOwnerId),
                      )
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Дата</label>
                  <input
                    name="visitDate"
                    type="datetime-local"
                    defaultValue={
                      selectedRecord?.visitDate
                        ? (() => {
                            const d = new Date(selectedRecord.visitDate);
                            d.setMinutes(
                              d.getMinutes() - d.getTimezoneOffset(),
                            );
                            return d.toISOString().slice(0, 16);
                          })()
                        : ''
                    }
                    className="input-field"
                    required
                    min={
                      !selectedRecord
                        ? `${new Date().toISOString().split('T')[0]}T00:00`
                        : undefined
                    }
                    step="1800"
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
                    <option value="NEW">Заплановано</option>
                    <option value="COMPLETED">Завершено</option>
                    <option value="CANCELLED">Скасовано</option>
                  </select>
                </div>
              </div>

              <label className="input-label">Лікар</label>
              <select
                name="userId"
                className="input-field"
                required
                defaultValue={selectedRecord?.userId}
                disabled={isVet && !!selectedRecord}
              >
                <option value="">Оберіть лікаря</option>
                {vets.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>

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
                name="visitDetails"
                defaultValue={selectedRecord?.visitDetails}
                className="input-field"
                style={{ height: '80px', resize: 'none' }}
              />
              {errorMessage && !isDeleteModalOpen && (
                <div className="error-banner">{errorMessage}</div>
              )}
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
                    setErrorMessage('');
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Закрити
                </button>
              </div>

              {selectedRecord && isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setIsDeleteModalOpen(true);
                  }}
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
