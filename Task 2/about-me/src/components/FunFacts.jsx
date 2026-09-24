import { useState } from 'react'

const facts = [
  'I already work as a middle frontend developer (React) at Eurasian Bank.',
  'I study at KBTU while working part-time in a real product team.',
  'Fun fact: my last homework was a visualizer of the JavaScript event loop.',
]

export default function FunFacts() {
  const [i, setI] = useState(0)
  return (
    <section className="card">
      <h2>Fun Facts</h2>
      <p className="fact" key={i}>{facts[i]}</p>
      <button onClick={() => setI((i + 1) % facts.length)}>Another fact</button>
    </section>
  )
}