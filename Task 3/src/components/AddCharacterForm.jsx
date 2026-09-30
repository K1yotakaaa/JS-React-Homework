import { useState } from 'react'
import { STATUSES, CLASS_ICON } from '../data'

const classes = Object.keys(CLASS_ICON)

export default function AddCharacterForm({ onAdd }) {
  const [name, setName] = useState('')
  const [cls, setCls] = useState(classes[0])
  const [level, setLevel] = useState(1)

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), class: cls, level: Number(level), status: STATUSES[0] })
    setName('')
    setLevel(1)
  }

  return (
    <form className="recruit" onSubmit={submit}>
      <input placeholder="Adventurer's name" value={name} onChange={(e) => setName(e.target.value)} />
      <select value={cls} onChange={(e) => setCls(e.target.value)}>
        {classes.map((c) => <option key={c} value={c}>{CLASS_ICON[c]} {c}</option>)}
      </select>
      <input type="number" min="1" max="99" value={level} onChange={(e) => setLevel(e.target.value)} />
      <button type="submit">+ Recruit</button>
    </form>
  )
}