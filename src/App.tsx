import { ParameterFocus } from './components/math/ParameterFocus';
import { LessonTabs } from './components/LessonTabs';
import type { LessonTab } from './components/LessonTabs';
import { SymbolDefinitions } from './components/math/SymbolDefinitions';
import { GradientGuide } from './components/math/GradientGuide';
import { loadProgress, saveProgress } from './lib/progress';
import { MathematicalBackdrop } from './components/MathematicalBackdrop';
import vectorsCode from './python/vectors.py?raw';
import gradientCode from './python/gradient-descent.py?raw';
import logisticCode from './python/logistic-regression.py?raw';
import pcaCode from './python/pca.py?raw';
import kmeansCode from './python/k-means.py?raw';
import neuralCode from './python/neural-network.py?raw';
import Vectors from './experiments/Vectors';
import Gradient from './experiments/Gradient';
import Logistic from './experiments/Logistic';
import PCA from './experiments/PCA';
import KMeans from './experiments/KMeans';
import Neural from './experiments/Neural';
import { useEffect, useRef, useState } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  BookOpen,
  FlaskConical,
  Share2,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Lightbulb,
  Command,
} from 'lucide-react';
import { lessons, getLesson } from './content/lessons';
import { glossary, references } from './content/glossary';
import { readLocation, defaults, experimentUrl } from './math/parameters';
import type { LessonId, Params } from './math/parameters';
import { MathView, CodeBlock, Quiz, copyText } from './components/ui';
import { Modal } from './components/Modal';
import Regression from './experiments/Regression';
import regressionCode from './python/linear-regression.py?raw';
const code: Record<LessonId, string> = {
  vectors: vectorsCode,
  'linear-regression': regressionCode,
  'gradient-descent': gradientCode,
  'logistic-regression': logisticCode,
  pca: pcaCode,
  'k-means': kmeansCode,
  'neural-network': neuralCode,
};
const experimentsById = {
  vectors: Vectors,
  'linear-regression': Regression,
  'gradient-descent': Gradient,
  'logistic-regression': Logistic,
  pca: PCA,
  'k-means': KMeans,
  'neural-network': Neural,
};
export default function App() {
  const routeKey = useRef(location.pathname + location.search);
  const [experimentVersion, setExperimentVersion] = useState(0);
  const [initial] = useState(() => readLocation(window.location.search));
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width:700px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width:700px)');
    const change = () => setIsMobile(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  const [id, setId] = useState<LessonId>(initial.id),
    [experiments, setExperiments] = useState<Partial<Record<LessonId, Params>>>({
      [initial.id]: initial.params,
    });
  const [page, setPage] = useState(new URLSearchParams(location.search).get('page') || 'lesson');
  const [term, setTerm] = useState(new URLSearchParams(location.search).get('term') || '');
  const [tab, setTab] = useState<LessonTab>('understand'),
    [searchOpen, setSearchOpen] = useState(false),
    [query, setQuery] = useState(''),
    [menu, setMenu] = useState(false);
  const [completed, setCompleted] = useState<LessonId[]>(loadProgress),
    [feedback, setFeedback] = useState(
      initial.invalid ? 'Some shared parameters were invalid. Safe defaults have been used.' : '',
    ),
    [shareFallback, setShareFallback] = useState('');
  useEffect(() => {
    if (!isMobile || !menu) return;
    const first = document.querySelector<HTMLButtonElement>('.sidebar nav button');
    first?.focus();
    return () => document.querySelector<HTMLButtonElement>('.mobile-menu')?.focus();
  }, [isMobile, menu]);
  const lesson = getLesson(id),
    index = lessons.findIndex((l) => l.id === id),
    p = experiments[id] ?? defaults(id);
  const Experiment = experimentsById[id];
  const ReadingContainer = id === 'gradient-descent' ? 'details' : 'div';
  const setP = (next: Params) => setExperiments((old) => ({ ...old, [id]: next }));
  const navigate = (next: LessonId) => {
    if (id === 'linear-regression' && next === 'gradient-descent') {
      setExperiments((old) => ({
        ...old,
        'gradient-descent': {
          ...defaults('gradient-descent'),
          points: p.points.map((q) => ({ ...q })),
        },
      }));
    }
    setId(next);
    setPage('lesson');
    setTab('understand');
    setMenu(false);
    setFeedback('');
    setShareFallback('');
    history.pushState({}, '', '?lesson=' + next);
    routeKey.current = location.pathname + location.search;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const openPage = (next: string, termId = '') => {
    if (next === 'glossary') setQuery('');
    setPage(next);
    setTerm(termId);
    setMenu(false);
    history.pushState({}, '', '?page=' + next + (termId ? '&term=' + termId : ''));
    routeKey.current = location.pathname + location.search;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  useEffect(() => {
    const back = () => {
      const nextKey = location.pathname + location.search;
      // Native section links also create history entries. They must not reload model defaults.
      if (nextKey === routeKey.current) return;
      routeKey.current = nextKey;
      setExperimentVersion((version) => version + 1);
      const r = readLocation(location.search);
      setFeedback(
        r.invalid ? 'Some shared parameters were invalid. Safe defaults have been used.' : '',
      );
      setShareFallback('');
      setId(r.id);
      setExperiments((old) => ({ ...old, [r.id]: r.params }));
      setPage(new URLSearchParams(location.search).get('page') || 'lesson');
      setTerm(new URLSearchParams(location.search).get('term') || '');
      setQuery('');
      setTab('understand');
    };
    const keys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === 'Escape') setMenu(false);
    };
    window.addEventListener('popstate', back);
    window.addEventListener('keydown', keys);
    return () => {
      window.removeEventListener('popstate', back);
      window.removeEventListener('keydown', keys);
    };
  }, []);
  useEffect(() => {
    document.title =
      page === 'lesson'
        ? lesson.title + ' · ML, Derived'
        : page === 'references'
          ? 'References · ML, Derived'
          : 'Glossary · ML, Derived';
  }, [lesson.title, page]);
  useEffect(() => {
    if (term) document.getElementById('term-' + term)?.scrollIntoView({ block: 'center' });
  }, [term, page]);
  const persist = (next: LessonId[]) => {
    setCompleted(next);
    try {
      saveProgress(next);
      setFeedback(next.length ? 'Progress saved on this device.' : 'Progress reset.');
    } catch {
      setFeedback('Storage unavailable. Progress lasts for this visit only.');
    }
  };
  const share = async () => {
    const url = experimentUrl(id, p);
    history.replaceState({}, '', url);
    routeKey.current = location.pathname + location.search;
    try {
      await copyText(url);
      setFeedback('Experiment link copied.');
      setShareFallback('');
    } catch {
      setFeedback(
        'Clipboard unavailable. Copy the experiment link from the field below or the address bar.',
      );
      setShareFallback(url);
    }
  };
  const search = query.trim().toLowerCase();
  const matchedLessons = lessons.filter((l) => JSON.stringify(l).toLowerCase().includes(search));
  const matchedTerms = glossary.filter((g) =>
    [g.term, g.symbol, g.definition].join(' ').toLowerCase().includes(search),
  );
  return (
    <div className="app" data-lesson={id}>
      <MathematicalBackdrop lesson={id} />
      <a className="skip-link" href="#main">
        Skip to lesson
      </a>
      <header className="topbar">
        <button
          className="mobile-menu"
          aria-label={menu ? 'Close curriculum' : 'Open curriculum'}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X size={20} /> : <Menu size={20} />}
        </button>
        <button
          className="brand"
          onClick={() => navigate('linear-regression')}
          aria-label="ML, Derived home"
        >
          <span className="brand-mark">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path
                d="M6 25V7l10 14L26 7v18M6 25h20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle cx="16" cy="21" r="2.2" fill="currentColor" />
            </svg>
          </span>
          <span>
            ML<span className="brand-comma">,</span> Derived<span className="brand-dot">.</span>
          </span>
        </button>
        <span className="masthead-subtitle">Machine learning through mathematics</span>
        <div className="topbar-right">
          <button
            className="top-search"
            aria-label="Search lessons and symbols"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={17} />
            <span>Search lessons and symbols</span>
          </button>
          <button
            className="masthead-sources"
            aria-label="Open sources and references"
            onClick={() => openPage('references')}
          >
            <BookOpen size={21} />
          </button>
        </div>
      </header>
      <aside
        className={'sidebar ' + (menu ? 'mobile-open' : '')}
        inert={isMobile && !menu}
        aria-label="Learning path"
      >
        <nav aria-label="Curriculum">
          <div className="nav-label">
            THE LEARNING PATH <span>07</span>
          </div>
          {lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => navigate(l.id)}
              className={'lesson-link ' + (id === l.id && page === 'lesson' ? 'active' : '')}
              aria-current={id === l.id && page === 'lesson' ? 'page' : undefined}
            >
              <span className={'lesson-number ' + (completed.includes(l.id) ? 'done' : '')}>
                {completed.includes(l.id) ? <Check size={12} /> : String(i + 1).padStart(2, '0')}
              </span>
              <span>{l.short}</span>
              {id === l.id && page === 'lesson' && <ChevronRight size={14} />}
            </button>
          ))}
        </nav>
        <div className="progress-block">
          <div>
            <span>Your progress</span>
            <strong>{completed.length} / 7</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: (completed.length / 7) * 100 + '%' }} />
          </div>
          <p>Completed lessons stay on this device.</p>
          <button onClick={() => persist([])}>
            <RotateCcw size={12} /> Reset progress
          </button>
        </div>
        <div className="sidebar-resources">
          <div className="nav-label">KEEP HANDY</div>
          <button onClick={() => openPage('glossary')}>
            <BookOpen size={15} /> Mathematical glossary
            <ArrowUpRight size={13} />
          </button>
          <button onClick={() => openPage('references')}>
            <ExternalLink size={15} /> Sources & references
            <ArrowUpRight size={13} />
          </button>
        </div>
      </aside>
      {menu && (
        <button
          className="menu-backdrop"
          aria-label="Close curriculum"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace">
        <main id="main" tabIndex={-1}>
          {page === 'lesson' ? (
            <>
              <div className="lesson-top">
                <div className="eyebrow">
                  <span className="chapter-tag">LESSON {String(index + 1).padStart(2, '0')}</span>
                  <span>{lesson.group}</span>
                </div>
                <div className="title-row">
                  <div>
                    <h1>{lesson.title}</h1>
                    <p className="subtitle">{lesson.subtitle}</p>
                  </div>
                  <span className="lesson-position">
                    {String(index + 1).padStart(2, '0')}
                    <span> / 07</span>
                  </span>
                </div>
              </div>
              <div className="mobile-jumps">
                <a href="#lesson-sections">
                  Read the lesson <ArrowRight size={13} />
                </a>
                <a href="#interactive-lab">
                  Explore the lab <ArrowRight size={13} />
                </a>
              </div>
              <LessonTabs selected={tab} onChange={setTab} />
              <ParameterFocus key={id}>
                <div className="learning-grid">
                  <div className="reading-column">
                    <article
                      className="lesson-body"
                      id="lesson-panel"
                      role="tabpanel"
                      aria-labelledby={'tab-' + tab}
                    >
                      {tab === 'understand' && (
                        <>
                          {id === 'gradient-descent' && <GradientGuide />}
                          <ReadingContainer
                            className={id === 'gradient-descent' ? 'full-lesson' : undefined}
                          >
                            {id === 'gradient-descent' && (
                              <summary>Read the full explanation and worked example</summary>
                            )}
                            <div className="question-callout">
                              <span className="eyebrow">The question we're asking</span>
                              <p>{lesson.question}</p>
                            </div>
                            <div className="prerequisites">
                              <span>Bring along</span>
                              {lesson.prerequisites.map((k) => (
                                <button key={k} onClick={() => openPage('glossary', k)}>
                                  {glossary.find((g) => g.id === k)?.term ?? k}
                                  <ArrowUpRight size={11} />
                                </button>
                              ))}
                            </div>
                            <h2>Start with the intuition</h2>
                            {lesson.intuition.map((t) => (
                              <p key={t}>{t}</p>
                            ))}
                            <div className="formula-card">
                              <span className="eyebrow">{lesson.formulaLabel}</span>
                              <MathView math={lesson.formula} />
                              <p>Read the symbols. Then move the controls in the lab.</p>
                            </div>
                            <h3>The notation, unpacked</h3>
                            <SymbolDefinitions symbols={lesson.symbols} />
                            <div className="worked-example">
                              <span className="eyebrow">A small example</span>
                              <p>{lesson.worked.body}</p>
                              <MathView math={lesson.worked.formula} />
                            </div>
                            <h3>What we're assuming</h3>
                            <p>{lesson.assumptions}</p>
                            <div className="insight">
                              <Lightbulb size={18} />
                              <div>
                                <strong>Take it to the lab</strong>
                                <p>{lesson.experiment.observe}</p>
                              </div>
                            </div>
                            <button className="section-next" onClick={() => setTab('derive')}>
                              Where does the equation come from?
                              <ArrowRight size={16} />
                            </button>
                          </ReadingContainer>
                        </>
                      )}
                      {tab === 'derive' && (
                        <>
                          <p className="eyebrow">One step at a time</p>
                          <h2>From intuition to equation</h2>
                          <p>Follow each operation. The experiment uses these same definitions.</p>
                          <ol className="derivation">
                            {lesson.steps.map((s, i) => (
                              <li key={s.title}>
                                <span className="step-badge">{i + 1}</span>
                                <div>
                                  <h3>{s.title}</h3>
                                  <p>{s.body}</p>
                                  <MathView math={s.formula} />
                                </div>
                              </li>
                            ))}
                          </ol>
                          {lesson.deeper.map((d) => (
                            <details className="deeper" key={d.title}>
                              <summary>
                                {d.title}
                                <span>Go deeper +</span>
                              </summary>
                              <p>{d.body}</p>
                              {d.formula && <MathView math={d.formula} />}
                            </details>
                          ))}
                          <button className="section-next" onClick={() => setTab('code')}>
                            Make the math into code
                            <ArrowRight size={16} />
                          </button>
                        </>
                      )}
                      {tab === 'code' && (
                        <>
                          <p className="eyebrow">The algorithm, without the abstraction</p>
                          <h2>Build it from scratch</h2>
                          <p>
                            This Python example is a readable, downloadable companion. Run it
                            locally with Python 3; the website runs its experiments in TypeScript,
                            in your browser.
                          </p>
                          <CodeBlock code={code[id]} filename={id + '.py'} />
                          <h3>Compare with a library</h3>
                          <p>{lesson.library}</p>
                          <p className="small-note">
                            Optional library imports are shown in the example. The core method uses
                            only Python's standard library.
                          </p>
                          <button className="section-next" onClick={() => setTab('practice')}>
                            Test your understanding
                            <ArrowRight size={16} />
                          </button>
                        </>
                      )}
                      {tab === 'practice' && (
                        <>
                          <Quiz key={id} questions={lesson.quiz} />
                          <h3>Common traps & limitations</h3>
                          <ul className="limitations">
                            {lesson.limitations.map((l) => (
                              <li key={l}>{l}</li>
                            ))}
                          </ul>
                          <div className="recap">
                            <span className="eyebrow">The idea to take with you</span>
                            <p>{lesson.recap}</p>
                          </div>
                        </>
                      )}
                    </article>
                  </div>
                  <aside
                    className="experiment-column"
                    id="interactive-lab"
                    aria-label="Interactive experiment"
                  >
                    <div className="lab-heading">
                      <div>
                        <FlaskConical size={16} />
                        <h2>
                          {id === 'gradient-descent' ? 'The loss landscape' : 'Interactive lab'}
                        </h2>
                      </div>
                      <span className="live-badge">
                        <i /> INTERACTIVE
                      </span>
                    </div>
                    <div className="lab-subheading" hidden={id === 'gradient-descent'}>
                      <h3>
                        {id === 'linear-regression'
                          ? 'Fit a line. See the error.'
                          : lesson.short + ' playground'}
                      </h3>
                      <p>{lesson.experiment.action}</p>
                    </div>
                    <Experiment key={id + ':' + experimentVersion} p={p} setP={setP} />
                    <div className="lab-footer">
                      <button onClick={share}>
                        <Share2 size={13} /> Share experiment
                      </button>
                      <span>All calculations stay in your browser.</span>
                      <span>Shared links save parameters, not training history.</span>
                    </div>
                  </aside>
                </div>
              </ParameterFocus>
              <div className="completion">
                <div>
                  <span className="eyebrow">Lesson progress</span>
                  <p>Mark this lesson when you are ready to continue.</p>
                </div>
                <button
                  className={completed.includes(id) ? 'completed-button' : 'primary'}
                  onClick={() =>
                    persist(
                      completed.includes(id)
                        ? completed.filter((k) => k !== id)
                        : [...completed, id],
                    )
                  }
                >
                  <Check size={15} />
                  {completed.includes(id) ? 'Lesson completed' : 'Mark as complete'}
                </button>
              </div>
              <div className="lesson-pagination">
                {index > 0 ? (
                  <button onClick={() => navigate(lessons[index - 1].id)}>
                    <ArrowLeft size={15} />
                    <span>
                      Previous lesson<strong>{lessons[index - 1].short}</strong>
                    </span>
                  </button>
                ) : (
                  <span />
                )}
                {index < lessons.length - 1 && (
                  <button onClick={() => navigate(lessons[index + 1].id)}>
                    <span>
                      Up next<strong>{lessons[index + 1].short}</strong>
                    </span>
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="resource-page">
              <p className="eyebrow">Your mathematical companion</p>
              <h1>
                {page === 'references' ? 'Sources & references' : 'A small mathematical glossary'}
              </h1>
              <p className="subtitle">
                {page === 'references'
                  ? 'The primary sources behind the lessons.'
                  : 'Short explanations. No assumed fluency.'}
              </p>
              {page === 'references' ? (
                <>
                  <p>
                    The explanations and worked examples here are original. These university
                    materials and official library documents support the derivations and
                    implementation conventions. Datasets are deterministic teaching examples, not
                    performance benchmarks.
                  </p>
                  {references.map((r) => (
                    <div className="reference" key={r.url}>
                      <span className="eyebrow">{r.author}</span>
                      <h2>
                        <a href={r.url} target="_blank" rel="noreferrer">
                          {r.title}
                          <ArrowUpRight size={18} />
                        </a>
                      </h2>
                      <p>{r.detail}</p>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <label className="glossary-filter">
                    <Search size={18} />
                    <input
                      aria-label="Filter glossary"
                      placeholder="Find a term or symbol…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                  {matchedTerms.length === 0 && <p>No matching terms. Try a shorter word.</p>}
                  {matchedTerms.map((g) => (
                    <section
                      className={'glossary-term ' + (term === g.id ? 'highlight' : '')}
                      id={'term-' + g.id}
                      key={g.id}
                    >
                      <span className="mono">{g.symbol}</span>
                      <h2>{g.term}</h2>
                      <p>{g.definition}</p>
                      <button onClick={() => navigate(g.lesson)}>
                        See it in a lesson
                        <ArrowRight size={14} />
                      </button>
                    </section>
                  ))}
                </>
              )}
              <button className="section-next" onClick={() => navigate(id)}>
                Return to the lesson
                <ArrowRight size={16} />
              </button>
            </div>
          )}
          {feedback && (
            <div className="global-feedback" role="status">
              <span>{feedback}</span>
              <button aria-label="Dismiss notification" onClick={() => setFeedback('')}>
                <X size={15} />
              </button>
            </div>
          )}
          {shareFallback && (
            <label className="share-fallback">
              Shared experiment URL
              <input
                aria-label="Shared experiment URL"
                readOnly
                value={shareFallback}
                onFocus={(e) => e.target.select()}
              />
            </label>
          )}
        </main>
        <footer className="workspace-footer">
          <span>
            ML, Derived <span className="footer-separator">/</span> Understanding, from first
            principles.
          </span>
          <button onClick={() => openPage('references')}>
            Read the sources
            <ArrowUpRight size={12} />
          </button>
        </footer>
      </div>
      {searchOpen && (
        <Modal title="Find your next connection" onClose={() => setSearchOpen(false)}>
          <label className="search-input">
            <Search size={20} />
            <input
              autoFocus
              aria-label="Search lessons, concepts, and symbols"
              placeholder="Search lessons, concepts, or symbols…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>ESC</kbd>
          </label>
          <div className="search-results">
            <p className="eyebrow">Lessons</p>
            {matchedLessons.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  navigate(l.id);
                  setSearchOpen(false);
                  setQuery('');
                }}
              >
                <BookOpen size={17} />
                <span>
                  {l.title}
                  <small>{l.tags.slice(0, 4).join(' · ')}</small>
                </span>
                <ArrowRight size={15} />
              </button>
            ))}
            <p className="eyebrow">Concepts & symbols</p>
            {matchedTerms.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setQuery('');
                  openPage('glossary', g.id);
                  setSearchOpen(false);
                }}
              >
                <span className="search-symbol">{g.symbol}</span>
                <span>
                  {g.term}
                  <small>{g.definition.slice(0, 90)}…</small>
                </span>
                <ArrowRight size={15} />
              </button>
            ))}
            {!matchedLessons.length && !matchedTerms.length && (
              <p>No matches yet. Try “gradient”, “variance”, or “w”.</p>
            )}
          </div>
          <div className="search-footer">
            <Command size={13} /> K to open search <span>Explore at your own pace.</span>
          </div>
        </Modal>
      )}
    </div>
  );
}
