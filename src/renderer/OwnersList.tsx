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

interface Owner {
  id: number;
  name: string;
  phone: string;
  address?: string;
}

export default function OwnerList() {
  const [owners, setOwners] = useState<Owner[]>([
    {
      id: 1,
      name: 'Петро Петренко',
      phone: '0509876543',
      address: 'вул. Шевченка, 12',
    },
    {
      id: 2,
      name: 'Олена Іванова',
      phone: '0671234567',
      address: 'просп. Свободи, 45',
    },
  ]);

  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOwnerId, setDeleteOwnerId] = useState<number | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);

  const filteredOwners = owners.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  filteredOwners.sort((a, b) => {
    if (a.name < b.name) return sortAsc ? -1 : 1;
    if (a.name > b.name) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleAddOwner = () => {
    if (!newOwnerName.trim() || !newOwnerPhone.trim()) {
      alert("Будь ласка, заповніть ім'я та телефон власника.");
      return;
    }

    setOwners([
      ...owners,
      {
        id: Date.now(),
        name: newOwnerName.trim(),
        phone: newOwnerPhone.trim(),
        address: newOwnerAddress.trim() || 'Адрес не вказано',
      },
    ]);

    setNewOwnerName('');
    setNewOwnerPhone('');
    setNewOwnerAddress('');
    setShowAddModal(false);
  };

  const handleDeleteOwner = () => {
    if (adminPassword !== '1234') {
      alert('Неверный пароль администратора!');
      return;
    }
    if (deleteOwnerId !== null) {
      setOwners(owners.filter((o) => o.id !== deleteOwnerId));
      setDeleteOwnerId(null);
      setAdminPassword('');
      setShowDeleteModal(false);
    }
  };

  return (
    <div style={{ padding: '0.5rem' }}>
      <h2 style={{ margin: '0 0 1rem 0' }}>Список власників</h2>

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
          onClick={() => setSortAsc(!sortAsc)}
          style={{ padding: '0.5rem 1rem' }}
        >
          {sortAsc ? 'А-Я' : 'Я-А'}
        </button>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{ padding: '0.5rem 1rem' }}
        >
          + Додати
        </button>
      </div>

      <ul style={{ paddingLeft: 10 }}>
        {filteredOwners.map((o) => (
          <li key={o.id} style={{ listStyle: 'none', marginBottom: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setSelectedOwner(o)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.5rem',
                cursor: 'pointer',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: 'white',
              }}
            >
              <span>{o.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOwnerId(o.id);
                  setShowDeleteModal(true);
                }}
                style={{ padding: '0.25rem 0.5rem' }}
              >
                Видалити
              </button>
            </button>
          </li>
        ))}
      </ul>

      {/* Модальное добавления */}
      {showAddModal && (
        <div style={styles.modalWindowContainer}>
          <div style={styles.modalWindow}>
            <h3>Додати власника</h3>
            <input
              type="text"
              placeholder="ФІО"
              value={newOwnerName}
              onChange={(e) => setNewOwnerName(e.target.value)}
              style={styles.inputFields}
            />
            <input
              type="text"
              placeholder="Телефон"
              value={newOwnerPhone}
              onChange={(e) => setNewOwnerPhone(e.target.value)}
              style={styles.inputFields}
            />
            <input
              type="text"
              placeholder="Адреса"
              value={newOwnerAddress}
              onChange={(e) => setNewOwnerAddress(e.target.value)}
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
                onClick={handleAddOwner}
                style={{ padding: '0.5rem 1rem' }}
              >
                Додати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное удаления */}
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
                onClick={handleDeleteOwner}
                style={{ padding: '0.5rem 1rem' }}
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно деталей */}
      {selectedOwner && (
        <div style={styles.modalWindowContainer}>
          <div style={styles.modalWindow}>
            <h3>{selectedOwner.name}</h3>
            <p>
              <b>Телефон:</b> {selectedOwner.phone}
            </p>
            <p>
              <b>Адреса:</b> {selectedOwner.address}
            </p>
            <div style={styles.btnContainer}>
              <button type="button" onClick={() => setSelectedOwner(null)}>
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
