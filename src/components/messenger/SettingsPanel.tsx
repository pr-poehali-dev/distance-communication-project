import { useState } from "react";

export default function SettingsPanel() {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);
  const [theme, setTheme] = useState("light");

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
          <span className="settings-label">Тема</span>
          <select
            className="settings-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>
        </div>
        <div className="settings-group danger">
          <span className="settings-label">Выйти из аккаунта</span>
          <button className="settings-btn-danger">Выйти</button>
        </div>
      </div>
    </div>
  );
}
