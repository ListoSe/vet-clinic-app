import React, { useState, useEffect, useCallback } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import api from '../api/api';

interface FinanceRecord {
  id: number;
  date: string;
  clientName: string;
  service: string;
  amount: number;
  status: 'Оплачено' | 'Очікує' | 'Борг';
}

interface FinanceListProps {
  currentUser?: any;
}
const STATUS_LABELS: { [key: string]: string } = {
  PAID: 'Оплачено',
  PENDING: 'Очікує',
  DEBT: 'Борг',
};

export default function FinanceList({ currentUser }: FinanceListProps) {
  const [finances, setFinances] = useState<FinanceRecord[]>([]);

  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortNewest, setSortNewest] = useState(true);
  const [selectedFinance, setSelectedFinance] = useState<FinanceRecord | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorLoadMessage, setErrorLoadMessage] = useState('');

  const loadData = useCallback(async () => {
    setErrorLoadMessage('');
    try {
      const response = await api.get('/appointments');

      const mappedData: FinanceRecord[] = response.data.map((app: any) => ({
        id: app.id,
        date: new Date(app.visitDate).toISOString().split('T')[0],
        clientName: app.pet?.owner?.name || 'Невідомий клієнт',
        service: app.reason,
        amount: app.amount || 0,
        status: app.paymentStatus || 'PENDING',
      }));

      setFinances(mappedData);
    } catch {
      setErrorLoadMessage('Помилка завантаження');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredFinances = finances
    .filter((f) => {
      const matchesSearch =
        f.clientName.toLowerCase().includes(search.toLowerCase()) ||
        f.service.toLowerCase().includes(search.toLowerCase());
      const matchesDate = filterDate
        ? f.date.split('T')[0] === filterDate
        : true;
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortNewest ? dateB - dateA : dateA - dateB;
    });

  const totalAmount = filteredFinances.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    const colors = {
      PAID: { bg: '#dcfce7', text: '#166534' },
      PENDING: { bg: '#fef3c7', text: '#92400e' },
      DEBT: { bg: '#fee2e2', text: '#991b1b' },
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFinance) return;
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const updateData = {
      amount: Number(formData.get('amount')),
      paymentStatus: formData.get('status'),
      visitDate: new Date(formData.get('date') as string).toISOString(),
    };

    try {
      await api.patch(`/appointments/${selectedFinance.id}`, updateData);
      setSelectedFinance(null);
      loadData();
    } catch {
      setErrorMessage('Помилка при оновленні даних');
    }
  };

  const handleConfirmDelete = async (password: string) => {
    try {
      if (selectedFinance?.id) {
        await api.delete(`/appointments/${selectedFinance.id}`, {
          data: { password },
        });
        setIsDeleteModalOpen(false);
        setSelectedFinance(null);
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
      {/* ПАНЕЛЬ КЕРУВАННЯ */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          alignItems: 'center',
        }}
      >
        <input
          placeholder="Пошук клієнта або послуги..."
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

        <div
          style={{
            padding: '10px 15px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 'bold',
            minWidth: '130px',
            textAlign: 'center',
          }}
        >
          Разом: {totalAmount} ₴
        </div>
      </div>

      {/* ТАБЛИЦЯ */}
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '15%' }}>Дата</th>
            <th style={{ width: '30%' }}>Клієнт</th>
            <th style={{ width: '25%' }}>Послуга</th>
            <th style={{ width: '15%' }}>Сума</th>
            <th style={{ width: '15%' }}>Статус</th>
          </tr>
        </thead>
        <tbody>
          {errorLoadMessage && (
            <tr>
              <td colSpan={5}>
                <div className="error-banner">{errorLoadMessage}</div>
              </td>
            </tr>
          )}
          {filteredFinances.map((f) => {
            return (
              <tr
                key={f.id}
                className="clickable-row"
                onClick={() => {
                  setErrorMessage('');
                  setSelectedFinance(f);
                }}
              >
                <td>{f.date ? new Date(f.date).toLocaleDateString() : '—'}</td>
                <td style={{ fontWeight: '600' }}>👤 {f.clientName}</td>
                <td>{f.service}</td>
                <td style={{ fontWeight: 'bold' }}>{f.amount} грн</td>
                <td>
                  <span style={getStatusBadgeStyle(f.status)}>
                    {STATUS_LABELS[f.status] || f.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* МОДАЛКА РЕДАГУВАННЯ */}
      {selectedFinance && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSelectedFinance(null);
            setErrorMessage('');
          }}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '400px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
              Деталі транзакції
            </h3>
            <form onSubmit={handleSave}>
              <label className="input-label">Клієнт</label>
              <input
                className="input-field"
                value={selectedFinance.clientName}
                disabled
                style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed' }}
              />

              <label className="input-label">Дата операції</label>
              <input
                name="date"
                type="date"
                defaultValue={selectedFinance.date}
                className="input-field"
                required
              />

              <label className="input-label">Сума до оплати (грн)</label>
              <input
                name="amount"
                type="number"
                defaultValue={selectedFinance.amount}
                className="input-field"
                required
              />

              <label className="input-label">Статус оплати</label>
              <select
                name="status"
                defaultValue={selectedFinance.status}
                className="input-field"
                style={{ cursor: 'pointer' }}
              >
                <option value="PAID">Оплачено</option>
                <option value="PENDING">Очікує</option>
                <option value="DEBT">Борг</option>
              </select>

              {errorMessage && (
                <div className="error-banner">{errorMessage}</div>
              )}

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
                  onClick={() => setSelectedFinance(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Скасувати
                </button>
              </div>

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
                  marginTop: '15px',
                  cursor: 'pointer',
                }}
              >
                Видалити запис про фінанси
              </button>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛКА ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ */}
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
