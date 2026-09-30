import { useState } from 'react'
import { STATUSES, CLASS_ICON, STATUS_ICON } from '../data'

export default function CharacterCard({ character, onRemove, onStatusChange, onReset }) {
  const [hp, setHp] = useState(100)
  const [expanded, setExpanded] = useState(false)

  console.log(`Rendering card: ${character.name} (hp=${hp})`)

  const heal = () => setHp((h) => Math.min(100, h + 10))
  const hit = () => setHp((h) => Math.max(0, h - 10))
  const critical = hp > 0 && hp <= 30
  const fallen = hp === 0
  const avatar = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(character.name)}`

  return (
    <article
      data-class={character.class}
      className={`card rank-${character.status.toLowerCase()} ${critical ? 'critical' : ''} ${fallen ? 'fallen' : ''}`}
    >
      <span className="level-gem">{character.level}</span>
      <span className="ribbon">{STATUS_ICON[character.status]} {character.status}</span>

      <div className="card-top">
        <div className="avatar-ring"><img className="avatar" src={avatar} alt={character.name} /></div>
        <div>
          <h3>{character.name}</h3>
          <p className="sub">{CLASS_ICON[character.class]} {character.class}</p>
        </div>
      </div>

      {fallen && <p className="fallen-msg">💀 Fallen — heal to revive</p>}

      <div className="hp-row">
        <div className="hp-bar"><span style={{ width: `${hp}%` }} /></div>
        <span className="hp-num">{hp} HP</span>
      </div>
      <div className="hp-buttons">
        <button onClick={hit} disabled={fallen}>⚔️ Hit</button>
        <button onClick={heal} disabled={hp === 100}>✨ Heal</button>
      </div>

      <select value={character.status} onChange={(e) => onStatusChange(character.id, e.target.value)}>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <button className="expand" onClick={() => setExpanded((v) => !v)}>
        {expanded ? '▲ Hide details' : '▼ Show details'}
      </button>
      {expanded && (
        <p className="details">
          {character.name} has survived {character.level} levels of battle. Condition: {fallen ? 'unconscious' : critical ? 'barely standing' : 'steady'}.
        </p>
      )}

      <div className="card-actions">
        <button className="reset" onClick={() => onReset(character.id)}>↺ Reset</button>
        <button className="remove" onClick={() => onRemove(character.id)}>✕ Dismiss</button>
      </div>
    </article>
  )
}