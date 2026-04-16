import Layout from '../components/Layout';

const card: React.CSSProperties = {
  background: 'rgba(0, 20, 60, 0.45)',
  border: '1px solid rgba(0, 90, 200, 0.25)',
  borderRadius: '12px',
  padding: '1.75rem 2rem',
  backdropFilter: 'blur(8px)',
};

export default function AboutPage() {
  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '900px', width: '100%', padding: '2rem 1rem', textAlign: 'left' }}>

        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <div className="card-hover" style={{ ...card, flex: 1 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>What is Rate My Class?</h2>
            <p style={{ color: 'var(--text-bright)', lineHeight: 1.75, margin: 0 }}>
              Gone is the stress of picking classes for your next semester at BYU. Rate My Class is a RateMyProfessor-inspired platform that makes course selection easy by giving you everything you need to make informed decisions — difficulty, professor and TA recommendations, helpful resources, and more, all from students who've already been there.
            </p>
          </div>

          <div className="card-hover" style={{ ...card, flex: 1 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>How it works</h2>
            <p style={{ color: 'var(--text-bright)', lineHeight: 1.75, margin: 0 }}>
              Students who have taken a class can post reviews covering difficulty, workload, tips, and anything else future students should know. Anyone registering for that class can look it up and read through those reviews to plan their semester as smoothly as possible.
            </p>
          </div>
        </div>

        <div className="card-hover" style={card}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>About the project</h2>
          <p style={{ color: 'var(--text-bright)', lineHeight: 1.75, margin: 0 }}>
            Rate My Class is authored and maintained by <strong style={{ color: 'var(--text-primary)' }}>Andrew Nicholls</strong> (2026).
            View the source on <a href="https://github.com/Centerearth/startup" style={{ color: 'var(--accent)' }}>GitHub</a> or visit the <a href="ratemyclass260.link" style={{ color: 'var(--accent)' }}>project homepage</a>.
          </p>
        </div>

      </div>
    </Layout>
  );
}
