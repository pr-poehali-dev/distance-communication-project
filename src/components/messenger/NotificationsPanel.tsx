const notifications = [
  { id: 1, text: "Анна Смирнова отправила вам сообщение", time: "12:34", read: false },
  { id: 2, text: "Команда Дизайн: 5 новых сообщений", time: "09:40", read: false },
  { id: 3, text: "Михаил Петров прочитал ваше сообщение", time: "11:20", read: true },
  { id: 4, text: "Елена Козлова добавила вас в контакты", time: "Вчера", read: true },
  { id: 5, text: "Дмитрий Новиков теперь в сети", time: "Вчера", read: true },
];

export default function NotificationsPanel() {
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <div className="panel-inner">
      <div className="panel-header">
        <h2>Уведомления</h2>
        {unread > 0 && <span className="unread-badge">{unread}</span>}
      </div>
      <div className="notif-list">
        {notifications.map((n) => (
          <div key={n.id} className={`notif-item ${!n.read ? "unread" : ""}`}>
            <div className="notif-dot-wrap">
              {!n.read && <span className="notif-dot" />}
            </div>
            <div className="notif-content">
              <p className="notif-text">{n.text}</p>
              <span className="chat-time">{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
