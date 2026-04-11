import { useState } from 'react'

const KEY = 'eduplay_player_name'

export function usePlayer() {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem(KEY) || '')

  const saveName = (name) => {
    localStorage.setItem(KEY, name)
    setPlayerName(name)
  }

  const clearName = () => {
    localStorage.removeItem(KEY)
    setPlayerName('')
  }

  return { playerName, saveName, clearName }
}
