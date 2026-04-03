import { User } from "@/pages/Index";

interface ProfilePanelProps {
  user: User;
}

export default function ProfilePanel({ user }: ProfilePanelProps) {
  return (
    <div className="panel-inner">
      <div className="panel-header">
        <h2>Профиль</h2>
      </div>
      <div className="profile-body">
        <div className="profile-avatar">{user.avatar}</div>
        <h3 className="profile-name">{user.display_name}</h3>
        <p className="profile-status">В сети</p>
        <div className="profile-fields">
          <div className="profile-field">
            <span className="field-label">Имя пользователя</span>
            <span className="field-value">@{user.username}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
