import React, { useState } from 'react';
import VetList from './VetList';
import OwnersList from './OwnersList';
import PetList from './PetList';
import RecordsList from './RecordsList';

interface AdminProps {
  user: any;
  onLogout: () => void;
}

export default function MainAppAdmin({ user, onLogout }: AdminProps) {
  const [tab, setTab] = useState('vets');

  const colors = {
    sidebarBg: '#1e293b', // Темно-синий профиль
    activeLink: '#3b82f6', // Яркий акцент
    bgMain: '#f8fafc', // Светло-серый фон для контента
    textMain: '#1e293b',
    border: '#e2e8f0'
  };

  const styles: { [key: string]: any } = {
    layout: {
      display: 'flex',
      height: '100vh',
      backgroundColor: colors.bgMain,
      fontFamily: '"Inter", "Segoe UI", sans-serif',
    },
    sidebar: {
      width: '260px',
      backgroundColor: colors.sidebarBg,
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
    },
    logoSection: {
      padding: '0 20px 30px',
      fontSize: '22px',
      fontWeight: 'bold',
      borderBottom: `1px solid rgba(255,255,255,0.1)`,
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    navItem: (active: boolean) => ({
      padding: '12px 25px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '15px',
      transition: 'all 0.3s',
      backgroundColor: active ? colors.activeLink : 'transparent',
      borderLeft: active ? '4px solid #fff' : '4px solid transparent',
      color: active ? '#fff' : '#cbd5e1',
    }),
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0, // ВАЖНО: позволяет flex-элементу сжиматься/расширяться корректно
      overflowX: 'hidden',
    },
    header: {
      height: '70px',
      backgroundColor: '#fff',
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 30px',
    },
    contentCard: {
      margin: '30px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: `1px solid ${colors.border}`,
      padding: '25px',
      // Фиксируем минимальную высоту, чтобы при пустых вкладках футер не прыгал
      minHeight: 'calc(100vh - 170px)',
      // Гарантируем, что карточка всегда занимает всё доступное пространство
      width: 'auto',
      display: 'flex',
      flexDirection: 'column',
    },
    logoutBtn: {
      padding: '8px 16px',
      backgroundColor: '#fef2f2',
      color: '#ef4444',
      border: '1px solid #fee2e2',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: '0.2s',
    }
  };

  const renderTab = () => {
    switch (tab) {
      case 'vets': return <VetList currentUser={user}/>;
      case 'owners': return <OwnersList currentUser={user}/>;
      case 'animals': return <PetList currentUser={user}/>;
      case 'records': return <RecordsList currentUser={user} />;
      case 'finance': return <div style={{padding: '20px'}}>📊 Модуль статистики та фінансів</div>;
      default: return null;
    }
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar Навигация */}
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          🐾 VetControl
        </div>

        <nav style={{ flex: 1 }}>
          <div style={styles.navItem(tab === 'vets')} onClick={() => setTab('vets')}>
            👨‍⚕️ Ветеринари
          </div>
          <div style={styles.navItem(tab === 'owners')} onClick={() => setTab('owners')}>
            👥 Власники
          </div>
          <div style={styles.navItem(tab === 'animals')} onClick={() => setTab('animals')}>
            🐕 Тварини
          </div>
          <div style={styles.navItem(tab === 'records')} onClick={() => setTab('records')}>
            📅 Записи
          </div>
          <div style={styles.navItem(tab === 'finance')} onClick={() => setTab('finance')}>
            💰 Фінанси
          </div>
        </nav>

        <div style={{ padding: '20px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
          v1.0.4 Premium
        </div>
      </aside>

      {/* Основная часть */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h2 style={{ fontSize: '18px', color: colors.textMain }}>
            {tab === 'vets' && 'Управління ветеринарами'}
            {tab === 'owners' && 'База власників'}
            {tab === 'animals' && 'Реєстр тварин'}
            {tab === 'records' && 'Журнал прийомів'}
            {tab === 'finance' && 'Фінансовий звіт'}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Адміністратор</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{user?.email}</div>
            </div>
            <button
              onClick={onLogout}
              style={styles.logoutBtn}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
            >
              Вийти
            </button>
          </div>
        </header>

        <section style={styles.contentCard}>
          {renderTab()}
        </section>
      </main>
    </div>
  );
}
