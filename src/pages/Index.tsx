import { useState } from "react";
import Sidebar from "@/components/messenger/Sidebar";
import ChatList from "@/components/messenger/ChatList";
import ChatWindow from "@/components/messenger/ChatWindow";
import ContactsPanel from "@/components/messenger/ContactsPanel";
import SearchPanel from "@/components/messenger/SearchPanel";
import NotificationsPanel from "@/components/messenger/NotificationsPanel";
import ProfilePanel from "@/components/messenger/ProfilePanel";
import SettingsPanel from "@/components/messenger/SettingsPanel";

export type Section = "chats" | "contacts" | "search" | "notifications" | "profile" | "settings";

export interface Message {
  id: number;
  text: string;
  time: string;
  isOwn: boolean;
}

export interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

const initialChats: Chat[] = [
  {
    id: 1,
    name: "Анна Смирнова",
    avatar: "АС",
    lastMessage: "Увидимся завтра в 10:00",
    time: "12:34",
    unread: 2,
    online: true,
    messages: [
      { id: 1, text: "Привет! Как дела?", time: "12:20", isOwn: false },
      { id: 2, text: "Всё хорошо, спасибо! А у тебя?", time: "12:22", isOwn: true },
      { id: 3, text: "Тоже отлично. Мы встречаемся завтра?", time: "12:30", isOwn: false },
      { id: 4, text: "Увидимся завтра в 10:00", time: "12:34", isOwn: false },
    ],
  },
  {
    id: 2,
    name: "Михаил Петров",
    avatar: "МП",
    lastMessage: "Отправил документы",
    time: "11:15",
    unread: 0,
    online: false,
    messages: [
      { id: 1, text: "Добрый день! Нужны документы по проекту.", time: "10:00", isOwn: true },
      { id: 2, text: "Конечно, сейчас подготовлю.", time: "10:45", isOwn: false },
      { id: 3, text: "Отправил документы", time: "11:15", isOwn: false },
    ],
  },
  {
    id: 3,
    name: "Команда Дизайн",
    avatar: "КД",
    lastMessage: "Макеты готовы к review",
    time: "09:40",
    unread: 5,
    online: true,
    messages: [
      { id: 1, text: "Всем привет! Начинаем работу над новым проектом", time: "09:00", isOwn: false },
      { id: 2, text: "Отлично, жду брифа", time: "09:15", isOwn: true },
      { id: 3, text: "Макеты готовы к review", time: "09:40", isOwn: false },
    ],
  },
  {
    id: 4,
    name: "Елена Козлова",
    avatar: "ЕК",
    lastMessage: "Спасибо за помощь!",
    time: "Вчера",
    unread: 0,
    online: false,
    messages: [
      { id: 1, text: "Можешь помочь с презентацией?", time: "Вчера 16:00", isOwn: false },
      { id: 2, text: "Конечно, давай посмотрим вместе", time: "Вчера 16:10", isOwn: true },
      { id: 3, text: "Спасибо за помощь!", time: "Вчера 18:30", isOwn: false },
    ],
  },
  {
    id: 5,
    name: "Дмитрий Новиков",
    avatar: "ДН",
    lastMessage: "Ок, понял",
    time: "Вчера",
    unread: 0,
    online: true,
    messages: [
      { id: 1, text: "Встреча перенесена на пятницу", time: "Вчера 14:00", isOwn: true },
      { id: 2, text: "Ок, понял", time: "Вчера 14:05", isOwn: false },
    ],
  },
];

export default function Index() {
  const [section, setSection] = useState<Section>("chats");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(initialChats[0]);
  const [chats, setChats] = useState<Chat[]>(initialChats);

  const handleSendMessage = (text: string) => {
    if (!selectedChat || !text.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const newMessage: Message = { id: Date.now(), text, time, isOwn: true };

    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id
          ? { ...c, messages: [...c.messages, newMessage], lastMessage: text, time }
          : c
      )
    );
    setSelectedChat((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMessage], lastMessage: text, time } : prev
    );
  };

  const handleSelectChat = (chat: Chat) => {
    const updated = { ...chat, unread: 0 };
    setSelectedChat(updated);
    setChats((prev) => prev.map((c) => (c.id === chat.id ? updated : c)));
    setSection("chats");
  };

  return (
    <div className="messenger-root">
      <Sidebar section={section} onSectionChange={setSection} />

      <div className="messenger-panel">
        {section === "chats" && (
          <ChatList chats={chats} selectedId={selectedChat?.id} onSelect={handleSelectChat} />
        )}
        {section === "contacts" && <ContactsPanel />}
        {section === "search" && <SearchPanel chats={chats} onSelect={handleSelectChat} />}
        {section === "notifications" && <NotificationsPanel />}
        {section === "profile" && <ProfilePanel />}
        {section === "settings" && <SettingsPanel />}
      </div>

      <div className="messenger-main">
        {section === "chats" && selectedChat ? (
          <ChatWindow chat={selectedChat} onSend={handleSendMessage} />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <p>Выберите чат для начала общения</p>
          </div>
        )}
      </div>
    </div>
  );
}
