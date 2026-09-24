import { useState } from 'react'
import Header from './components/Header'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import FunFacts from './components/FunFacts'
import Contacts from './components/Contacts'

export default function App() {
  const [dark, setDark] = useState(false)
  return (
    <main className={`page ${dark ? 'dark' : ''}`}>
      <button className="theme" onClick={() => setDark(!dark)}>
        {dark ? '☀️ Light' : '🌙 Dark'}
      </button>
      <Header />
      <About />
      <Skills />
      <Projects />
      <FunFacts />
      <Contacts />
      <footer>Made with love :)</footer>
    </main>
  )
}