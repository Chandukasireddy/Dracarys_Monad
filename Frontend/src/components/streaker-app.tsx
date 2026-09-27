'use client';
import { useState, useEffect, useRef } from 'react';
import { useConnection } from 'wagmi';
import { parseEventLogs, formatEther } from 'viem';
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
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useStreaker, stakeTotal, type RemoteStreak } from '@/hooks/use-streaker';
import { Challenge, dayKey, challengeDates, longestRun, currentRun } from '@/lib/types';
import { FlameArt } from './flame';
import { HabitCard } from './habit-card';
import { Calendar } from './calendar';
import { FriendApprovals } from './friend-approvals';
import { Modal } from './modal';
import { CheckInModal } from './check-in-modal';
import { CreateChallenge, EditChallenge, JoinChallenge } from './create-challenge';
import { WalletModal } from './wallet-modal';
import { PwaControl } from './pwa';
import { AccountModal } from './account-modal';
import { useChallengeContract } from '@/hooks/use-challenge-contract';
import { useMoneyAlerts } from '@/hooks/use-money-alerts';
import { DRACARYS_ABI } from '@/lib/contract';

type Tab = 'streaks' | 'friends' | 'progress';
const SIDEBAR_KEY = 'streaker-sidebar-collapsed';
type Dialog = 'create' | 'join' | 'wallet' | 'settings' | 'notifications' | 'account' | null;
export function StreakerApp() {
  const store = useStreaker();
  const { address, isConnected } = useConnection();
  const contract = useChallengeContract();
  const [tab, setTab] = useState<Tab>('streaks'),
    [dialog, setDialog] = useState<Dialog>(null),
    [checkIn, setCheckIn] = useState<Challenge | null>(null),
    [details, setDetails] = useState<Challenge | null>(null),
    [editing, setEditing] = useState<Challenge | null>(null),
    [toast, setToast] = useState(''),
    [filter, setFilter] = useState<'active' | 'completed'>('active'),
    [detailsInvited, setDetailsInvited] = useState<Record<string, boolean>>({}),
    [invite, setInvite] = useState(''),
    [collapsed, setCollapsed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const notify = (message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 5500);
  };
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_KEY) === '1');
    } catch {}
    const code = new URLSearchParams(window.location.search).get('invite');
    if (code) {
      setInvite(code);
      setDialog('join');
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  const money = useMoneyAlerts(store.challenges, contract, address, notify);
  const collectable = money.summaries.filter((m) => m.collectable > 0n);
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
  const createChallenge = async (
    input: Pick<Challenge, 'title' | 'duration' | 'dailyStake' | 'kind'>,
  ) => {
    let onchainId: string | undefined;
    if (isConnected) {
      if (!contract.configured) throw new Error('The Dracarys contract is not configured.');
      const receipt = await contract.igniteStreak(input.title, input.duration, input.dailyStake);
      const events = parseEventLogs({
        abi: DRACARYS_ABI,
        eventName: 'StreakIgnited',
        logs: receipt.logs,
      });
      onchainId = events[0]?.args.streakId?.toString();
      notify(`Challenge confirmed on Monad${onchainId ? ` as streak #${onchainId}` : ''}.`);
    }
    return store.createChallenge({ ...input, onchainId });
  };
  const joinOnchain = async (streak: RemoteStreak) => {
    if (!streak.onchain_id) return; // demo challenge without an escrow
    if (!isConnected) throw new Error('Connect your wallet to lock your stake for this challenge.');
    await contract.joinStreak(BigInt(streak.onchain_id));
    notify('Your stake is locked in the Monad escrow.');
  };
  const claimCheckIn = async (proofUri: string) => {
    if (isConnected) {
      if (!checkIn?.onchainId) {
        throw new Error('This challenge is demo-only. Create a new challenge with your wallet connected.');
      }
      const receipt = await contract.submitProof(BigInt(checkIn.onchainId), proofUri);
      notify('Check-in confirmed on Monad Testnet.');
      // Group check-ins only pay out after a friend approves, so friends need to see the proof.
      const day = parseEventLogs({ abi: DRACARYS_ABI, eventName: 'ProofSubmitted', logs: receipt.logs })[0]
        ?.args.day;
      if (checkIn.members > 1 && day && address) {
        try {
          const proof = await fetch(proofUri).then((res) => res.blob());
          await store.uploadProof(checkIn.id, proof, Number(day), address);
        } catch (error) {
          notify(error instanceof Error ? error.message : 'Friends could not be notified.');
        }
      }
    }
    return store.checkIn(checkIn?.id || '');
  };
  const claimCompletionReward = async () => {
    if (!details?.onchainId) {
      notify('This challenge was created in demo mode and has no on-chain reward.');
      return;
    }
    try {
      await contract.claimCompletionReward(BigInt(details.onchainId));
      notify('Winner reward claimed from Monad Testnet.');
      setDetails(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Reward claim failed.');
    }
  };
  // Only the creator can edit; challenges without a known creator were made on this device.
  const canEdit = (c: Challenge) => !c.creatorId || c.creatorId === store.user?.id;
  const [collecting, setCollecting] = useState<string | null>(null);
  const collectMissedDays = async (challenge: Challenge) => {
    if (!challenge.onchainId) return;
    setCollecting(challenge.id);
    try {
      const days = await contract.collectMissedDays(BigInt(challenge.onchainId));
      if (!days) notify('Nothing to collect yet. A missed day can be collected once it is over.');
      await money.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message.split('\n')[0] : 'Collecting failed.');
    } finally {
      setCollecting(null);
    }
  };
  const removeChallenge = async (challenge: Challenge) => {
    const leaving = !canEdit(challenge);
    if (
      !window.confirm(
        leaving
          ? `Leave "${challenge.title}"? It will be removed from your dashboard.${challenge.onchainId ? ' Any MON you locked stays in the challenge.' : ''}`
          : `Delete "${challenge.title}"? This removes it for everyone in the challenge.`,
      )
    )
      return;
    if (challenge.onchainId && isConnected && !leaving) {
      try {
        await contract.cancelStreak(BigInt(challenge.onchainId));
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'The refund failed.';
        // Group or already-started challenges cannot be refunded; the stake stays in escrow.
        if (
          !window.confirm(
            `Your stake could not be refunded on-chain (${reason.split('\n')[0]}). Delete anyway? Any locked MON stays in the escrow.`,
          )
        )
          return;
      }
    }
    try {
      await store.deleteChallenge(challenge.id);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'The challenge could not be deleted.');
      return;
    }
    setDetails(null);
    notify(leaving ? 'You left the challenge.' : 'Challenge deleted.');
  };
  const approve = (id: string) => {
    store.approveFriend(id);
    navigator.vibrate?.(30);
    notify('Approved. A little support, a stronger streak.');
  };
  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
    } catch {}
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
          streaker<span className="brand-period">.</span>
        </span>
        <p>Build streaks. A little every day.</p>
      </div>
    );
  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <div className="sidebar-header">
          <a className="brand" href="/" aria-label="Streaker home">
            <span className="brand-icon">
              <Flame fill="currentColor" size={23} />
            </span>
            <span className="brand-text">
              streaker<span className="brand-period">.</span>
            </span>
          </a>
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        <nav aria-label="Main navigation">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`nav-item ${tab === t.id ? 'active' : ''}`}
              aria-current={tab === t.id ? 'page' : undefined}
              aria-label={t.label}
              title={collapsed ? t.label : undefined}
              onClick={() => go(t.id)}
            >
              <t.icon size={19} />
              <span className="nav-label">{t.label}</span>
              {t.id === 'friends' && pending > 0 && <span className="nav-count">{pending}</span>}
            </button>
          ))}
        </nav>
        <button
          className="sidebar-create"
          onClick={() => setDialog('create')}
          aria-label="Create a challenge"
          title={collapsed ? 'Create a challenge' : undefined}
        >
          <Plus size={18} /> <span className="nav-label">Create a challenge</span>
        </button>
        <div className="sidebar-bottom">
          <PwaControl notify={notify} />
          <button
            className="profile"
            onClick={() => setDialog('account')}
            title={collapsed ? store.user?.display_name || 'Sign in' : undefined}
          >
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
            <button
              className="mobile-brand"
              onClick={() => setDialog('account')}
              aria-label="Open profile and account"
            >
              <Flame size={20} fill="currentColor" /> streaker.
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
                <span style={{ fontSize: '11px', color: '#ff7a45' }}>{currentStreak} 🔥</span>
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
              {(pending > 0 || collectable.length > 0) && <i />}
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
                  {longest} <small>{longest === 1 ? 'day' : 'days'}</small>
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
                      {currentStreak} {currentStreak === 1 ? 'day' : 'days'}.
                      <br />
                      <span>One stronger you.</span>
                    </h2>
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
                    </div>
                  </div>
                  <div className="hero-visual">
                    <div className="orbit orbit-one" />
                    <div className="orbit orbit-two" />
                    <FlameArt />
                    <span className="streak-bubble">
                      <Flame size={14} fill="currentColor" /> {currentStreak}{' '}
                      {currentStreak === 1 ? 'DAY' : 'DAYS'} STREAK
                    </span>
                  </div>
                </section>

                {/* Incoming Challenge Invitations Banner */}
                {store.invitations && store.invitations.length > 0 && (
                  <section
                    className="panel"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255, 130, 76, 0.14) 0%, rgba(161, 147, 255, 0.09) 100%)',
                      border: '1px solid rgba(255, 130, 76, 0.4)',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      marginBottom: '22px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Flame size={20} style={{ color: '#ff824c' }} />
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 600 }}>
                          Incoming Challenge Invitations ({store.invitations.length})
                        </h3>
                      </div>
                      <span
                        style={{
                          fontSize: '11.5px',
                          color: '#ff824c',
                          fontWeight: 600,
                          background: 'rgba(255, 130, 76, 0.15)',
                          padding: '3px 10px',
                          borderRadius: '12px',
                        }}
                      >
                        Action Required 🔥
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {store.invitations.map((inv) => (
                        <article
                          key={inv.id}
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(20, 20, 26, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '14px 16px',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px',
                              }}
                            >
                              <span className={`avatar tiny ${inv.inviter_color || 'purple'}`}>
                                {(inv.inviter_name || inv.inviter_username || 'AJ')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </span>
                              <strong style={{ fontSize: '13.5px', color: '#fff' }}>
                                {inv.inviter_name || `@${inv.inviter_username}`} invited you to join
                              </strong>
                            </div>
                            <h4
                              style={{
                                margin: '4px 0 2px',
                                fontSize: '15px',
                                color: '#ff824c',
                              }}
                            >
                              {inv.streak_title}
                            </h4>
                            <p style={{ margin: 0, fontSize: '12.5px', color: '#a8a6b6' }}>
                              {inv.streak_duration} days · {inv.streak_stake} MON / day · Code:{' '}
                              <code style={{ color: '#fff' }}>{inv.streak_invite_code}</code>
                            </p>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="button primary"
                              style={{ fontSize: '13px', padding: '8px 14px' }}
                              onClick={async () => {
                                try {
                                  await store.respondToInvitation(inv.id, true, joinOnchain);
                                  notify(
                                    `Challenge accepted! You've joined "${inv.streak_title}" 🔥`,
                                  );
                                } catch (e) {
                                  notify((e as Error).message);
                                }
                              }}
                            >
                              <Check size={16} /> Accept & Join 🔥
                            </button>
                            <button
                              className="button secondary"
                              style={{ fontSize: '13px', padding: '8px 12px', color: '#888' }}
                              onClick={async () => {
                                try {
                                  await store.respondToInvitation(inv.id, false);
                                  notify(`Declined invitation for "${inv.streak_title}".`);
                                } catch (e) {
                                  notify((e as Error).message);
                                }
                              }}
                            >
                              <X size={15} /> Decline
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

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
                          onEdit={canEdit(c) ? () => setEditing(c) : undefined}
                          onDelete={() => removeChallenge(c)}
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
                </section>
                <Calendar checkedDates={checkedDates} />
                <FriendApprovals
                  compact
                  approvals={store.approvals}
                  onApprove={approve}
                  onViewAll={() => go('friends')}
                />
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
          onCreate={createChallenge}
          notify={notify}
          registeredUsers={store.registeredUsers}
          currentUser={store.user}
          onInviteFriend={store.inviteFriend}
        />
      )}
      {dialog === 'join' && (
        <JoinChallenge
          initialCode={invite}
          onClose={() => setDialog(null)}
          onJoin={async (code) => {
            try {
              await store.joinChallenge(code, joinOnchain);
              go('streaks');
              notify('You’re in. Your next streak starts today.');
            } catch (error) {
              notify(error instanceof Error ? error.message : 'Could not join this challenge.');
            }
          }}
        />
      )}
      {editing && (
        <EditChallenge
          challenge={editing}
          onClose={() => setEditing(null)}
          onSave={async (changes) => {
            await store.editChallenge(editing.id, changes);
            notify('Challenge updated.');
          }}
        />
      )}
      {checkIn && (
        <CheckInModal
          challenge={checkIn}
          onClose={() => setCheckIn(null)}
          onClaim={claimCheckIn}
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
          </div>
          {(() => {
            const summary = money.summaries.find((m) => m.challengeId === details.id);
            if (!summary) return null;
            return (
              <>
                <div className="commitment-summary money-summary">
                  <div>
                    <span>Deducted from you</span>
                    <strong className="money-lost">−{formatEther(summary.lost)} MON</strong>
                  </div>
                  <div>
                    <span>Won from friends</span>
                    <strong className="money-won">+{formatEther(summary.won)} MON</strong>
                  </div>
                </div>
                {summary.collectable > 0n && (
                  <button
                    className="button primary full"
                    disabled={collecting === details.id}
                    onClick={() => collectMissedDays(details)}
                  >
                    <Wallet size={16} />{' '}
                    {collecting === details.id
                      ? 'Collecting… approve each day in MetaMask'
                      : `Collect ${formatEther(summary.collectable)} MON from missed days`}
                  </button>
                )}
              </>
            );
          })()}
          {details.completed >= details.duration && details.onchainId && isConnected && (
            <button className="button primary full" onClick={claimCompletionReward}>
              <Wallet size={17} /> Claim winner reward
            </button>
          )}
          {canEdit(details) && (
            <button
              className="button secondary full"
              onClick={() => {
                setEditing(details);
                setDetails(null);
              }}
            >
              <Pencil size={16} /> Edit challenge
            </button>
          )}
          <button className="button secondary full danger" onClick={() => removeChallenge(details)}>
            <Trash2 size={16} /> {canEdit(details) ? 'Delete challenge' : 'Leave challenge'}
          </button>
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

          {/* Direct Friend Invitations from Details Modal */}
          {store.registeredUsers && store.registeredUsers.filter((u) => u.id !== store.user?.id).length > 0 && (
            <div
              style={{
                marginTop: '14px',
                marginBottom: '14px',
                background: '#15141c',
                border: '1px solid #282736',
                borderRadius: '12px',
                padding: '12px 14px',
              }}
            >
              <h4
                style={{
                  margin: '0 0 8px',
                  fontSize: '13px',
                  color: '#ff824c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Users size={15} /> Add Registered Friends to this Challenge
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '130px',
                  overflowY: 'auto',
                }}
              >
                {store.registeredUsers
                  .filter((u) => u.id !== store.user?.id)
                  .map((friend) => {
                    const isInv = detailsInvited[friend.id];
                    return (
                      <div
                        key={friend.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#1c1b26',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid #2d2b38',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`avatar tiny ${friend.avatar_color || 'purple'}`}>
                            {friend.initials || friend.username.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <strong style={{ fontSize: '12.5px', color: '#fff', display: 'block' }}>
                              {friend.display_name}
                            </strong>
                            <span style={{ fontSize: '11px', color: '#888' }}>@{friend.username}</span>
                          </div>
                        </div>
                        <button
                          className="button secondary"
                          style={{
                            padding: '3px 8px',
                            fontSize: '11px',
                            minHeight: 'unset',
                            borderColor: isInv ? '#a4cbb0' : undefined,
                          }}
                          disabled={isInv}
                          onClick={async () => {
                            try {
                              await store.inviteFriend(details.id, friend.id);
                              setDetailsInvited((prev) => ({ ...prev, [friend.id]: true }));
                              notify(`Invited @${friend.username} to ${details.title}! 🔥`);
                            } catch (e) {
                              notify((e as Error).message);
                            }
                          }}
                        >
                          {isInv ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#a4cbb0' }}>
                              <Check size={12} /> Invited
                            </span>
                          ) : (
                            '+ Invite 🔥'
                          )}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

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
            {money.summaries
              .filter((m) => m.lost > 0n || m.won > 0n)
              .map((m) => (
                <div key={m.challengeId} className="money-notification">
                  <Wallet />
                  <span>
                    <strong>{m.title}</strong>
                    {m.lost > 0n && (
                      <small className="money-lost">
                        −{formatEther(m.lost)} MON deducted for missed days
                      </small>
                    )}
                    {m.won > 0n && (
                      <small className="money-won">+{formatEther(m.won)} MON added to your wallet</small>
                    )}
                  </span>
                </div>
              ))}
            {collectable.map((m) => {
              const challenge = store.challenges.find((c) => c.id === m.challengeId);
              return (
                <button
                  key={`collect-${m.challengeId}`}
                  disabled={collecting === m.challengeId}
                  onClick={() => challenge && collectMissedDays(challenge)}
                >
                  <Wallet />
                  <span>
                    <strong>
                      Collect {formatEther(m.collectable)} MON from “{m.title}”
                    </strong>
                    <small>A friend missed a day. Approve each day in MetaMask.</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              );
            })}
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
          <p className="helper">
            MetaMask doesn’t list payouts from the contract. Check MonadVision under Internal
            Transactions to see MON you received.
          </p>
        </Modal>
      )}
      {dialog === 'settings' && (
        <Modal
          title="Your little corner."
          subtitle="Make Streaker feel like you."
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
            Connected to Neon PostgreSQL & Monad Testnet (Chain ID 10143). Escrow contract 0x7754...46E7.
          </div>
          <button
            className="button secondary full"
            onClick={() =>
              notify(
                'To install: choose Add to Home Screen in your browser menu. On iPhone, use Safari’s Share menu.',
              )
            }
          >
            Install Streaker on your phone
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
