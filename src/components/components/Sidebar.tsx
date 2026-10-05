import React from 'react'
import type { Message } from '../../types/index.ts'

interface SidebarProps {
  idInstance: string
  connectionStatus: 'connected' | 'checking' | 'error'
  chats: string[]
  activeChat: string | null
  newPhone: string
  messagesMap: Record<string, Message[]>
  setNewPhone: (value: string) => void
  setActiveChat: (chat: string) => void
  handleAddChat: (e: React.FormEvent<HTMLFormElement>) => void
  onLogout: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  idInstance,
  connectionStatus,
  chats,
  activeChat,
  newPhone,
  messagesMap,
  setNewPhone,
  setActiveChat,
  handleAddChat,
  onLogout,
}) => {
  return (
    // Левая колонка: Сайдбар (Список чатов)
    <div className="w-1/3 border-r border-[#222d34] flex flex-col bg-[#111b21]">
      <div className="px-4 h-16 bg-[#202c33] flex justify-between items-center shrink-0 border-b border-[#222d34]">
        {/* Индикатор статуса соединения  */}
        <div className="flex items-center gap-2 py-1.5  rounded-full text-xs">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              connectionStatus === 'connected'
                ? 'bg-[#00a884] animate-pulse'
                : connectionStatus === 'checking'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
          />
          <span className="text-[#8696a0]">
            {connectionStatus === 'connected' && 'Подключено'}
            {connectionStatus === 'checking' && 'Синхронизация...'}
            {connectionStatus === 'error' && 'Ошибка связи'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8696a0] truncate max-w-[140px]">
            id: {idInstance}
          </span>

          <button
            onClick={onLogout}
            className="text-xs bg-[#2a3942] hover:bg-[#374248] px-3 py-1.5 rounded transition text-[#8696a0] hover:text-white shrink-0"
          >
            Выйти
          </button>
        </div>
      </div>

      <form
        onSubmit={handleAddChat}
        className="p-3 bg-[#111b21] border-b border-[#222d34] flex gap-2"
      >
        <input
          type="text"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          placeholder="Введите номер (7900...)"
          className="flex-1 rounded bg-[#2a3942] px-3 py-1.5 text-sm text-white focus:outline-none"
        />
        <button
          type="submit"
          className="bg-[#00a884] hover:bg-[#008f72] px-4 py-1.5 rounded text-sm font-semibold transition"
        >
          Добавить
        </button>
      </form>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-sm text-[#8696a0]">
            Нет активных чатов. Добавьте номер выше.
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat}
              onClick={() => setActiveChat(chat)}
              className={`p-3.5 flex items-center cursor-pointer border-b border-[#222d34]/50 transition ${
                activeChat === chat ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]/50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#667781] flex items-center justify-center font-bold text-white mr-3 shrink-0">
                {chat[0]}
              </div>
              <div className="truncate">
                <div className="font-medium text-white">{chat}</div>
                <div className="text-xs text-[#8696a0] truncate">
                  {messagesMap[chat]?.[messagesMap[chat].length - 1]?.text ||
                    'Нет сообщений'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
