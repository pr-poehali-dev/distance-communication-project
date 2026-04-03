import { useState } from "react";
import { Chat } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface SearchPanelProps {
  chats: Chat[];
  onSelect: (chat: Chat) => void;
}

export default function SearchPanel({ chats, onSelect }: SearchPanelProps) {
  const [query, setQuery] = useState("");

  const results = query.trim()
    ? chats.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.messages.some((m) => m.text.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="panel-inner">
      <div className="panel-header">
        <h2>Поиск</h2>
      </div>
      <div className="search-box">
        <Icon name="Search" size={16} />
        <input
          className="search-input"
          placeholder="Поиск по чатам и сообщениям..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      {query && (
        <div className="chat-list">
          {results.length === 0 ? (
            <p className="empty-text">Ничего не найдено</p>
          ) : (
            results.map((chat) => (
              <button key={chat.id} className="chat-item" onClick={() => onSelect(chat)}>
                <div className="chat-avatar">{chat.avatar}</div>
                <div className="chat-info">
                  <span className="chat-name">{chat.name}</span>
                  <span className="chat-last">{chat.lastMessage}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
      {!query && (
        <p className="empty-text">Начните вводить для поиска</p>
      )}
    </div>
  );
}
