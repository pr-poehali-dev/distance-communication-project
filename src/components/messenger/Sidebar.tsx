import Icon from "@/components/ui/icon";
import { Section } from "@/pages/Index";

interface SidebarProps {
  section: Section;
  onSectionChange: (s: Section) => void;
}

const items: { id: Section; icon: string; label: string }[] = [
  { id: "chats", icon: "MessageSquare", label: "Чаты" },
  { id: "contacts", icon: "Users", label: "Контакты" },
  { id: "search", icon: "Search", label: "Поиск" },
  { id: "notifications", icon: "Bell", label: "Уведомления" },
  { id: "profile", icon: "User", label: "Профиль" },
  { id: "settings", icon: "Settings", label: "Настройки" },
];

export default function Sidebar({ section, onSectionChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">М</div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={`sidebar-btn ${section === item.id ? "active" : ""}`}
            onClick={() => onSectionChange(item.id)}
            title={item.label}
          >
            <Icon name={item.icon} size={20} />
          </button>
        ))}
      </nav>
    </aside>
  );
}
