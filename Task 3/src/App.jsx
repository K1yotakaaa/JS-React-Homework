import { useState } from 'react'
import { STATUSES, seedCharacters } from './data'
import PartyHUD from './components/PartyHUD'
import AddCharacterForm from './components/AddCharacterForm'
import Toolbar from './components/Toolbar'
import CharacterList from './components/CharacterList'

export default function App() {
  const [characters, setCharacters] = useState(seedCharacters)
  const [statusFilter, setStatusFilter] = useState('All')
  const [reversed, setReversed] = useState(false)
  const [buggyKeys, setBuggyKeys] = useState(false)

  console.log('Rendering App, characters:', characters.length)

  const addCharacter = (char) => setCharacters((prev) => [...prev, { ...char, id: crypto.randomUUID(), resetCount: 0 }])
  const removeCharacter = (id) => setCharacters((prev) => prev.filter((c) => c.id !== id))
  const changeStatus = (id, status) => setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  const resetCharacter = (id) => setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, resetCount: c.resetCount + 1 } : c)))

  let visible = statusFilter === 'All' ? characters : characters.filter((c) => c.status === statusFilter)
  if (reversed) visible = [...visible].reverse()

  return (
    <div className="hall">
      <header className="banner">
        <div className="banner-top">
          <div>
            <h1 className="sign">⚔️ Guild Roster</h1>
            <p className="tagline">Manage your party. Heal them, hurt them, promote them to legend.</p>
          </div>
          <PartyHUD characters={characters} />
        </div>
        <AddCharacterForm onAdd={addCharacter} />
      </header>

      <Toolbar
        statusFilter={statusFilter} onFilterChange={setStatusFilter} statuses={STATUSES}
        reversed={reversed} onToggleReverse={() => setReversed((r) => !r)}
        buggyKeys={buggyKeys} onToggleBuggyKeys={() => setBuggyKeys((b) => !b)}
        visibleCount={visible.length} total={characters.length}
      />

      {visible.length === 0 ? (
        <p className="empty">No adventurers match this filter.</p>
      ) : (
        <CharacterList
          characters={visible} buggyKeys={buggyKeys}
          onRemove={removeCharacter} onStatusChange={changeStatus} onReset={resetCharacter}
        />
      )}
    </div>
  )
}