import { useState } from "react";
import { useTheme } from "./ThemeContext";

interface SettingsPanelProps {
  onLogout: () => void;
}

export default function SettingsPanel({ onLogout }: SettingsPanelProps) {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <div className="panel-inner">
      <div className="panel-header">
        <h2>Настройки</h2>
      </div>
      <div className="settings-list">
        <div className="settings-group">
          <span className="settings-label">Уведомления</span>
          <button
            className={`toggle ${notifications ? "on" : ""}`}
            onClick={() => setNotifications(!notifications)}
          >
            <span className="toggle-thumb" />
          </button>
        </div>
        <div className="settings-group">
          <span className="settings-label">Звуки сообщений</span>
          <button
            className={`toggle ${sounds ? "on" : ""}`}
            onClick={() => setSounds(!sounds)}
          >
            <span className="toggle-thumb" />
          </button>
        </div>
        <div className="settings-group">
          <span className="settings-label">Тёмная тема</span>
          <button
            className={`toggle ${theme === "dark" ? "on" : ""}`}
            onClick={toggle}
          >
            <span className="toggle-thumb" />
          </button>
        </div>
        <div className="settings-group danger">
          <span className="settings-label">Выйти из аккаунта</span>
          <button className="settings-btn-danger" onClick={onLogout}>Выйти</button>
        </div>
      </div>
    </div>
  );
}