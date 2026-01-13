import React, { useState } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';

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

export default function FinanceList({ currentUser }: FinanceListProps) {
  const [finances, setFinances] = useState<FinanceRecord[]>([
    {
      id: 1,
      date: '2024-05-19',
      clientName: 'Ганна Сидорова',
      service: 'Огляд та вакцинація',
      amount: 550,
      status: 'Оплачено',
    },
    {
      id: 2,
      date: '2024-05-20',
      clientName: 'Іван Іванов',
      service: 'Хірургія (стерилізація)',
      amount: 1200,
      status: 'Очікує',
    },
    {
      id: 3,
      date: '2024-05-21',
      clientName: 'Дмитро Козак',
      service: 'Чистка зубів',
      amount: 400,
      status: 'Борг',
    },
  ]);

  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortNewest, setSortNewest] = useState(true); // Стейт для сортування
  const [selectedFinance, setSelectedFinance] = useState<FinanceRecord | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Логіка фільтрації та сортування
  const filteredFinances = finances
    .filter((f) => {
      const matchesSearch =
        f.clientName.toLowerCase().includes(search.toLowerCase()) ||
        f.service.toLowerCase().includes(search.toLowerCase());
      const matchesDate = filterDate ? f.date === filterDate : true;
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortNewest ? dateB - dateA : dateA - dateB;
    });

  // Підрахунок суми тільки для відфільтрованих записів
  const totalAmount = filteredFinances.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Оплачено':
        return { bg: '#dcfce7', text: '#166534' };
      case 'Очікує':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'Борг':
        return { bg: '#fee2e2', text: '#991b1b' };
      default:
        return { bg: '#eee', text: '#333' };
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedData = {
      amount: Number(formData.get('amount')),
      status: formData.get('status') as FinanceRecord['status'],
      date: formData.get('date') as string,
    };

    if (selectedFinance) {
      setFinances(
        finances.map((f) =>
          f.id === selectedFinance.id ? { ...f, ...updatedData } : f,
        ),
      );
    }
    setSelectedFinance(null);
  };

  const handleConfirmDelete = (password: string) => {
    const correctPassword = currentUser?.password || '1234';
    if (password === correctPassword) {
      setFinances(finances.filter((f) => f.id !== selectedFinance?.id));
      setIsDeleteModalOpen(false);
      setSelectedFinance(null);
      setErrorMessage('');
    } else {
      setErrorMessage('Невірний пароль!');
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
        {/* Кнопка сортування як у Записах */}
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
          {filteredFinances.map((f) => {
            const style = getStatusStyle(f.status);
            return (
              <tr
                key={f.id}
                className="clickable-row"
                onClick={() => setSelectedFinance(f)}
              >
                <td>{f.date}</td>
                <td style={{ fontWeight: '600' }}>👤 {f.clientName}</td>
                <td>{f.service}</td>
                <td style={{ fontWeight: 'bold' }}>{f.amount} грн</td>
                <td>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: style.bg,
                      color: style.text,
                    }}
                  >
                    {f.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* МОДАЛКА РЕДАГУВАННЯ */}
      {selectedFinance && (
        <div className="modal-overlay" onClick={() => setSelectedFinance(null)}>
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
                <option value="Оплачено">Оплачено</option>
                <option value="Очікує">Очікує</option>
                <option value="Борг">Борг</option>
              </select>

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
