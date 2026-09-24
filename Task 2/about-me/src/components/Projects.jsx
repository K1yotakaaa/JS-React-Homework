const projects = [
  { title: 'Async Lab', text: 'Closures, promises and an event loop visualizer in vanilla JS.', link: 'https://github.com/K1yotakaaa/JS-React-Homework' },
  { title: 'About Me (this page)', text: 'My first React SPA, deployed with GitHub Pages.', link: 'https://github.com/K1yotakaaa' },
]

export default function Projects() {
  return (
    <section className="card">
      <h2>Projects</h2>
      <div className="projects">
        {projects.map((p) => (
          <a key={p.title} className="project" href={p.link} target="_blank" rel="noreferrer">
            <b>{p.title}</b>
            <span>{p.text}</span>
          </a>
        ))}
      </div>
    </section>
  )
}