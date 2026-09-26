'use client';
import { useState, useEffect, useRef } from 'react';
import { useConnection } from 'wagmi';
import {
  Flame,
  Zap,
  LayoutGrid,
  Users,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Wallet,
  TrendingUp,
  LockKeyhole,
  Check,
  ChevronDown,
  Bell,
  Target,
  Volume2,
  VolumeX,
  Copy,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { useStreaker, stakeTotal } from '@/hooks/use-streaker';
import { Challenge, dayKey, challengeDates, longestRun, currentRun } from '@/lib/types';
import { FlameArt } from './flame';
import { HabitCard } from './habit-card';
import { Calendar } from './calendar';
import { FriendApprovals } from './friend-approvals';
import { Modal } from './modal';
import { CheckInModal } from './check-in-modal';
import { CreateChallenge, JoinChallenge } from './create-challenge';
import { WalletModal } from './wallet-modal';
import { PwaControl } from './pwa';
import { AccountModal } from './account-modal';

type Tab = 'streaks' | 'friends' | 'progress';
type Dialog = 'create' | 'join' | 'wallet' | 'settings' | 'notifications' | 'account' | null;
export function StreakerApp() {
  const store = useStreaker();
  const { address, isConnected } = useConnection();
  const [tab, setTab] = useState<Tab>('streaks'),
    [dialog, setDialog] = useState<Dialog>(null),
    [checkIn, setCheckIn] = useState<Challenge | null>(null),
    [details, setDetails] = useState<Challenge | null>(null),
    [toast, setToast] = useState(''),
    [filter, setFilter] = useState<'active' | 'completed'>('active'),
    [invite, setInvite] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const notify = (message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 5500);
  };
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('invite');
    if (code) {
      setInvite(code);
      setDialog('join');
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  const pending = store.approvals.filter((a) => !a.approved).length;
  const longest = Math.max(0, ...store.challenges.map((c) => longestRun(challengeDates(c))));
  const currentStreak = Math.max(0, ...store.challenges.map((c) => currentRun(challengeDates(c))));
  const checkedDates = [...new Set(store.challenges.flatMap(challengeDates))];
  const totalCheckins = store.challenges.reduce((sum, c) => sum + c.completed, 0);
  const claimedToday = store.challenges.filter((c) => c.lastCheckIn === dayKey()).length;
  const active = store.challenges.filter((c) => c.completed < c.duration);
  const todayTotal = store.challenges.filter(
    (c) => c.completed < c.duration || c.lastCheckIn === dayKey(),
  ).length;
  const remaining = active.filter((c) => c.lastCheckIn !== dayKey());
  const earned = store.challenges.reduce(
    (sum, c) => sum + Number(stakeTotal(c.dailyStake, c.completed)),
    0,
  );
  const locked = store.challenges.reduce(
    (sum, c) => sum + Number(stakeTotal(c.dailyStake, c.duration - c.completed)),
    0,
  );
  const featured = store.challenges[0];
  const approve = (id: string) => {
    store.approveFriend(id);
    navigator.vibrate?.(30);
    notify('Approved. A little support, a stronger streak.');
  };
  const go = (next: Tab) => {
    setTab(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const tabs = [
    { id: 'streaks' as const, label: 'My streaks', icon: LayoutGrid },
    { id: 'friends' as const, label: 'Friend approvals', icon: Users },
    { id: 'progress' as const, label: 'My progress', icon: TrendingUp },
  ];
  if (!store.ready)
    return (
      <div className="app-loading" role="status">
        <span className="brand">
          <span className="brand-icon">
            <Flame fill="currentColor" size={23} />
          </span>
          dracarys<span className="brand-period">.</span>
        </span>
        <p>Kindle your flame. A little every day.</p>
      </div>
    );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Dracarys home">
          <span className="brand-icon">
            <Flame fill="currentColor" size={23} />
          </span>
          dracarys<span className="brand-period">.</span>
        </a>
        <div className="sidebar-caption">A LITTLE EVERY DAY.</div>
        <nav aria-label="Main navigation">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`nav-item ${tab === t.id ? 'active' : ''}`}
              aria-current={tab === t.id ? 'page' : undefined}
              onClick={() => go(t.id)}
            >
              <t.icon size={19} />
              {t.label}
              {t.id === 'friends' && pending > 0 && <span className="nav-count">{pending}</span>}
              {t.id === 'streaks' && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <button className="sidebar-create" onClick={() => setDialog('create')}>
          <Plus size={18} /> Create a challenge
        </button>
        <div className="sidebar-bottom">
          <div className="sidebar-motivation">
            <div className="tiny-bolt">
              <Zap size={18} fill="currentColor" />
            </div>
            <strong>
              Big things.
              <br />
              Small beginnings.
            </strong>
            <p>
              Your future self is
              <br />
              already thanking you.
            </p>
            <span className="motivation-line" />
          </div>
          <PwaControl notify={notify} />
          <button className="profile" onClick={() => setDialog('account')}>
            <span className={`avatar profile-avatar ${store.user?.avatar_color || 'purple'}`}>
              {store.user?.initials || (store.user ? store.user.display_name.slice(0, 2).toUpperCase() : '?')}
            </span>
            <span>
              <strong>{store.user?.display_name || 'Sign In / Register'}</strong>
              <small>{store.user ? `@${store.user.username}` : 'Manage Account'}</small>
            </span>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <span>DRACARYS · HABIT STAKING ESCROW</span>
            <button
              className="mobile-brand"
              onClick={() => setDialog('account')}
              aria-label="Open profile and account"
            >
              <Flame size={20} fill="currentColor" /> dracarys.
            </button>
          </div>
          <div className="topbar-actions">
            <span className="network-label">
              <i /> Monad Testnet (10143)
            </span>
            {store.user ? (
              <button
                className="user-profile-top-button"
                onClick={() => setDialog('account')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#191920',
                  border: '1px solid #2f2d38',
                  padding: '4px 10px 4px 6px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  color: '#f5f4f7',
                }}
              >
                <span
                  className={`avatar tiny ${store.user.avatar_color || 'purple'}`}
                  style={{ width: '22px', height: '22px', fontSize: '11px' }}
                >
                  {store.user.initials || store.user.display_name.slice(0, 2).toUpperCase()}
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{store.user.display_name}</span>
                <span style={{ fontSize: '11px', color: '#ff7a45' }}>{store.user.streak_count || 0} 🔥</span>
              </button>
            ) : (
              <button
                className="button primary"
                onClick={() => setDialog('account')}
                style={{ padding: '6px 12px', fontSize: '12.5px', height: '34px', gap: '5px' }}
              >
                <Flame size={14} /> Sign In
              </button>
            )}
            <button
              className="notification-button icon-button"
              aria-label="Notifications"
              onClick={() => setDialog('notifications')}
            >
              <Bell size={19} />
              {pending > 0 && <i />}
            </button>
            <button
              className="wallet-button"
              aria-label="Manage wallet connection"
              onClick={() => setDialog('wallet')}
            >
              <Wallet size={16} />
              <span>
                {isConnected ? `${address?.slice(0, 5)}…${address?.slice(-4)}` : 'Connect wallet'}
              </span>
            </button>
          </div>
        </header>
        <main
          id="main"
          className="main-content"
          onTouchStart={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button,input,textarea,a')) return;
            swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }}
          onTouchEnd={(e) => {
            if (!swipe.current) return;
            const dx = e.changedTouches[0].clientX - swipe.current.x,
              dy = e.changedTouches[0].clientY - swipe.current.y;
            swipe.current = null;
            if (Math.abs(dx) > 100 && Math.abs(dy) < 50) {
              const index = tabs.findIndex((t) => t.id === tab);
              const next = tabs[index + (dx < 0 ? 1 : -1)];
              if (next) go(next.id);
            }
          }}
        >
          <section className="page-heading">
            <div>
              <div className="greeting">
                {tab === 'streaks'
                  ? 'LET’S MAKE TODAY COUNT'
                  : tab === 'friends'
                    ? 'GOOD HABITS LOVE GOOD COMPANY'
                    : 'LOOK HOW FAR YOU’VE COME'}
                <span>✦</span>
              </div>
              <h1>
                {tab === 'streaks' ? (
                  <>
                    Keep your <span>fire alive.</span>
                  </>
                ) : tab === 'friends' ? (
                  <>
                    Your people. <span>Your power.</span>
                  </>
                ) : (
                  <>
                    Small steps. <span>Real progress.</span>
                  </>
                )}
              </h1>
              <p>
                {tab === 'streaks'
                  ? 'Show up for yourself. Back it with a little commitment.'
                  : tab === 'friends'
                    ? 'Because showing up is easier when someone’s in your corner.'
                    : 'Every check-in is a vote for the person you want to become.'}
              </p>
            </div>
            <button className="button primary heading-create" onClick={() => setDialog('create')}>
              <Plus size={18} /> New challenge
            </button>
          </section>
          {store.storageWarning && (
            <div className="info-box">
              Your browser storage is unavailable. Progress may reset when you leave.
            </div>
          )}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon orange">
                <Flame size={20} />
              </div>
              <div>
                <span>Longest streak</span>
                <strong>
                  {longest} <small>days</small>
                  <em>
                    Looking good <span>↗</span>
                  </em>
                </strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">
                <Target size={20} />
              </div>
              <div>
                <span>Active challenges</span>
                <strong>
                  {active.length.toString().padStart(2, '0')} <small>in motion</small>
                </strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">
                <TrendingUp size={20} />
              </div>
              <div>
                <span>
                  Earned back <span className="stat-demo">DEMO</span>
                </span>
                <strong>
                  {earned.toFixed(2)} <small>MON</small>
                </strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon neutral">
                <LockKeyhole size={19} />
              </div>
              <div>
                <span>Your commitment</span>
                <strong>
                  {locked.toFixed(2)} <small>MON locked</small>
                </strong>
              </div>
            </div>
          </div>
          {tab === 'streaks' ? (
            <div className="dashboard-columns">
              <div className="dashboard-main">
                <section className="hero-card">
                  <div className="hero-grain" />
                  <div className="hero-content">
                    <span className="hero-kicker">
                      <span /> CONSISTENCY IS YOUR SUPERPOWER
                    </span>
                    <h2>
                      {currentStreak} days.
                      <br />
                      <span>One stronger you.</span>
                    </h2>
                    <p>
                      You didn’t come this far to only come this far.
                      <br />
                      Your next check-in is a promise kept.
                    </p>
                    <div className="hero-footer">
                      {store.challenges.length === 0 ? (
                        <button
                          className="button flame-button"
                          onClick={() => setDialog('create')}
                        >
                          Kindle your first habit stake <Plus size={17} />
                        </button>
                      ) : (
                        <button
                          className="button flame-button"
                          disabled={!remaining.length}
                          onClick={() => setCheckIn(remaining[0])}
                        >
                          {remaining.length ? 'Keep the streak going' : 'You showed up today'}
                          {remaining.length ? <ArrowUpRight size={17} /> : <Check size={17} />}
                        </button>
                      )}
                      <div className="hero-proof">
                        <span style={{ fontSize: '12.5px', color: '#cac9d1' }}>Sub-second 0.3s escrow on Monad.</span>
                      </div>
                    </div>
                  </div>
                  <div className="hero-visual">
                    <div className="orbit orbit-one" />
                    <div className="orbit orbit-two" />
                    <span className="spark spark-one">✦</span>
                    <span className="spark spark-two">✧</span>
                    <span className="spark spark-three">✦</span>
                    <FlameArt />
                    <span className="streak-bubble">
                      <Flame size={14} fill="currentColor" /> {currentStreak} DAY STREAK
                    </span>
                  </div>
                </section>
                <section className="streaks-section">
                  <div className="section-heading challenge-heading">
                    <div>
                      <h2>
                        Your daily promises{' '}
                        <span>{store.challenges.length.toString().padStart(2, '0')}</span>
                      </h2>
                      <p>Little actions. Big changes.</p>
                    </div>
                    <div className="segment-control">
                      <button
                        className={filter === 'active' ? 'active' : ''}
                        onClick={() => setFilter('active')}
                      >
                        Active
                      </button>
                      <button
                        className={filter === 'completed' ? 'active' : ''}
                        onClick={() => setFilter('completed')}
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                  <div className="habit-grid">
                    {store.challenges
                      .filter((c) =>
                        filter === 'active' ? c.completed < c.duration : c.completed >= c.duration,
                      )
                      .map((c) => (
                        <HabitCard
                          key={c.id}
                          challenge={c}
                          onCheckIn={() => setCheckIn(c)}
                          onDetails={() => setDetails(c)}
                        />
                      ))}
                  </div>
                  {store.challenges.filter((c) =>
                    filter === 'active' ? c.completed < c.duration : c.completed >= c.duration,
                  ).length === 0 && (
                    <div className="empty-state">
                      <Target size={32} />
                      <h3>
                        {filter === 'completed'
                          ? 'Good things take a few days.'
                          : 'A fresh start looks good on you.'}
                      </h3>
                      <p>
                        {filter === 'completed'
                          ? 'Finish a challenge and celebrate it here.'
                          : 'Create a challenge to start your next streak.'}
                      </p>
                      <button
                        className="button secondary"
                        onClick={() =>
                          filter === 'completed' ? setFilter('active') : setDialog('create')
                        }
                      >
                        {filter === 'completed' ? 'Back to active streaks' : 'Create a challenge'}
                      </button>
                    </div>
                  )}
                  <button className="join-banner" onClick={() => setDialog('join')}>
                    <span className="join-icon">
                      <Users size={21} />
                    </span>
                    <span>
                      <strong>Got an accountability buddy?</strong>
                      <small>Join their challenge. Keep each other going.</small>
                    </span>
                    <span className="join-action">
                      Enter invite code <ArrowRight size={16} />
                    </span>
                  </button>
                </section>
                <div className="daily-note">
                  <span>✳</span>
                  <p>
                    “You do not rise to the level of your goals. You fall to the level of your
                    systems.”<small>JAMES CLEAR · ATOMIC HABITS</small>
                  </p>
                </div>
              </div>
              <aside className="dashboard-rail">
                <section className="panel today-panel">
                  <div className="section-heading">
                    <h2>Today’s momentum</h2>
                    <span className="date-chip">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="momentum-content">
                    <div
                      className="progress-ring"
                      style={
                        {
                          '--progress': `${todayTotal ? (claimedToday / todayTotal) * 100 : 100}%`,
                        } as React.CSSProperties
                      }
                    >
                      <div>
                        <strong>
                          {claimedToday}
                          <span>/{todayTotal}</span>
                        </strong>
                        <small>CHECKED IN</small>
                      </div>
                    </div>
                    <div>
                      <strong>
                        {remaining.length ? 'You’ve got this.' : 'All done. All you.'}
                      </strong>
                      <p>
                        {remaining.length
                          ? `${remaining.length} small ${remaining.length === 1 ? 'promise' : 'promises'} to keep today.`
                          : 'Take a breath. You earned it.'}
                      </p>
                      <span className="momentum-label">
                        <Zap size={12} fill="currentColor" /> Every day counts
                      </span>
                    </div>
                  </div>
                  {featured?.earnedUsd !== undefined && (
                    <div className="sample-earnings">
                      <span>
                        Earned back <small>DEMO USD</small>
                      </span>
                      <strong>
                        ${featured.earnedUsd.toFixed(2)}{' '}
                        <span>/ ${featured.lockedUsd?.toFixed(2)} locked</span>
                      </strong>
                    </div>
                  )}
                </section>
                <Calendar checkedDates={checkedDates} />
                <FriendApprovals
                  compact
                  approvals={store.approvals}
                  onApprove={approve}
                  onViewAll={() => go('friends')}
                />
                <div className="rail-footnote">
                  <ShieldCheck size={14} />
                  <span>Your habits. Your commitment. Your growth.</span>
                </div>
              </aside>
            </div>
          ) : tab === 'friends' ? (
            <FriendApprovals approvals={store.approvals} onApprove={approve} />
          ) : (
            <div className="progress-page">
              <section className="panel progress-story">
                <span className="eyebrow">THE COMPOUND EFFECT</span>
                <h2>{totalCheckins} times you chose yourself.</h2>
                <p>
                  That’s {totalCheckins} promises kept. There’s no shortcut to consistency—and
                  you’re doing the work.
                </p>
                <div className="progress-bars">
                  {store.challenges.map((c) => (
                    <div key={c.id}>
                      <div>
                        <strong>{c.title}</strong>
                        <span>
                          {c.completed} / {c.duration} days
                        </span>
                      </div>
                      <div className={`progress-track ${c.kind}`}>
                        <span style={{ width: `${(c.completed / c.duration) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="progress-totals">
                  <div>
                    <Flame size={22} />
                    <strong>{longest}</strong>
                    <span>Longest streak</span>
                  </div>
                  <div>
                    <Check size={22} />
                    <strong>{totalCheckins}</strong>
                    <span>Total check-ins</span>
                  </div>
                  <div>
                    <Users size={22} />
                    <strong>{store.approvals.filter((a) => a.approved).length}</strong>
                    <span>Friends supported</span>
                  </div>
                </div>
              </section>
              <div>
                <Calendar checkedDates={checkedDates} />
                <div className="milestone-card">
                  <Sparkles size={23} />
                  <h3>Your next milestone</h3>
                  <p>
                    {longest < 7
                      ? `${7 - longest} more days to your first full week.`
                      : longest < 14
                        ? `${14 - longest} more days to two weeks of consistency.`
                        : 'You’re building something that lasts.'}
                  </p>
                  <button className="text-link" onClick={() => go('streaks')}>
                    Keep showing up <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
          <footer className="page-footer">
            <span>
              <Zap size={13} fill="currentColor" /> BUILT ON MONAD. BUILT FOR YOU.
            </span>
            <span>
              Small stakes. Stronger habits. <span className="footer-star">✦</span>
            </span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => go(t.id)}>
            <t.icon size={21} />
            <span>
              {t.id === 'friends' ? 'Friends' : t.id === 'progress' ? 'Progress' : 'Streaks'}
            </span>
            {t.id === 'friends' && pending > 0 && <i>{pending}</i>}
          </button>
        ))}
        <button onClick={() => setDialog('create')}>
          <Plus size={21} />
          <span>Create</span>
        </button>
      </nav>
      {toast && (
        <div className="toast" role="status">
          <span className="toast-icon">
            <Check size={16} />
          </span>
          {toast}
          <button aria-label="Dismiss notification" onClick={() => setToast('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {dialog === 'wallet' && <WalletModal onClose={() => setDialog(null)} />}
      {dialog === 'account' && (
        <AccountModal
          user={store.user}
          onClose={() => setDialog(null)}
          onLogin={(u) => store.loginUser(u)}
          onLogout={() => store.logoutUser()}
          notify={notify}
        />
      )}
      {dialog === 'create' && (
        <CreateChallenge
          onClose={() => setDialog(null)}
          onCreate={store.createChallenge}
          notify={notify}
        />
      )}
      {dialog === 'join' && (
        <JoinChallenge
          initialCode={invite}
          onClose={() => setDialog(null)}
          onJoin={(code) => {
            store.joinChallenge(code);
            go('streaks');
            notify('You’re in. Your next streak starts today.');
          }}
        />
      )}
      {checkIn && (
        <CheckInModal
          challenge={checkIn}
          onClose={() => setCheckIn(null)}
          onClaim={() => store.checkIn(checkIn.id)}
          sound={store.sound}
        />
      )}
      {details && (
        <Modal
          title={details.title}
          subtitle={details.description}
          onClose={() => setDetails(null)}
        >
          <div className="detail-streak">
            <FlameArt small />
            <h3>{details.completed} days strong.</h3>
          </div>
          <div className="commitment-summary">
            <div>
              <span>Progress</span>
              <strong>
                {details.completed} / {details.duration} days
              </strong>
            </div>
            <div>
              <span>Daily stake</span>
              <strong>{details.dailyStake} MON</strong>
            </div>
            <div>
              <span>Earned back</span>
              <strong>{stakeTotal(details.dailyStake, details.completed)} MON</strong>
            </div>
            {details.earnedUsd !== undefined && (
              <div>
                <span>Illustrative USD value</span>
                <strong>
                  ${details.earnedUsd.toFixed(2)} / ${details.lockedUsd?.toFixed(2)} locked
                </strong>
              </div>
            )}
          </div>
          <p className="helper">
            Demo balances. USD values are sample figures, not a live MON price.
          </p>
          <button
            className="invite-code full"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  `${window.location.origin}/?invite=${details.inviteCode}`,
                );
                notify('Invite link copied.');
              } catch {
                notify(`Invite code: ${details.inviteCode}`);
              }
            }}
          >
            {details.inviteCode}
            <Copy size={16} />
          </button>
          <button
            className="button primary full"
            disabled={details.lastCheckIn === dayKey() || details.completed >= details.duration}
            onClick={() => {
              setDetails(null);
              setCheckIn(details);
            }}
          >
            Check in for today <ArrowRight size={17} />
          </button>
        </Modal>
      )}
      {dialog === 'notifications' && (
        <Modal
          title="A little nudge."
          subtitle="Your daily reminders, all in one place."
          onClose={() => setDialog(null)}
        >
          <div className="notification-list">
            <button
              onClick={() => {
                setDialog(null);
                go('friends');
              }}
            >
              <Users />
              <span>
                <strong>{pending} friends need your approval</strong>
                <small>A quick check goes a long way.</small>
              </span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                setDialog(null);
                go('streaks');
              }}
            >
              <Flame />
              <span>
                <strong>
                  {remaining.length
                    ? `${remaining.length} habits ready for check-in`
                    : 'All caught up for today'}
                </strong>
                <small>Your next day starts with showing up.</small>
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
          <p className="helper">In-app demo reminders. Push notifications are not enabled.</p>
        </Modal>
      )}
      {dialog === 'settings' && (
        <Modal
          title="Your little corner."
          subtitle="Make Dracarys feel like you."
          onClose={() => setDialog(null)}
        >
          <div
            className="settings-profile"
            onClick={() => setDialog('account')}
            style={{ cursor: 'pointer' }}
          >
            <span className={`avatar profile-avatar ${store.user?.avatar_color || 'purple'}`}>
              {store.user?.initials || 'CK'}
            </span>
            <div>
              <h3>{store.user?.display_name || 'Anonymous User'}</h3>
              <p>{store.user?.bio || 'Tap to sign in or create account'}</p>
            </div>
          </div>
          <button className="setting-row" onClick={() => setDialog('account')}>
            <Users size={20} />
            <span>Manage Account / Switch Friend</span>
            <ArrowUpRight size={18} />
          </button>
          <button className="setting-row" onClick={() => store.setSound(!store.sound)}>
            {store.sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <span>Celebration sounds</span>
            <span
              className={`toggle ${store.sound ? 'on' : ''}`}
              role="switch"
              aria-checked={store.sound}
              aria-label="Celebration sounds"
            >
              <i />
            </span>
          </button>
          <button className="setting-row" onClick={() => setDialog('wallet')}>
            <Wallet size={20} />
            <span>{isConnected ? 'Manage wallet' : 'Connect wallet'}</span>
            <ArrowUpRight size={18} />
          </button>
          <div className="info-box">
            Mock progress is saved in this browser. Proof photos are only previewed and are not
            uploaded.
          </div>
          <button
            className="button secondary full"
            onClick={() =>
              notify(
                'To install: choose Add to Home Screen in your browser menu. On iPhone, use Safari’s Share menu.',
              )
            }
          >
            Install Dracarys on your phone
          </button>
          <button
            className="button secondary full"
            onClick={() => {
              store.reset();
              setDialog(null);
              notify('Demo reset. A fresh start awaits.');
            }}
          >
            Reset demo progress
          </button>
        </Modal>
      )}
    </div>
  );
}
