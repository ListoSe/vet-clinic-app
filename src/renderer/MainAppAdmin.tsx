import React, { useState } from 'react';

import VetList from './VetList';

export default function MainAppAdmin() {
  const [tab, setTab] = useState('vets');

  const styles = {
    container: {
      padding: '20px',
      fontFamily: 'Arial',
    },
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
    },
    tabButton: (active: boolean) => ({
      padding: '10px 15px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      backgroundColor: active ? '#0078ff' : '#f1f1f1',
      color: active ? 'white' : 'black',
      cursor: 'pointer',
    }),
    content: {
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      color: 'black',
    },
  };

  const renderTab = () => {
    switch (tab) {
      case 'vets':
        return VetList ? <VetList /> : <div>Завантаження...</div>;
      case 'owners':
        return <div>Список владельцев животных</div>;
      case 'animals':
        return <div>Список животных</div>;
      case 'records':
        return <div>Журнал записей</div>;
      case 'finance':
        return <div>Финансовый отчёт, платежи, статистика</div>;
      default:
        return null;
    }
  };
  return (
    <div style={styles.container}>
      <h1>Админ-панель</h1>

      <div style={styles.tabs}>
        <button
          type="button"
          style={styles.tabButton(tab === 'vets')}
          onClick={() => setTab('vets')}
        >
          Ветеринары
        </button>

        <button
          type="button"
          style={styles.tabButton(tab === 'owners')}
          onClick={() => setTab('owners')}
        >
          Владельцы
        </button>
        <button
          type="button"
          style={styles.tabButton(tab === 'animals')}
          onClick={() => setTab('animals')}
        >
          Животные
        </button>

        <button
          type="button"
          style={styles.tabButton(tab === 'records')}
          onClick={() => setTab('records')}
        >
          Записи
        </button>

        <button
          type="button"
          style={styles.tabButton(tab === 'finance')}
          onClick={() => setTab('finance')}
        >
          Финансы
        </button>
      </div>

      <div style={styles.content}>{renderTab()}</div>
    </div>
  );
}
