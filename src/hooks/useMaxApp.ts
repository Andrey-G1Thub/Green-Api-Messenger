import { useState, useEffect, useRef } from 'react'

export interface Message {
  sender: 'me' | 'them'
  text: string
  idMessage?: string
}

// Вспомогательная функция для чтения из localStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Ошибка чтения ${key} из localStorage:`, error)
    return defaultValue
  }
}

export const useMaxApp = (idInstance: string, apiTokenInstance: string) => {
  //   Инициализируем стейт из localStorage
  const [chats, setChats] = useState<string[]>(() =>
    getStorageItem<string[]>('green_chats', []),
  )
  const [newPhone, setNewPhone] = useState('')
  const [activeChat, setActiveChat] = useState<string | null>(() => {
    const savedChats = getStorageItem<string[]>('green_chats', [])
    return savedChats.length > 0 ? savedChats[0] : null
  })

  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(
    () => getStorageItem<Record<string, Message[]>>('green_messagesMap', {}),
  )

  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'checking' | 'error'
  >('connected')
  const [inputText, setInputText] = useState('')
  const isFetchingRef = useRef(false)



  //   Эффекты для сохранения изменений в localStorage
  useEffect(() => {
    localStorage.setItem('green_chats', JSON.stringify(chats))
  }, [chats])

  useEffect(() => {
    localStorage.setItem('green_messagesMap', JSON.stringify(messagesMap))
  }, [messagesMap])

  // Функция добавления нового чата
  const handleAddChat = (e: React.FormEvent) => {
    e.preventDefault()
    let phone = newPhone.trim()
    if (!phone) return

    if (!phone.includes('@')) {
      phone = `${phone}@c.us`
    }

    if (!chats.includes(phone)) {
      const updatedChats = [...chats, phone]
      setChats(updatedChats)
      setActiveChat(phone)
      if (!messagesMap[phone]) {
        setMessagesMap((prev) => ({ ...prev, [phone]: [] }))
      }
      setNewPhone('')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !activeChat) return

    const textToSend = inputText.trim()
    setInputText('')

    try {
      const url = `https://api.green-api.com/waInstance${idInstance}/SendMessage/${apiTokenInstance}`

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

  // Фоновый процесс (Polling) для получения входящих сообщений
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true

      setConnectionStatus('checking')

      try {
        const receiveUrl = `https://api.green-api.com/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`
        const response = await fetch(receiveUrl)

        if (!response.ok) {
          setConnectionStatus('error')
          return
        }

        const text = await response.text()
        if (!text) {
          setConnectionStatus('connected')
          return
        }

        const data = JSON.parse(text)
        if (!data) {
          setConnectionStatus('connected')
          return
        }

        setConnectionStatus('connected')
        console.log('Ответ от receiveNotification:', data)

        const { receiptId, body } = data

        if (receiptId) {
          const deleteUrl = `https://api.green-api.com/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`
          await fetch(deleteUrl, { method: 'DELETE' })
        }

        if (body && body.typeWebhook === 'incomingMessageReceived') {
          const senderData = body.senderData
          const messageData = body.messageData
          console.log(
            ' Пришло входящее от:',
            senderData?.chatType,
            senderData?.senderPhoneNumber,
          )

          if (senderData && senderData.chatType === 'user') {
            console.log(' Это личное сообщение! Данные:', body)
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
              setChats((prevChats) => {
                if (!prevChats.includes(chatId)) {
                  return [...prevChats, chatId]
                }
                return prevChats
              })

              setMessagesMap((prev) => {
                const currentMessages = prev[chatId] || []
                const isAlreadyExists = currentMessages.some(
                  (msg) => msg.idMessage === messageId,
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
      } catch (error) {
        console.error('Ошибка при получении уведомлений:', error)
        setConnectionStatus('error')
      } finally {
        isFetchingRef.current = false
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [idInstance, apiTokenInstance])

  return {
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
  }
}
