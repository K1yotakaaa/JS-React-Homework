import photo from '../assets/photo.jpg'

export default function Header() {
  return (
    <header className="header">
      <img src={photo} alt="My photo" />
      <h1>Your Name</h1>
      <p>Middle Frontend Developer at Eurasian Bank · Student at KBTU</p>
      <div className="badges">
        <span>⚛️ React</span>
        <span>🎓 KBTU</span>
        <span>📍 Planet Earth</span>
      </div>
    </header>
  )
}