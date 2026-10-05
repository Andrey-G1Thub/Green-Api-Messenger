import React from 'react'
import { useMaxApp } from '../../hooks/useMaxApp'
import { Sidebar } from '../components/Sidebar'
import { ChatWindow } from '../components/ChatWindow'

interface MessengerProps {
  idInstance: string
  apiTokenInstance: string
  onLogout: () => void
}

export const Messenger: React.FC<MessengerProps> = ({
  idInstance,
  apiTokenInstance,
  onLogout,
}) => {
  const {
    chats,
    newPhone,
    setNewPhone,
    activeChat,
    setActiveChat,
    messagesMap,
    connectionStatus,
    inputText,
    setInputText,
    handleAddChat,
    handleSendMessage,
  } = useMaxApp(idInstance, apiTokenInstance)

  const currentMessages = activeChat ? messagesMap[activeChat] || [] : []

  return (
    <div className="flex h-screen w-screen bg-[#111b21] text-[#e9edef] overflow-hidden">
      {/* Левая колонка: Сайдбар (Список чатов) */}
      <Sidebar
        idInstance={idInstance}
        connectionStatus={connectionStatus}
        chats={chats}
        activeChat={activeChat}
        newPhone={newPhone}
        messagesMap={messagesMap}
        setNewPhone={setNewPhone}
        setActiveChat={setActiveChat}
        handleAddChat={handleAddChat}
        onLogout={onLogout}
      />

      {/* Правая колонка*/}
      <ChatWindow
        activeChat={activeChat}
        currentMessages={currentMessages}
        inputText={inputText}
        setInputText={setInputText}
        handleSendMessage={handleSendMessage}
      />
    </div>
  )
}
