// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface VetProps {
  user: any;
  onLogout: () => void;
}

export default function Vet({ user, onLogout }: VetProps) {
  return (
    <div>
      <h1>Панель Ветеринара</h1>
      <p>Вітаю, {user?.email}</p>
      <button onClick={onLogout}>Вийти</button>
      {/* Твой остальной код */}
    </div>
  );
}
