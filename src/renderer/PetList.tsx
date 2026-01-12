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
    width: '350px',
  },
  btnContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
};

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

export default function AnimalList() {
  const [owners] = useState<Owner[]>([
    { id: '1', name: 'Петро Петренко' },
    { id: '2', name: 'Олена Іванова' },
  ]);

  const [animals, setAnimals] = useState<Animal[]>([
    { id: '1', name: 'Софискус', type: 'cat', age: 3, ownerId: '1' },
    { id: '2', name: 'Бобик', type: 'dog', age: 5, ownerId: '2' },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([
    {
      petId: '1',
      records: [
        {
          date: '2025-12-07',
          diagnosis: 'Гострий риніт',
          treatments: [
            { medicine: 'Антибіотик', dose: '2 мл', duration: '5 днів' },
            { procedure: 'Промывание носа' },
          ],
          notes: 'Повторний огляд через тиждень',
        },
      ],
    },
  ]);

  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalType, setNewAnimalType] = useState('');
  const [newAnimalAge, setNewAnimalAge] = useState('');
  const [newAnimalOwnerId, setNewAnimalOwnerId] = useState<string>('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAnimalId, setDeleteAnimalId] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  const filteredAnimals = animals.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  filteredAnimals.sort((a, b) => {
    if (a.name < b.name) return sortAsc ? -1 : 1;
    if (a.name > b.name) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleAddAnimal = () => {
    if (
      !newAnimalName.trim() ||
      !newAnimalType.trim() ||
      !newAnimalAge.trim() ||
      !newAnimalOwnerId
    ) {
      alert('Будь ласка, заповніть всі поля та оберіть власника.');
      return;
    }

    setAnimals([
      ...animals,
      {
        id: Date.now().toString(),
        name: newAnimalName.trim(),
        type: newAnimalType.trim(),
        age: Number(newAnimalAge),
        ownerId: newAnimalOwnerId,
      },
    ]);

    setNewAnimalName('');
    setNewAnimalType('');
    setNewAnimalAge('');
    setNewAnimalOwnerId('');
    setShowAddModal(false);
  };

  const handleDeleteAnimal = () => {
    if (adminPassword !== '1234') {
      alert('Неверный пароль администратора!');
      return;
    }
    if (deleteAnimalId !== null) {
      setAnimals(animals.filter((a) => a.id !== deleteAnimalId));
      setDeleteAnimalId(null);
      setAdminPassword('');
      setShowDeleteModal(false);
    }
  };

  const getOwnerName = (ownerId: string) => {
    const owner = owners.find((o) => o.id === ownerId);
    return owner ? owner.name : 'Невідомий власник';
  };

  const getMedicalRecord = (petId: string) => {
    return medicalRecords.find((mr) => mr.petId === petId)?.records || [];
  };

  return (
    <div style={{ padding: '0.5rem' }}>
      <h2 style={{ margin: '0 0 1rem 0' }}>Список тварин</h2>

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
        {filteredAnimals.map((a) => (
          <li key={a.id} style={{ listStyle: 'none', marginBottom: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setSelectedAnimal(a)}
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
              <span>
                {a.name} ({a.type}, {a.age} р.)
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteAnimalId(a.id);
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
            <h3>Додати тварину</h3>
            <input
              type="text"
              placeholder="Ім'я"
              value={newAnimalName}
              onChange={(e) => setNewAnimalName(e.target.value)}
              style={styles.inputFields}
            />
            <input
              type="text"
              placeholder="Тип (cat/dog/інше)"
              value={newAnimalType}
              onChange={(e) => setNewAnimalType(e.target.value)}
              style={styles.inputFields}
            />
            <input
              type="number"
              placeholder="Вік"
              value={newAnimalAge}
              onChange={(e) => setNewAnimalAge(e.target.value)}
              style={styles.inputFields}
            />
            <select
              value={newAnimalOwnerId}
              onChange={(e) => setNewAnimalOwnerId(e.target.value)}
              style={styles.inputFields}
            >
              <option value="">Оберіть власника</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
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
                onClick={handleAddAnimal}
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
                onClick={handleDeleteAnimal}
                style={{ padding: '0.5rem 1rem' }}
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно просмотра */}
      {selectedAnimal && (
        <div style={styles.modalWindowContainer}>
          <div style={styles.modalWindow}>
            <h3>{selectedAnimal.name}</h3>
            <p>
              <b>Тип:</b> {selectedAnimal.type}
            </p>
            <p>
              <b>Вік:</b> {selectedAnimal.age} р.
            </p>
            <p>
              <b>Власник:</b> {getOwnerName(selectedAnimal.ownerId)}
            </p>
            <h4>Медична карта:</h4>
            {getMedicalRecord(selectedAnimal.id).length === 0 && (
              <p>Записів немає</p>
            )}
            {getMedicalRecord(selectedAnimal.id).map((r) => (
              <div
                key={r.date + (r.vetId || '')}
                style={{ borderTop: '1px solid #ddd', padding: '5px 0' }}
              >
                <p>
                  <b>Дата:</b> {r.date}
                </p>
                <p>
                  <b>Діагноз:</b> {r.diagnosis}
                </p>
                {r.treatments.map((t) => {
                  let treatmentKey = '';
                  if (t.medicine) {
                    treatmentKey = `med-${t.medicine}`;
                  } else if (t.procedure) {
                    treatmentKey = `proc-${t.procedure}`;
                  } else {
                    treatmentKey = Math.random().toString();
                  }
                  return (
                    <div key={treatmentKey}>
                      {t.medicine && (
                        <p>
                          Ліки: {t.medicine}, Доза: {t.dose}, Тривалість:
                          {t.duration}
                        </p>
                      )}
                      {t.procedure && <p>Процедура: {t.procedure}</p>}
                    </div>
                  );
                })}
                {r.notes && <p>Примітки: {r.notes}</p>}
              </div>
            ))}
            <div style={styles.btnContainer}>
              <button type="button" onClick={() => setSelectedAnimal(null)}>
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
