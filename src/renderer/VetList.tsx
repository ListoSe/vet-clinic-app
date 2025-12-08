import React, { useState } from 'react';

const styles: { [key: string]: React.CSSProperties } = {
  inputFields: {
    width: '80%',
    padding: '0.5rem',
    marginBottom: '1rem',
  },
  modalWindowContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalWindow: {
    background: 'white',
    padding: '1rem',
    borderRadius: '8px',
    width: '300px',
  },
  btnContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
};

interface Vet {
  id: number;
  name: string;
  phone: string;
}

export default function VetList() {
  const [vets, setVets] = useState<Vet[]>([
    { id: 1, name: 'Іван Іваненко', phone: '0501234567' },
    { id: 2, name: 'Марія Петрівна', phone: '0677654321' },
  ]);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newVetName, setNewVetName] = useState('');
  const [newVetPhone, setNewVetPhone] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteVetId, setDeleteVetId] = useState<number | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  const filteredVets = vets.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Добавление нового ветеринара
  const handleAddVet = () => {
    if (!newVetName.trim() || !newVetPhone.trim()) return;
    setVets([
      ...vets,
      {
        id: Date.now(),
        name: newVetName.trim(),
        phone: newVetPhone.trim(),
      },
    ]);

    setNewVetName('');
    setNewVetPhone('');
    setShowAddModal(false);
  };

  const handleDeleteVet = () => {
    if (adminPassword !== '1234') {
      alert('Неверный пароль администратора!');
      return;
    }
    if (deleteVetId !== null) {
      setVets(vets.filter((v) => v.id !== deleteVetId));
      setDeleteVetId(null);
      setAdminPassword('');
      setShowDeleteModal(false);
    }
  };

  return (
    <div style={{ padding: '0.5rem' }}>
      <h2 style={{ margin: '0 0 1rem 0' }}>Список ветеринарів</h2>

      {/* Поиск и кнопка добавить в одной строке */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Пошук"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{ padding: '0.5rem 1rem' }}
        >
          + Додати
        </button>
      </div>

      {/* Список */}
      <ul>
        {filteredVets.map((v) => (
          <li
            key={v.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              alignItems: 'center',
            }}
          >
            <span>{v.name}</span>
            <button
              type="button"
              onClick={() => {
                setDeleteVetId(v.id);
                setShowDeleteModal(true);
              }}
              style={{ padding: '0.25rem 0.5rem' }}
            >
              Видалити
            </button>
          </li>
        ))}
      </ul>

      {/* Модальное окно добавления */}
      {showAddModal && (
        <div style={styles.modalWindowContainer}>
          <div style={styles.modalWindow}>
            <h3>Додати ветеринара</h3>
            <input
              type="text"
              placeholder="ФІО"
              value={newVetName}
              onChange={(e) => setNewVetName(e.target.value)}
              style={styles.inputFields}
            />
            <input
              type="text"
              placeholder="Телефон"
              value={newVetPhone}
              onChange={(e) => setNewVetPhone(e.target.value)}
              style={styles.inputFields}
            />
            <div style={styles.btnContainer}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ padding: '0.5rem 1rem' }}
              >
                Відміна
              </button>
              <button
                type="button"
                onClick={handleAddVet}
                style={{ padding: '0.5rem 1rem' }}
              >
                Додати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно удаления */}
      {showDeleteModal && (
        <div style={styles.modalWindowContainer}>
          <div style={styles.modalWindow}>
            <h3>Підтвердити видалення</h3>
            <p>Введіть пароль адміністратора для видалення:</p>
            <input
              type="password"
              placeholder="Пароль"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              style={styles.inputFields}
            />
            <div style={styles.btnContainer}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{ padding: '0.5rem 1rem' }}
              >
                Відміна
              </button>
              <button
                type="button"
                onClick={handleDeleteVet}
                style={{ padding: '0.5rem 1rem' }}
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
