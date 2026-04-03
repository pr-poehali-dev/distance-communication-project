import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "@/components/messenger/Sidebar";
import ChatList from "@/components/messenger/ChatList";
import ChatWindow from "@/components/messenger/ChatWindow";
import ContactsPanel from "@/components/messenger/ContactsPanel";
import SearchPanel from "@/components/messenger/SearchPanel";
import NotificationsPanel from "@/components/messenger/NotificationsPanel";
import ProfilePanel from "@/components/messenger/ProfilePanel";
import SettingsPanel from "@/components/messenger/SettingsPanel";
import LoginScreen from "@/components/messenger/LoginScreen";

export type Section = "chats" | "contacts" | "search" | "notifications" | "profile" | "settings";

export interface Message {
  id: number;
  text: string;
  time: string;
  isOwn: boolean;
  user_id?: number;
}

export interface Chat {
  id: number;
  partner_id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

export interface User {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
}

const API = "https://functions.poehali.dev/9f280544-a639-42f8-8565-369a791d00e0";

function fmtTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
  return "Вчера";
}

export default function Index() {
  const [user, setUser] = useState<User | null>(() => {
    const s = localStorage.getItem("m_user");
    return s ? JSON.parse(s) : null;
  });
  const [section, setSection] = useState<Section>("chats");
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const lastMsgId = useRef<number>(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadChats = useCallback(async (uid: number) => {
    const r = await fetch(`${API}?action=chats&user_id=${uid}`);
    const data = await r.json();
    if (data.chats) {
      type RawChat = {id:number;partner_id:number;name:string;avatar:string;last_message:string;last_time:string;unread:number};
      setChats((prev) => data.chats.map((c: RawChat) => {
        const existing = prev.find((p) => p.id === c.id);
        return {
          id: c.id,
          partner_id: c.partner_id,
          name: c.name,
          avatar: c.avatar,
          lastMessage: c.last_message || "",
          time: fmtTime(c.last_time),
          unread: Number(c.unread) || 0,
          online: false,
          messages: existing?.messages || [],
        };
      }));
    }
  }, []);

  const loadMessages = useCallback(async (chatId: number, uid: number, after = 0) => {
    const url = after
      ? `${API}?action=messages&chat_id=${chatId}&after=${after}`
      : `${API}?action=messages&chat_id=${chatId}`;
    const r = await fetch(url);
    const data = await r.json();
    if (!data.messages) return [];
    type RawMsg = {id:number;text:string;user_id:number;created_at:string};
    return data.messages.map((m: RawMsg) => ({
      id: m.id,
      text: m.text,
      time: fmtTime(m.created_at),
      isOwn: m.user_id === uid,
      user_id: m.user_id,
    }));
  }, []);

  const loadUsers = useCallback(async () => {
    const r = await fetch(`${API}?action=users`);
    const data = await r.json();
    if (data.users) setAllUsers(data.users);
  }, []);

  useEffect(() => {
    if (!user) return;
    loadChats(user.id);
    loadUsers();
  }, [user, loadChats, loadUsers]);

  useEffect(() => {
    if (!user || !selectedChat) return;
    if (pollRef.current) clearInterval(pollRef.current);

    const poll = async () => {
      const newMsgs = await loadMessages(selectedChat.id, user.id, lastMsgId.current);
      if (newMsgs.length > 0) {
        lastMsgId.current = newMsgs[newMsgs.length - 1].id;
        setSelectedChat((prev) => prev ? { ...prev, messages: [...prev.messages, ...newMsgs] } : prev);
        setChats((prev) => prev.map((c) =>
          c.id === selectedChat.id
            ? { ...c, lastMessage: newMsgs[newMsgs.length - 1].text, time: newMsgs[newMsgs.length - 1].time }
            : c
        ));
      }
    };
    pollRef.current = setInterval(poll, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedChat?.id, user]);

  const handleSelectChat = useCallback(async (chat: Chat) => {
    if (!user) return;
    lastMsgId.current = 0;
    const msgs = await loadMessages(chat.id, user.id);
    if (msgs.length > 0) lastMsgId.current = msgs[msgs.length - 1].id;
    const updated = { ...chat, messages: msgs, unread: 0 };
    setSelectedChat(updated);
    setChats((prev) => prev.map((c) => c.id === chat.id ? { ...c, unread: 0 } : c));
    setSection("chats");
  }, [user, loadMessages]);

  const handleStartChat = useCallback(async (target: User) => {
    if (!user) return;
    const r = await fetch(`${API}?action=chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, target_id: target.id }),
    });
    const data = await r.json();
    if (data.chat_id) {
      await loadChats(user.id);
      const chatItem: Chat = {
        id: data.chat_id,
        partner_id: target.id,
        name: target.display_name,
        avatar: target.avatar,
        lastMessage: "",
        time: "",
        unread: 0,
        online: false,
        messages: [],
      };
      handleSelectChat(chatItem);
    }
  }, [user, loadChats, handleSelectChat]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!selectedChat || !user || !text.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
    const tempMsg: Message = { id: Date.now(), text, time, isOwn: true };

    setSelectedChat((prev) => prev ? { ...prev, messages: [...prev.messages, tempMsg] } : prev);
    setChats((prev) => prev.map((c) =>
      c.id === selectedChat.id ? { ...c, lastMessage: text, time } : c
    ));

    const r = await fetch(`${API}?action=messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: selectedChat.id, user_id: user.id, text }),
    });
    const data = await r.json();
    if (data.message) {
      lastMsgId.current = data.message.id;
      setSelectedChat((prev) => {
        if (!prev) return prev;
        return { ...prev, messages: prev.messages.map((m) => m.id === tempMsg.id ? { ...m, id: data.message.id } : m) };
      });
    }
  }, [selectedChat, user]);

  const handleLogin = useCallback(async (username: string, displayName: string) => {
    const r = await fetch(`${API}?action=auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, display_name: displayName }),
    });
    const data = await r.json();
    if (data.user) {
      localStorage.setItem("m_user", JSON.stringify(data.user));
      setUser(data.user);
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("m_user");
    setUser(null);
    setChats([]);
    setSelectedChat(null);
  }, []);

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="messenger-root">
      <Sidebar section={section} onSectionChange={setSection} />

      <div className="messenger-panel">
        {section === "chats" && (
          <ChatList chats={chats} selectedId={selectedChat?.id} onSelect={handleSelectChat} />
        )}
        {section === "contacts" && (
          <ContactsPanel users={allUsers} currentUserId={user.id} onStartChat={handleStartChat} />
        )}
        {section === "search" && <SearchPanel chats={chats} onSelect={handleSelectChat} />}
        {section === "notifications" && <NotificationsPanel />}
        {section === "profile" && <ProfilePanel user={user} />}
        {section === "settings" && <SettingsPanel onLogout={handleLogout} />}
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