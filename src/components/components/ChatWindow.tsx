import React, { useEffect, useRef } from 'react'
import type { Message } from '../../types/index.ts'

interface ChatWindowProps {
  activeChat: string | null
  currentMessages: Message[]
  inputText: string
  setInputText: (value: string) => void
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  activeChat,
  currentMessages,
  inputText,
  setInputText,
  handleSendMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages, activeChat])

  if (!activeChat) {
    return (
      <div className="w-2/3 flex items-center justify-center text-[#8696a0] bg-[#0b141a]">
        Выберите чат слева или добавьте новый номер, чтобы начать общение
      </div>
    )
  }
  return (
    //  Правая колонка: Область чата
    <div className="w-2/3 flex flex-col bg-[#0b141a]">
      {/* Шапка чата */}
      <div className="px-4 h-16 bg-[#202c33] border-b border-[#222d34] flex items-center shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#667781] flex items-center justify-center font-bold text-white mr-3">
          {activeChat[0]}
        </div>
        <div className="font-medium text-white">Чат с: {activeChat}</div>
      </div>

      {/* История сообщений */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col">
        {currentMessages.length === 0 ? (
          <div className="text-center text-[#8696a0] my-auto text-sm">
            В этом чате пока нет сообщений. Напишите первое!
          </div>
        ) : (
          currentMessages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[60%] rounded-lg p-3 text-sm break-words ${
                msg.sender === 'me'
                  ? 'bg-[#005c4b] text-white self-end rounded-tr-none'
                  : 'bg-[#202c33] text-white self-start rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Форма ввода сообщения */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-[#202c33] flex gap-2 items-center"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Введите сообщение..."
          className="flex-1 rounded-lg bg-[#2a3942] px-4 py-2.5 text-sm text-white focus:outline-none"
        />
        <button
          type="submit"
          className="bg-[#00a884] hover:bg-[#008f72] px-5 py-2.5 rounded-lg text-sm font-semibold transition text-white shrink-0"
        >
          Отправить
        </button>
      </form>
    </div>
  )
}
