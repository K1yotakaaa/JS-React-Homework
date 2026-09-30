export default function PartyHUD({ characters }) {
  const total = characters.length
  const avgLevel = total ? Math.round(characters.reduce((sum, c) => sum + c.level, 0) / total) : 0
  const legendary = characters.filter((c) => c.status === 'Legendary').length

  return (
    <div className="hud">
      <div><b>{total}</b><span>Members</span></div>
      <div><b>{avgLevel}</b><span>Avg. Level</span></div>
      <div className="gold"><b>{legendary}</b><span>Legendary</span></div>
    </div>
  )
}