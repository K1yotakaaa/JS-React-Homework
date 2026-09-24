const skills = [
  { name: 'HTML & CSS', level: 100 },
  { name: 'JavaScript', level: 100 },
  { name: 'React', level: 100 },
  { name: 'Git & GitHub', level: 100 },
  { name: 'Backend', level: 90 },
  { name: 'DevOps', level: 40 },
]

export default function Skills() {
  return (
    <section className="card">
      <h2>Skills</h2>
      {skills.map((s) => (
        <div key={s.name} className="skill">
          <div className="skill-top"><span>{s.name}</span><span>{s.level}%</span></div>
          <div className="bar"><span style={{ '--w': `${s.level}%` }} /></div>
        </div>
      ))}
    </section>
  )
}