export default function Footer() {
  return (
    <footer style={{ background: 'transparent', borderTop: 'none', color: 'var(--text-muted)' }}>
      <div className="container-fluid d-flex justify-content-between align-items-center h-100">
        <span className="text-reset">Author: Andrew Nicholls</span>
        <a className="text-reset" href="https://github.com/Centerearth/startup">
          Source
        </a>
      </div>
    </footer>
  );
}
