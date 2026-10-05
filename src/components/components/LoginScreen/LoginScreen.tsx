import React, { useState } from 'react'
import type { AuthCredentials } from '../../../types/index.ts'

interface LoginScreenProps {
  onLogin: (credentials: AuthCredentials) => void
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [idInstance, setIdInstance] = useState<string>('')
  const [apiTokenInstance, setApiTokenInstance] = useState<string>('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (idInstance.trim() && apiTokenInstance.trim()) {
      onLogin({
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
      })
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#111b21] text-[#e9edef]">
      <div className="w-full max-w-md rounded-lg bg-[#202c33] p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-semibold text-center">
          Авторизация GREEN-API
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#8696a0] mb-1">
              idInstance
            </label>
            <input
              type="text"
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              placeholder="Введите idInstance"
              className="w-full rounded bg-[#2a3942] px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8696a0] mb-1">
              apiTokenInstance
            </label>
            <input
              type="password"
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              placeholder="Введите apiTokenInstance"
              className="w-full rounded bg-[#2a3942] px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-[#00a884] py-2 font-semibold text-white transition hover:bg-[#008f72]"
          >
            Войти в мессенджер
          </button>
        </form>
      </div>
    </div>
  )
}
