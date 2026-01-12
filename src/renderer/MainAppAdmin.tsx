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
    // Використовуємо flex-контейнер для всього екрану
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>

      {/* Sidebar Навигация */}
      <aside style={{ width: '260px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px 0', boxShadow: '4px 0 10px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '0 20px 30px', fontSize: '22px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}>
          🐾 VetControl
        </div>

        <nav style={{ flex: 1 }}>
          {/* Використовуємо класи з App.css для хуверів і активного стану */}
          <div className={`nav-item ${tab === 'vets' ? 'active' : ''}`} onClick={() => setTab('vets')}>
            👨‍⚕️ Ветеринари
          </div>
          <div className={`nav-item ${tab === 'owners' ? 'active' : ''}`} onClick={() => setTab('owners')}>
            👥 Власники
          </div>
          <div className={`nav-item ${tab === 'animals' ? 'active' : ''}`} onClick={() => setTab('animals')}>
            🐕 Тварини
          </div>
          <div className={`nav-item ${tab === 'records' ? 'active' : ''}`} onClick={() => setTab('records')}>
            📅 Записи
          </div>
          <div className={`nav-item ${tab === 'finance' ? 'active' : ''}`} onClick={() => setTab('finance')}>
            💰 Фінанси
          </div>
        </nav>

        <div style={{ padding: '20px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
          v1.0.4 Premium
        </div>
      </aside>

      {/* Основная часть */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <header style={{ height: '70px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px' }}>
          <h2 style={{ fontSize: '18px', color: '#1e293b', margin: 0 }}>
            {tab === 'vets' && 'Управління ветеринарами'}
            {tab === 'owners' && 'База власників'}
            {tab === 'animals' && 'Реєстр тварин'}
            {tab === 'records' && 'Журнал прийомів'}
            {tab === 'finance' && 'Фінансовий звіт'}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>Адміністратор</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{user?.email}</div>
            </div>
            {/* Кнопка тепер використовує твій клас .btn з App.css (з ефектом scale) */}
            <button
              onClick={onLogout}
              className="btn"
              style={{ padding: '8px 16px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', fontSize: '14px' }}
            >
              Вийти
            </button>
          </div>
        </header>

        {/* Картка контенту */}
        <section style={{ margin: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '25px', minHeight: 'calc(100vh - 170px)', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {renderTab()}
        </section>
      </main>
    </div>
  );
}
