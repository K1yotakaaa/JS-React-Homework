export default function Toolbar({
  statusFilter, onFilterChange, statuses,
  reversed, onToggleReverse,
  buggyKeys, onToggleBuggyKeys,
  visibleCount, total,
}) {
  return (
    <div className="toolbar">
      <div className="filters">
        <button className={statusFilter === 'All' ? 'active' : ''} onClick={() => onFilterChange('All')}>All</button>
        {statuses.map((s) => (
          <button key={s} className={statusFilter === s ? 'active' : ''} onClick={() => onFilterChange(s)}>{s}</button>
        ))}
      </div>
      <div className="toolbar-right">
        <span className="count">{visibleCount} / {total}</span>
        <button onClick={onToggleReverse}>{reversed ? '↑ Normal' : '↓ Reverse'}</button>
      </div>
      <label className="buggy">
        <input type="checkbox" checked={buggyKeys} onChange={onToggleBuggyKeys} />
        Dev demo: use index as key (breaks state preservation)
      </label>
    </div>
  )
}