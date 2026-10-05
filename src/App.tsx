import { useState } from 'react'
import { LoginScreen } from './components/components/LoginScreen/LoginScreen.tsx'
import { Messenger } from './components/Messenger/Messenger.tsx'
import type { AuthCredentials } from './types/index.ts'

export function App() {
  // Инициализируем authData из localStorage
  const [authData, setAuthData] = useState<AuthCredentials | null>(() => {
    const id = localStorage.getItem('green_idInstance')
    const token = localStorage.getItem('green_apiTokenInstance')
    if (id && token) {
      return { idInstance: id, apiTokenInstance: token }
    }
    return null
  })

  // Функция входа
  const handleLogin = (idInstance: string, apiTokenInstance: string) => {
    localStorage.setItem('green_idInstance', idInstance)
    localStorage.setItem('green_apiTokenInstance', apiTokenInstance)
    setAuthData({ idInstance, apiTokenInstance })
  }

  // Функция выхода (очищает localStorage)
  const handleLogout = () => {
    localStorage.removeItem('green_idInstance')
    localStorage.removeItem('green_apiTokenInstance')
    localStorage.removeItem('green_chats')
    localStorage.removeItem('green_messagesMap')
    setAuthData(null)
  }

  if (!authData) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <Messenger
      idInstance={authData.idInstance}
      apiTokenInstance={authData.apiTokenInstance}
      onLogout={handleLogout}
    />
  )
}

export default App
