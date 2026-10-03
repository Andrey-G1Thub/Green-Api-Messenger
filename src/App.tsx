import { useState } from 'react'
import { LoginScreen } from './components/LoginScreen/LoginScreen.tsx'
import { Messenger } from './components/Messenger/Messenger.tsx'

export function App() {
  const [authData, setAuthData] = useState<{
    idInstance: string
    apiTokenInstance: string
  } | null>(null)

  if (!authData) {
    return (
      <LoginScreen
        onLogin={(idInstance, apiTokenInstance) =>
          setAuthData({ idInstance, apiTokenInstance })
        }
      />
    )
  }

  return (
    <Messenger
      idInstance={authData.idInstance}
      apiTokenInstance={authData.apiTokenInstance}
      onLogout={() => setAuthData(null)}
    />
  )
}

export default App
