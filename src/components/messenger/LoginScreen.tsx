import { useState } from "react";

interface LoginScreenProps {
  onLogin: (username: string, displayName: string) => Promise<void>;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!username.trim()) { setError("Введите имя пользователя"); return; }
    setLoading(true);
    setError("");
    try {
      await onLogin(username.trim(), displayName.trim() || username.trim());
    } catch {
      setError("Ошибка входа. Попробуйте снова.");
    }
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">М</div>
        <h1 className="login-title">Мессенджер</h1>
        <p className="login-sub">Войдите, чтобы начать общение</p>

        <div className="login-fields">
          <div className="login-field">
            <label className="field-label">Имя пользователя</label>
            <input
              className="login-input"
              placeholder="например: ivan_ivanov"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, "_"))}
              onKeyDown={(e) => e.key === "Enter" && handle()}
            />
          </div>
          <div className="login-field">
            <label className="field-label">Отображаемое имя</label>
            <input
              className="login-input"
              placeholder="Иван Иванов"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handle()}
            />
          </div>
        </div>

        {error && <p className="login-error">{error}</p>}

        <button className="login-btn" onClick={handle} disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </button>

        <p className="login-hint">
          Новый пользователь? Просто введите имя — аккаунт создастся автоматически.
        </p>
      </div>
    </div>
  );
}
