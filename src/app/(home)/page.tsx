import Link from 'next/link';

const PROJECTS = [
  { slug: 'talus-process-monitor', name: 'talus-process-monitor', desc: 'eBPF ransomware detection & response in Rust — sliding-window heuristics, live TUI, GHCR deploy.', tags: ['RUST', 'eBPF', 'SEC'] },
  { slug: 'externum', name: 'externum', desc: 'Typed language compiling to Python, Bash and its own bytecode VM. 380+ tests, on PyPI.', tags: ['COMPILER', 'PY', 'BASH'] },
  { slug: 'aurora-os', name: 'Aurora', desc: 'Operating system in the browser — kernel, window manager, filesystem, 8 apps.', tags: ['TS', 'OS', 'BROWSER'] },
  { slug: 'nv2-engine', name: 'NV2 Engine', desc: 'Rust voxel engine with MeMLP neural terrain — powers Vivia: Beyond The Known.', tags: ['RUST', 'WGPU', 'VOXEL'] },
  { slug: 'pqguard', name: 'quantum-shield', desc: 'Post-quantum file encryption CLI — ML-KEM-768 (FIPS 203) + AES-256-GCM.', tags: ['RUST', 'PQC', 'CLI'] },
  { slug: 'cybersec-tools', name: 'CyberForge', desc: 'Four Rust security tools — port scanner, hash cracker, packet sniffer, web auditor.', tags: ['RUST', 'NETSEC', '4_TOOLS'] },
  { slug: 'fastapi-url', name: 'LinkShort', desc: 'Production URL shortener — FastAPI, real traffic, real ops notes.', tags: ['FASTAPI', 'PROD', 'OPS'] },
  { slug: 'n2-mesh', name: 'Meshcore', desc: 'Serverless P2P chat — mesh networking without a backend.', tags: ['P2P', 'MESH', 'CHAT'] },
];

const STATS = [
  { n: '12', label: 'PROJECTS DOCUMENTED' },
  { n: '4', label: 'DEEP-DIVE TRACKS' },
  { n: '2', label: 'LANGUAGES: EN + PL' },
  { n: '0', label: 'MARKETING FLUFF' },
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-[72rem] px-5 pb-24 text-[13px] leading-relaxed">
      {/* HERO */}
      <section className="flex min-h-[70vh] flex-col justify-center border-b border-[#22222a] pb-16 pt-24">
        <p className="text-[12px] tracking-[0.15em] text-[#8B93A3]">
          +/ STATUS: OPERATIONAL · DOCS_WRITTEN_FROM_SOURCE
        </p>
        <h1 className="mt-6 text-4xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
          HARTWELL<br />
          <span className="text-[#F15A24]">DOCS</span>_HUB
        </h1>
        <div className="mt-8 space-y-1 text-[#8B93A3]">
          <p>
            // STACK: <span className="text-[#E8E6E3]">RUST · eBPF · COMPILERS · PQC · BROWSER_OS · GAMES</span>
          </p>
          <p>
            // RULE: <span className="text-[#E04855]">REAL_CODE // REAL_RUNS // ZERO_SMOKE</span>
          </p>
        </div>
        <p className="mt-6 max-w-xl text-[#8B93A3]">
          One home for everything I build — documentation generated from the{' '}
          <span className="text-[#E8E6E3]">actual source code</span>: a production URL shortener, a browser
          OS, a Rust voxel engine, an eBPF monitor, a programming language and a serverless P2P chat.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-md bg-[#F15A24] px-6 py-3 font-bold text-[#050505] transition-colors hover:bg-[#ff6a35]"
          >
            BROWSE_CATALOG →
          </Link>
          <a
            href="https://bartoszosiej.github.io/"
            className="inline-flex items-center gap-2 rounded-md border border-[#E04855] px-6 py-3 font-bold text-[#E04855] transition-colors hover:bg-[#E04855] hover:text-[#050505]"
          >
            BACK_TO_ROOT ↗
          </a>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 gap-px border border-[#22222a] sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-[#0a0a0c] p-6">
            <div className="text-4xl font-bold text-[#F15A24]">{s.n}</div>
            <div className="mt-2 text-[11px] uppercase tracking-widest text-[#8B93A3]">{s.label}</div>
          </div>
        ))}
      </section>

      {/* CATALOG */}
      <section className="pt-16">
        <p className="text-[12px] tracking-[0.15em] text-[#8B93A3]">
          <span className="text-[#F15A24]">[01]</span> // CATALOG
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          EVERY_PROJECT,<br />
          <span className="text-[#F15A24]">DOCUMENTED.</span>
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROJECTS.map((p) => (
            <Link
              key={p.slug}
              href={`/docs/projects/${p.slug}`}
              className="group flex flex-col rounded-lg border border-[#22222a] bg-[#0a0a0c] p-5 transition-all hover:-translate-y-0.5 hover:border-[#F15A24] hover:shadow-[0_0_22px_rgba(241,90,36,0.25)]"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md border border-[#22222a] px-2 py-1 text-[10px] text-[#8B93A3] group-hover:border-[#F15A24] group-hover:text-[#F15A24]">
                  ▣
                </span>
                <span className="text-[#8B93A3] opacity-0 transition-opacity group-hover:opacity-100">↗</span>
              </div>
              <h3 className="mt-4 font-bold tracking-tight">{p.name}</h3>
              <p className="mt-2 flex-1 text-[11px] text-[#8B93A3]">{p.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-md border border-[#22222a] px-2 py-1 text-[10px] text-[#8B93A3]">
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TRACKS */}
      <section className="pt-16">
        <p className="text-[12px] tracking-[0.15em] text-[#8B93A3]">
          <span className="text-[#E04855]">[02]</span> // TRACKS
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="text-[#E04855]">BEYOND_THE</span>
          <br />
          CATALOG.
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: '/docs/qa', title: 'QA', desc: 'Automated test sweep across every project in the registry.' },
            { href: '/docs/rd', title: 'R&D', desc: 'Two preprints on Zenodo with persistent DOIs.' },
            { href: '/docs/energy', title: 'Energy Research', desc: 'Three open-access energy papers, quantitative and honest.' },
            { href: '/docs/tests', title: 'Tests', desc: 'Per-module breakdowns, benchmarks, coverage.' },
          ].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group rounded-lg border border-[#22222a] bg-[#0a0a0c] p-5 transition-all hover:-translate-y-0.5 hover:border-[#E04855] hover:shadow-[0_0_22px_rgba(224,72,85,0.25)]"
            >
              <h3 className="font-bold tracking-tight group-hover:text-[#E04855]">{t.title}</h3>
              <p className="mt-2 text-[11px] text-[#8B93A3]">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ENTERPRISE */}
      <section className="mt-16 border border-[#F15A24] bg-[#0a0a0c] p-8">
        <p className="text-[12px] tracking-[0.15em] text-[#8B93A3]">
          <span className="text-[#F15A24]">[$]</span> // ENTERPRISE
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              talus-process-monitor <span className="text-[#F15A24]">ENTERPRISE</span>
            </h2>
            <p className="mt-2 max-w-xl text-[12px] text-[#8B93A3]">
              Level 4/20 upgrade path — priority patches, license file, lifetime updates. One payment, instant checkout.
            </p>
          </div>
          <a
            href="https://buy.polar.sh/f8fee751-6cde-4a3b-b3cd-6e302ce8f5a8"
            className="rounded-md bg-[#F15A24] px-8 py-4 text-lg font-bold text-[#050505] transition-colors hover:bg-[#ff6a35]"
          >
            BUY — $50 →
          </a>
        </div>
      </section>
    </main>
  );
}
