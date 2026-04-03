import { User } from "@/pages/Index";

interface ContactsPanelProps {
  users: User[];
  currentUserId: number;
  onStartChat: (user: User) => void;
}

export default function ContactsPanel({ users, currentUserId, onStartChat }: ContactsPanelProps) {
  const others = users.filter((u) => u.id !== currentUserId);
  return (
    <div className="panel-inner">
      <div className="panel-header">
        <h2>Контакты</h2>
        <span className="panel-count">{others.length}</span>
      </div>
      <div className="contacts-list">
        {others.length === 0 && (
          <p className="empty-text">Пока никого нет. Пригласите друзей!</p>
        )}
        {others.map((u) => (
          <button key={u.id} className="contact-item contact-btn" onClick={() => onStartChat(u)}>
            <div className="chat-avatar">{u.avatar}</div>
            <div className="contact-info">
              <span className="chat-name">{u.display_name}</span>
              <span className="contact-role">@{u.username}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
