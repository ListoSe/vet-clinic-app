import React, { useState } from 'react';

interface Owner { id: string; name: string; }
interface Animal { id: string; name: string; type: string; age: number; ownerId: string; }
interface Treatment { medicine?: string; dose?: string; duration?: string; procedure?: string; }
interface MedicalRecordEntry { date: string; vetId?: string; diagnosis: string; treatments: Treatment[]; notes?: string; }
interface MedicalRecord { petId: string; records: MedicalRecordEntry[]; }

// Додано опис структури користувача в пропсах
interface AnimalListProps {
  currentUser?: {
    id: string;
    name: string;
    password?: string; // Пароль, з яким будемо порівнювати
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [viewingMedicalHistory, setViewingMedicalHistory] = useState<Animal | null>(null);

  // Стани для видалення та помилок
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const theme = {
    primary: '#3b82f6',
    danger: '#ef4444',
    border: '#e2e8f0',
    text: '#1e293b',
    textLight: '#64748b',
    bgBadge: '#eff6ff',
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
    badge: { padding: '4px 8px', borderRadius: '6px', backgroundColor: theme.bgBadge, color: theme.primary, fontSize: '12px', fontWeight: 'bold' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', boxSizing: 'border-box' }
  };

  const closeDeleteModal = () => {
    setDeleteConfirmId(null);
    setAdminPassword('');
    setErrorMessage('');
  };

  const confirmDelete = () => {
    // ПОРІВНЯННЯ: Беремо пароль з currentUser або '1234' як запасний
    const passwordToMatch = currentUser?.password || '1234';

    if (adminPassword === passwordToMatch) {
      setAnimals(animals.filter(a => a.id !== deleteConfirmId));
      closeDeleteModal();
    } else {
      setErrorMessage('Невірний пароль користувача!');
      setAdminPassword(''); // Очищуємо поле для нової спроби
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
    <div style={styles.container}>
      <div style={styles.controls}>
        <input
          placeholder="Пошук тварини за кличкою..."
          style={{ ...styles.input, flex: 1 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setSortAsc(!sortAsc)} style={{ ...styles.button, backgroundColor: '#f1f5f9' }}>
          {sortAsc ? 'А-Я' : 'Я-А'}
        </button>
        <button onClick={() => { setEditingAnimal(null); setIsFormOpen(true); }} style={{ ...styles.button, backgroundColor: theme.primary, color: 'white' }}>
          + Додати тварину
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: '30%' }}>Кличка</th>
            <th style={{ ...styles.th, width: '20%' }}>Вид</th>
            <th style={{ ...styles.th, width: '30%' }}>Власник</th>
            <th style={{ ...styles.th, width: '20%', textAlign: 'right' }}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredAnimals.map((a) => (
            <tr
              key={a.id}
              onClick={() => { setEditingAnimal(a); setIsFormOpen(true); }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              style={{ cursor: 'pointer' }}
            >
              <td style={{ ...styles.td, fontWeight: 'bold' }}>🐾 {a.name}</td>
              <td style={styles.td}><span style={styles.badge}>{a.type}</span></td>
              <td style={styles.td}>{owners.find(o => o.id === a.ownerId)?.name || '—'}</td>
              <td style={{ ...styles.td, textAlign: 'right' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(a.id); }}
                  style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', fontSize: '12px' }}
                >
                  Видалити
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* МОДАЛКА ФОРМИ */}
      {isFormOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsFormOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
              {editingAnimal ? 'Редагувати профіль' : 'Реєстрація тварини'}
            </h3>
            <form onSubmit={handleSave}>
              <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Кличка</label>
              <input name="name" defaultValue={editingAnimal?.name} style={{ ...styles.input, marginBottom: '15px', marginTop: '5px' }} required />

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Вид</label>
                  <input name="type" defaultValue={editingAnimal?.type} style={{ ...styles.input, marginBottom: '15px', marginTop: '5px' }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Вік</label>
                  <input name="age" type="number" defaultValue={editingAnimal?.age} style={{ ...styles.input, marginBottom: '15px', marginTop: '5px' }} required />
                </div>
              </div>

              <label style={{ fontSize: '12px', color: theme.textLight, fontWeight: 'bold' }}>Власник</label>
              <select name="ownerId" defaultValue={editingAnimal?.ownerId} style={{ ...styles.input, marginBottom: '25px', marginTop: '5px' }} required>
                <option value="">Оберіть власника...</option>
                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ ...styles.button, backgroundColor: theme.primary, color: 'white', flex: 1 }}>Зберегти</button>
                <button type="button" onClick={() => setIsFormOpen(false)} style={{ ...styles.button, backgroundColor: '#f1f5f9', flex: 1 }}>Скасувати</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛКА ВИДАЛЕННЯ */}
      {deleteConfirmId && (
        <div style={styles.modalOverlay} onClick={closeDeleteModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: theme.danger, marginTop: 0 }}>Підтвердити видалення</h3>
            <p style={{ fontSize: '14px', color: theme.textLight, marginBottom: '15px' }}>
              Підтвердіть дію паролем користувача <strong>{currentUser?.name || 'Адміністратор'}</strong>:
            </p>

            <input
              type="password"
              style={{
                ...styles.input,
                borderColor: errorMessage ? theme.danger : theme.border,
                backgroundColor: errorMessage ? '#fff5f5' : 'white'
              }}
              value={adminPassword}
              onChange={e => {
                setAdminPassword(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Введіть ваш пароль"
              autoFocus
            />

            {errorMessage && (
              <div style={{ color: theme.danger, fontSize: '12px', marginTop: '8px', fontWeight: 'bold', textAlign: 'center' }}>
                {errorMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={confirmDelete} style={{ ...styles.button, backgroundColor: theme.danger, color: 'white', flex: 1 }}>
                Видалити
              </button>
              <button onClick={closeDeleteModal} style={{ ...styles.button, backgroundColor: '#f1f5f9', flex: 1 }}>Назад</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
