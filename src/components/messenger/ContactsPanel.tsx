const contacts = [
  { id: 1, name: "Анна Смирнова", role: "Дизайнер", avatar: "АС", online: true },
  { id: 2, name: "Дмитрий Новиков", role: "Разработчик", avatar: "ДН", online: true },
  { id: 3, name: "Елена Козлова", role: "Менеджер", avatar: "ЕК", online: false },
  { id: 4, name: "Михаил Петров", role: "Аналитик", avatar: "МП", online: false },
  { id: 5, name: "Ольга Иванова", role: "Маркетолог", avatar: "ОИ", online: true },
  { id: 6, name: "Сергей Васильев", role: "Директор", avatar: "СВ", online: false },
];

export default function ContactsPanel() {
  return (
    <div className="panel-inner">
      <div className="panel-header">
        <h2>Контакты</h2>
        <span className="panel-count">{contacts.length}</span>
      </div>
      <div className="contacts-list">
        {contacts.map((c) => (
          <div key={c.id} className="contact-item">
            <div className="chat-avatar-wrap">
              <div className="chat-avatar">{c.avatar}</div>
              {c.online && <span className="online-dot" />}
            </div>
            <div className="contact-info">
              <span className="chat-name">{c.name}</span>
              <span className="contact-role">{c.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
