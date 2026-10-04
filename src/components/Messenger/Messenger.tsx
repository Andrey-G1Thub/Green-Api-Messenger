import React, { useEffect, useState, useRef } from 'react'

interface MessengerProps {
  idInstance: string
  apiTokenInstance: string
  onLogout: () => void
}

interface Message {
  sender: 'me' | 'them'
  text: string
}

export const Messenger: React.FC<MessengerProps> = ({
  idInstance,
  apiTokenInstance,
  onLogout,
}) => {
  const [chats, setChats] = useState<string[]>([])
  const [newPhone, setNewPhone] = useState('')
  const [activeChat, setActiveChat] = useState<string | null>(null)

  // Храним сообщения отдельно для каждого чата: ключ — номер телефона, значение — массив сообщений
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({})

  const [inputText, setInputText] = useState('')

  // Функция добавления нового чата с автодобавлением @c.us если нужно
  const handleAddChat = (e: React.FormEvent) => {
    e.preventDefault()
    let phone = newPhone.trim()
    if (!phone) return

    // Если пользователь не написал @c.us, добавим его автоматически
    if (!phone.includes('@')) {
      phone = `${phone}@c.us`
    }

    if (!chats.includes(phone)) {
      setChats([...chats, phone])
      setActiveChat(phone)
      if (!messagesMap[phone]) {
        setMessagesMap((prev) => ({ ...prev, [phone]: [] }))
      }
      setNewPhone('')
    }
  }

  // Функция отправки сообщения через green-api
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !activeChat) return

    const textToSend = inputText.trim()
    setInputText('')

    try {
      // 1. Формируем URL для метода SendMessage
      const url = `https://api.green-api.com/waInstance${idInstance}/SendMessage/${apiTokenInstance}`

      // 2. Отправляем POST-запрос на сервер GREEN-API
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: activeChat,
          message: textToSend,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Если сервер GREEN-API успешно принял сообщение, добавляем его в наш локальный чат
        setMessagesMap((prev) => {
          const currentMessages = prev[activeChat] || []
          return {
            ...prev,
            [activeChat]: [
              ...currentMessages,
              { sender: 'me', text: textToSend },
            ],
          }
        })
        console.log('Сообщение успешно отправлено:', data)
      } else {
        console.error('Ошибка от GREEN-API:', data)
        alert(
          `Ошибка отправки: ${data.message || 'Не удалось отправить сообщение'}`,
        )
      }
    } catch (error) {
      console.error('Ошибка сети:', error)
      alert('Произошла ошибка сети при отправке запроса')
    }
  }

  const isFetchingRef = useRef(false)  

  // Фоновый процесс (Polling) для получения входящих сообщений
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true

      try {
        const receiveUrl = `https://api.green-api.com/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`
        const response = await fetch(receiveUrl)

        if (!response.ok) {
          return
        }

        const text = await response.text()
        if (!text) {
          return
        }

        const data = JSON.parse(text)
        console.log('Ответ от receiveNotification:', data)

        if (!data) {
          return
        }

        const { receiptId, body } = data

        // Проверяем входящее сообщение
        if (body && body.typeWebhook === 'incomingMessageReceived') {
          const senderData = body.senderData
          const messageData = body.messageData

          // Если это сообщение из личного чата (фильтруем по chatType === 'user')
          if (senderData && senderData.chatType === 'user') {
            const rawChatId = senderData?.chatId
            const phoneNum = senderData?.senderPhoneNumber
            const chatId = phoneNum ? `${phoneNum}@c.us` : rawChatId

            const messageId = body.idMessage

            const textMessage =
              messageData?.textMessageData?.textMessage ||
              messageData?.extendedTextMessageData?.text ||
              (messageData?.typeMessage === 'reactionMessage'
                ? `Реакция: ${messageData?.reactionMessageData?.reaction || '👍'}`
                : '')

            if (chatId && textMessage && messageId) {
              // 1. Добавляем чат в список слева, если его нет
              setChats((prevChats) => {
                if (!prevChats.includes(chatId)) {
                  return [...prevChats, chatId]
                }
                return prevChats
              })

              // 2. Добавляем сообщение с обязательным сохранением idMessage для защиты от дублей
              setMessagesMap((prev) => {
                const currentMessages = prev[chatId] || []
                const isAlreadyExists = currentMessages.some(
                  (msg: any) => msg.idMessage === messageId,
                )

                if (isAlreadyExists) return prev

                return {
                  ...prev,
                  [chatId]: [
                    ...currentMessages,
                    { sender: 'them', text: textMessage, idMessage: messageId },
                  ],
                }
              })
            }
          }
        }

        // 3. Удаляем уведомление из очереди GREEN-API
        if (receiptId) {
          const deleteUrl = `https://api.green-api.com/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`
          await fetch(deleteUrl, { method: 'DELETE' })
        }
      } catch (error) {
        console.error('Ошибка при получении уведомлений:', error)
      } finally {
        isFetchingRef.current = false
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [idInstance, apiTokenInstance])

  // Получаем сообщения только для текущего активного чата
  const currentMessages = activeChat ? messagesMap[activeChat] || [] : []

  return (
    <div className="flex h-screen w-screen bg-[#111b21] text-[#e9edef] overflow-hidden">
      {/* Левая колонка: Сайдбар (Список чатов) */}
      <div className="w-1/3 border-r border-[#222d34] flex flex-col bg-[#111b21]">
        <div className="p-4 bg-[#202c33] flex justify-between items-center">
          <span className="text-sm text-[#8696a0]">
            idInstance: {idInstance}
          </span>
          <button
            onClick={onLogout}
            className="text-xs bg-[#2a3942] hover:bg-[#374248] px-3 py-1.5 rounded transition text-[#8696a0] hover:text-white"
          >
            Выйти
          </button>
        </div>

        <form
          onSubmit={handleAddChat}
          className="p-3 bg-[#111b21] border-b border-[#222d34] flex gap-2"
        >
          <input
            type="text"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Введите номер (например, 79001234567)"
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
                  <div className="text-xs text-[#8696a0]">
                    {messagesMap[chat]?.[messagesMap[chat].length - 1]?.text ||
                      'Нет сообщений'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Правая колонка: Область чата */}
      <div className="w-2/3 flex flex-col bg-[#0b141a]">
        {activeChat ? (
          <>
            <div className="p-4 bg-[#202c33] border-b border-[#222d34] flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#667781] flex items-center justify-center font-bold text-white mr-3">
                {activeChat[0]}
              </div>
              <div className="font-medium text-white">Чат с: {activeChat}</div>
            </div>

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
            </div>

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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#8696a0]">
            Выберите чат слева или добавьте новый номер, чтобы начать общение
          </div>
        )}
      </div>
    </div>
  )
}
