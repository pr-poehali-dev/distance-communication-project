import { useState, useRef, useEffect } from "react";
import { Chat } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface ChatWindowProps {
  chat: Chat;
  onSend: (text: string) => void;
}

export default function ChatWindow({ chat, onSend }: ChatWindowProps) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-avatar-wrap">
          <div className="chat-avatar sm">{chat.avatar}</div>
          {chat.online && <span className="online-dot" />}
        </div>
        <div className="chat-window-info">
          <span className="chat-window-name">{chat.name}</span>
          <span className="chat-window-status">{chat.online ? "В сети" : "Не в сети"}</span>
        </div>
        <div className="chat-window-actions">
          <button className="icon-btn"><Icon name="Phone" size={18} /></button>
          <button className="icon-btn"><Icon name="Video" size={18} /></button>
          <button className="icon-btn"><Icon name="MoreHorizontal" size={18} /></button>
        </div>
      </div>

      <div className="messages-area">
        {chat.messages.map((msg) => (
          <div key={msg.id} className={`message-wrap ${msg.isOwn ? "own" : ""}`}>
            <div className={`message-bubble ${msg.isOwn ? "own" : ""}`}>
              <p>{msg.text}</p>
              <span className="message-time">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="input-area">
        <button className="icon-btn"><Icon name="Paperclip" size={18} /></button>
        <textarea
          className="msg-input"
          placeholder="Напишите сообщение..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <button className="send-btn" onClick={handleSend} disabled={!text.trim()}>
          <Icon name="Send" size={18} />
        </button>
      </div>
    </div>
  );
}
