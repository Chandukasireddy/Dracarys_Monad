import Link from 'next/link';

const sections = [
  { id: 'how-to-use', label: 'How to use the app' },
  { id: 'run-frontend', label: 'Run the frontend' },
  { id: 'run-backend', label: 'Run the backend' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'monad', label: 'Monad Testnet' },
];

export default function DocsPage() {
  return (
    <main className="docs-page">
      <header className="docs-header">
        <Link className="docs-brand" href="/">
          <span className="docs-brand-mark">✦</span>
          streaker<span>.</span>
        </Link>
        <Link className="docs-back" href="/">
          Back to app
        </Link>
      </header>

      <div className="docs-layout">
        <aside className="docs-sidebar">
          <span className="docs-eyebrow">Project documentation</span>
          <nav aria-label="Documentation navigation">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.label}
              </a>
            ))}
          </nav>
        </aside>

        <article className="docs-content">
          <span className="docs-eyebrow">Streaker on Monad</span>
          <h1>Build habits with a little skin in the game.</h1>
          <p className="docs-lede">
            Streaker is a social habit-staking app. Create a challenge, commit MON, submit proof,
            and let friends help verify progress.
          </p>
          <div style={{ margin: '20px 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img src="/screenshots/image.png" alt="Dracarys Application Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          <section id="how-to-use" className="docs-section">
            <h2>How to use the app</h2>
            <ol>
              <li>Choose <strong>Create a challenge</strong>.</li>
              <li>Name your habit, choose a category, and select a duration.</li>
              <li>Set the daily MON commitment and create the challenge.</li>
              <li>Open an active challenge and submit a check-in with proof.</li>
              <li>Review pending proofs in <strong>Friend approvals</strong>.</li>
              <li>Review streaks and milestones in <strong>My progress</strong>.</li>
            </ol>
            <p>
              Demo progress is saved in browser storage, so the core experience can be tested before
              the complete on-chain flow is enabled.
            </p>
          </section>

          <section id="run-frontend" className="docs-section">
            <h2>Run the frontend</h2>
            <p>Use Node.js 20.9 or newer.</p>
            <pre><code>{`cd Frontend\nnpm install\nnpm run dev`}</code></pre>
            <p>Open <code>http://localhost:3000</code>. The dev server also exposes a local network URL for mobile testing.</p>
            <pre><code>{`npm run typecheck\nnpm run build\nnpm start\nnpm run test:e2e`}</code></pre>
          </section>

          <section id="run-backend" className="docs-section">
            <h2>Run the backend</h2>
            <pre><code>{`cd backend\npython -m venv .venv\nsource .venv/bin/activate\npip install -r requirements.txt\npython run.py`}</code></pre>
            <p>
              The API runs at <code>http://127.0.0.1:8000</code>. Interactive API docs are available
              at <code>/docs</code>.
            </p>
          </section>

          <section id="architecture" className="docs-section">
            <h2>Architecture</h2>
            <div className="docs-grid">
              <div><strong>Frontend</strong><p>Next.js dashboard, responsive PWA, wallet UI, local demo state, and challenge flows.</p></div>
              <div><strong>Backend</strong><p>FastAPI proof uploads, approval logic, activity feeds, and deadline evaluation.</p></div>
              <div><strong>Contracts</strong><p>Solidity escrow logic for streak creation, proof, approval, payouts, and missed commitments.</p></div>
            </div>
          </section>

          <section id="monad" className="docs-section">
            <h2>Monad Testnet</h2>
            <dl className="docs-facts">
              <div><dt>Network</dt><dd>Monad Testnet</dd></div>
              <div><dt>Chain ID</dt><dd>10143</dd></div>
              <div><dt>Currency</dt><dd>MON</dd></div>
              <div><dt>RPC</dt><dd>https://testnet-rpc.monad.xyz</dd></div>
              <div><dt>Contract</dt><dd>0x77547711ea2726F16C8BCeDD37a347C139D346E7</dd></div>
            </dl>
          </section>

          <footer className="docs-footer">
            <Link href="/">Open Streaker</Link>
            <span>Built for Monad Blitz Berlin.</span>
          </footer>
        </article>
      </div>
    </main>
  );
}
