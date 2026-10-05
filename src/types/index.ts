// Общие типы для авторизации
export interface AuthCredentials {
  idInstance: string
  apiTokenInstance: string
}

// Тип сообщения
export interface Message {
  sender: 'me' | 'them'
  text: string
  idMessage?: string
}

// Статус соединения
export type ConnectionStatus = 'connected' | 'checking' | 'error'

// Типизация структуры ответа от Green-API receiveNotification
export interface GreenApiResponse {
  receiptId?: number
  body?: {
    typeWebhook?: string
    idMessage?: string
    senderData?: {
      chatType?: string
      senderPhoneNumber?: string
      chatId?: string
    }
    messageData?: {
      typeMessage?: string
      textMessageData?: {
        textMessage?: string
      }
      extendedTextMessageData?: {
        text?: string
      }
      reactionMessageData?: {
        reaction?: string
      }
    }
  }
}

// Ответ метода SendMessage
export interface SendMessageResponse {
  idMessage?: string
  message?: string
}
