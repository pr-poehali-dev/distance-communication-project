import { Chat } from "@/pages/Index";

interface ChatListProps {
  chats: Chat[];
  selectedId?: number;
  onSelect: (chat: Chat) => void;
}

export default function ChatList({ chats, selectedId, onSelect }: ChatListProps) {
  return (
    <div className="panel-inner">
      <div className="panel-header">
        <h2>Чаты</h2>
        <span className="panel-count">{chats.length}</span>
      </div>
      <div className="chat-list">
        {chats.map((chat) => (
          <button
            key={chat.id}
            className={`chat-item ${selectedId === chat.id ? "active" : ""}`}
            onClick={() => onSelect(chat)}
          >
            <div className="chat-avatar-wrap">
              <div className="chat-avatar">{chat.avatar}</div>
              {chat.online && <span className="online-dot" />}
            </div>
            <div className="chat-info">
              <div className="chat-row">
                <span className="chat-name">{chat.name}</span>
                <span className="chat-time">{chat.time}</span>
              </div>
              <div className="chat-row">
                <span className="chat-last">{chat.lastMessage}</span>
                {chat.unread > 0 && (
                  <span className="unread-badge">{chat.unread}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
