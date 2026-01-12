import React, { useState } from 'react';

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
  currentUser?: any;
}

export default function RecordsList({ currentUser }: RecordsListProps) {
  const [records, setRecords] = useState<Record[]>([
    { id: 1, petName: 'Бакс', ownerName: 'Іван Іванов', vetName: 'Д-р Коваль', date: '2024-05-20', reason: 'Щеплення', details: 'Перша вакцинація.', status: 'Заплановано' },
    { id: 2, petName: 'Мурка', ownerName: 'Ганна Сидорова', vetName: 'Д-р Петренко', date: '2024-05-19', reason: 'Огляд', details: 'Скарги на апетит.', status: 'Завершено' },
  ]);

  const [search, setSearch] = useState('');
  const [sortNewest, setSortNewest] = useState(true); // true = спочатку нові
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const theme = {
    primary: '#3b82f6',
    danger: '#ef4444',
    border: '#e2e8f0',
    text: '#1e293b',
    textLight: '#64748b'
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { width: '100%', color: theme.text },
    controls: { display: 'flex', gap: '12px', marginBottom: '20px' },
    input: {
      padding: '10px 14px', borderRadius: '8px', border: `1px solid ${theme.border}`,
      fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%', display: 'block'
    },
    button: { padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' },
    table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
    th: { textAlign: 'left', padding: '12px', borderBottom: `2px solid ${theme.border}`, color: theme.textLight, fontSize: '13px' },
    td: { padding: '14px 12px', borderBottom: `1px solid ${theme.border}`, fontSize: '14px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '480px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', boxSizing: 'border-box' }
  };

  const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    const colors = {
      'Завершено': { bg: '#dcfce7', text: '#166534' },
      'Заплановано': { bg: '#fef3c7', text: '#92400e' },
      'Скасовано': { bg: '#fee2e2', text: '#991b1b' }
    };
    const config = colors[status as keyof typeof colors] || colors['Заплановано'];
    return {
      padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
      backgroundColor: config.bg, color: config.text, display: 'inline-block'
    };
  };

  // Фільтрація за кличкою або лікарем та сортування за датою
  const filteredRecords = records
    .filter(r =>
      r.petName.toLowerCase().includes(search.toLowerCase()) ||
      r.vetName.toLowerCase().includes(search.toLowerCase())
    )
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
      setRecords(records.map(r => r.id === selectedRecord.id ? { ...recordData, id: r.id } : r));
    } else {
      setRecords([...records, { ...recordData, id: Date.now() }]);
    }
    setIsAdding(false);
    setSelectedRecord(null);
  };

  return (
    <div style={styles.container}>
      {/* ПАНЕЛЬ УПРАВЛІННЯ (ПОШУК ТА СОРТУВАННЯ) */}
      <div style={styles.controls}>
        <input
          placeholder="Пошук за твариною або лікарем..."
          style={{ ...styles.input, flex: 1 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setSortNewest(!sortNewest)}
          style={{ ...styles.button, backgroundColor: '#f1f5f9', color: theme.text, minWidth: '140px' }}
        >
          {sortNewest ? '📅 Спочатку нові' : '📅 Спочатку старі'}
        </button>
        <button
          onClick={() => setIsAdding(true)}
          style={{ ...styles.button, backgroundColor: theme.primary, color: 'white' }}
        >
          + Новий візит
        </button>
      </div>

      {/* ТАБЛИЦЯ */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: '15%' }}>Дата</th>
            <th style={{ ...styles.th, width: '25%' }}>Тварина</th>
            <th style={{ ...styles.th, width: '25%' }}>Лікар</th>
            <th style={{ ...styles.th, width: '20%' }}>Статус</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map(r => (
            <tr
              key={r.id}
              onClick={() => setSelectedRecord(r)}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              style={{ cursor: 'pointer' }}
            >
              <td style={styles.td}>{r.date}</td>
              <td style={{ ...styles.td, fontWeight: '600' }}>🐾 {r.petName}</td>
              <td style={styles.td}>{r.vetName}</td>
              <td style={styles.td}><span style={getStatusBadgeStyle(r.status)}>{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* МОДАЛКА (ФОРМА ТА ВИДАЛЕННЯ) */}
      {(isAdding || selectedRecord) && (
        <div style={styles.modalOverlay} onClick={() => { setIsAdding(false); setSelectedRecord(null); setDeleteConfirm(false); }}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            {!deleteConfirm ? (
              <>
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
                  {selectedRecord ? 'Редагування запису' : 'Новий візит'}
                </h3>
                <form onSubmit={handleSave}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Тварина</label>
                      <input name="petName" defaultValue={selectedRecord?.petName} style={{ ...styles.input, marginTop: '5px' }} required placeholder="Кличка" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Власник</label>
                      <input name="ownerName" defaultValue={selectedRecord?.ownerName} style={{ ...styles.input, marginTop: '5px' }} required placeholder="ПІБ" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginTop: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Дата</label>
                      <input name="date" type="date" defaultValue={selectedRecord?.date} style={{ ...styles.input, marginTop: '5px' }} required />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Статус</label>
                      <select name="status" defaultValue={selectedRecord?.status || 'Заплановано'} style={{ ...styles.input, marginTop: '5px' }}>
                        <option value="Заплановано">Заплановано</option>
                        <option value="Завершено">Завершено</option>
                        <option value="Скасовано">Скасовано</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Лікар</label>
                    <input name="vetName" defaultValue={selectedRecord?.vetName} style={{ ...styles.input, marginTop: '5px' }} required />
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Причина візиту</label>
                    <input name="reason" defaultValue={selectedRecord?.reason} style={{ ...styles.input, marginTop: '5px' }} required />
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Деталі прийому</label>
                    <textarea name="details" defaultValue={selectedRecord?.details} style={{ ...styles.input, marginTop: '5px', height: '70px', resize: 'none' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" style={{ ...styles.button, backgroundColor: theme.primary, color: 'white', flex: 1 }}>Зберегти</button>
                    <button type="button" onClick={() => { setIsAdding(false); setSelectedRecord(null); }} style={{ ...styles.button, backgroundColor: '#f1f5f9', flex: 1 }}>Закрити</button>
                  </div>

                  {selectedRecord && (
                    <button type="button" onClick={() => setDeleteConfirm(true)} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', width: '100%', marginTop: '15px', fontSize: '13px', textDecoration: 'underline' }}>
                      Видалити цей запис
                    </button>
                  )}
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: theme.danger, marginTop: 0 }}>Підтвердження видалення</h3>
                <p style={{ fontSize: '14px', color: theme.textLight }}>Введіть пароль адміністратора для видалення запису:</p>
                <input type="password" style={styles.input} value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} autoFocus />
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={() => {
                    if (passwordConfirm === '1234') {
                      setRecords(records.filter(r => r.id !== selectedRecord?.id));
                      setSelectedRecord(null);
                      setDeleteConfirm(false);
                      setPasswordConfirm('');
                    } else alert('Невірний пароль!');
                  }} style={{ ...styles.button, backgroundColor: theme.danger, color: 'white', flex: 1 }}>Видалити</button>
                  <button onClick={() => setDeleteConfirm(false)} style={{ ...styles.button, backgroundColor: '#f1f5f9', flex: 1 }}>Назад</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
