import CharacterCard from './CharacterCard'

export default function CharacterList({ characters, buggyKeys, canReorder, onRemove, onStatusChange, onReset, onMoveUp, onMoveDown }) {
  console.log('Rendering CharacterList:', characters.length, 'cards')
  return (
    <div className="roster">
      {characters.map((c, index) => (
        <CharacterCard
          key={buggyKeys ? index : `${c.id}-${c.resetCount}`}
          character={c}
          canReorder={canReorder}
          isFirst={index === 0}
          isLast={index === characters.length - 1}
          onRemove={onRemove}
          onStatusChange={onStatusChange}
          onReset={onReset}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      ))}
    </div>
  )
}