'use client';
import { useState } from 'react';
import { useConnection, useDisconnect } from 'wagmi';
import {
  User,
  LogOut,
  Wallet,
  ShieldCheck,
  Check,
  UserPlus,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Modal } from './modal';
import { UserProfile } from '@/lib/types';
import { DEFAULT_USERS } from '@/lib/mock-data';

export function AccountModal({
  user,
  onClose,
  onLogin,
  onLogout,
  notify,
}: {
  user: UserProfile | null;
  onClose: () => void;
  onLogin: (u: UserProfile) => void;
  onLogout: () => void;
  notify: (msg: string) => void;
}) {
  const { address, isConnected } = useConnection();
  const { disconnect } = useDisconnect();

  const [mode, setMode] = useState<'view' | 'login' | 'create'>(user ? 'view' : 'login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [color, setColor] = useState('purple');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Available avatar colors
  const colors = [
    { id: 'purple', label: 'Purple' },
    { id: 'peach', label: 'Peach' },
    { id: 'mint', label: 'Mint' },
    { id: 'lilac', label: 'Lilac' },
    { id: 'orange', label: 'Orange' },
  ];

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) {
      setError('Please provide both a username and display name.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const parts = displayName.trim().split(' ');
    const initials =
      parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      username: cleanUsername,
      display_name: displayName.trim(),
      wallet_address: address || undefined,
      bio: bio.trim() || 'Kindling my flame on Monad 🔥',
      avatar_color: color,
      initials,
      streak_count: 1,
      total_earned_mon: 0.05,
    };

    setBusy(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dracarys-monad-z59m.vercel.app';
      const res = await fetch(`${apiUrl}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          display_name: displayName.trim(),
          wallet_address: address || undefined,
          bio: bio.trim() || 'Kindling my flame on Monad 🔥',
          avatar_color: color,
          initials,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        onLogin(saved);
      } else {
        // Fallback to local user
        onLogin(newUser);
      }
    } catch {
      onLogin(newUser);
    }

    setBusy(false);
    notify(`Welcome to Dracarys, ${displayName.trim()}! 🔥`);
    onClose();
  }

  function handleQuickLogin(selected: UserProfile) {
    onLogin(selected);
    notify(`Logged in as ${selected.display_name}`);
    onClose();
  }

  function handleDisconnectWallet() {
    disconnect();
    notify('Wallet disconnected successfully.');
  }

  function handleLogOut() {
    onLogout();
    notify('Logged out of account.');
    setMode('login');
  }

  return (
    <Modal
      title={
        mode === 'view'
          ? 'Your Dracarys Profile'
          : mode === 'create'
            ? 'Create Your Account'
            : 'Sign In to Dracarys'
      }
      subtitle={
        mode === 'view'
          ? 'Manage your habit identity and connected wallet.'
          : mode === 'create'
            ? 'Stake micro-habits and hold your circle accountable.'
            : 'Choose your friend profile or sign in.'
      }
      onClose={onClose}
    >
      {mode === 'view' && user && (
        <div className="account-view">
          <div className="account-header-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: '#1c1b22', borderRadius: '14px', border: '1px solid #37353f' }}>
            <span className={`avatar ${user.avatar_color}`} style={{ width: '54px', height: '54px', fontSize: '20px' }}>
              {user.initials}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '18px' }}>{user.display_name}</strong>
                <span style={{ fontSize: '12px', color: '#a193ff', background: 'rgba(161,147,255,0.15)', padding: '2px 8px', borderRadius: '999px' }}>
                  @{user.username}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', color: '#919099', fontSize: '13px' }}>{user.bio}</p>
            </div>
          </div>

          <div className="commitment-summary" style={{ margin: '14px 0' }}>
            <div>
              <span>Current Streak</span>
              <strong>{user.streak_count || 5} days 🔥</strong>
            </div>
            <div>
              <span>Earned Back</span>
              <strong>{(user.total_earned_mon || 0.25).toFixed(2)} MON</strong>
            </div>
          </div>

          {/* Wallet Connection Status */}
          <div className="wallet-status-box" style={{ background: '#141418', border: '1px solid #2a292f', borderRadius: '12px', padding: '12px 14px', margin: '12px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#cac9d1' }}>
                <Wallet size={16} /> Linked Wallet
              </span>
              <span style={{ fontSize: '12px', color: isConnected ? '#a4cbb0' : '#ff824c', fontWeight: 600 }}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            {isConnected ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <code style={{ fontSize: '12.5px', color: '#f5f4f7' }}>
                  {address?.slice(0, 10)}…{address?.slice(-6)}
                </code>
                <button
                  type="button"
                  onClick={handleDisconnectWallet}
                  style={{ fontSize: '12px', color: '#ff824c', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', textDecoration: 'underline' }}
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#919099' }}>
                Connect MetaMask in the top bar to sign on-chain habit escrows.
              </p>
            )}
          </div>

          {/* Switch Friends Section */}
          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '12px', color: '#919099', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Switch Friend Profile
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {DEFAULT_USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  style={{
                    flex: 1,
                    padding: '8px 6px',
                    borderRadius: '10px',
                    background: u.username === user.username ? '#2a2935' : '#17171d',
                    border: u.username === user.username ? '1px solid #a193ff' : '1px solid #2a292f',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <span className={`avatar tiny ${u.avatar_color}`}>{u.initials}</span>
                  <small style={{ fontWeight: 600, color: '#f5f4f7' }}>{u.display_name}</small>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="button secondary" style={{ flex: 1 }} onClick={() => setMode('create')}>
              <UserPlus size={16} /> New Account
            </button>
            <button
              className="button secondary"
              style={{ flex: 1, color: '#ff824c', borderColor: '#ff824c33' }}
              onClick={handleLogOut}
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>
      )}

      {mode === 'login' && (
        <div className="account-login">
          <p style={{ fontSize: '13.5px', color: '#cac9d1', marginBottom: '14px' }}>
            Select your friend profile to instantly load your active habit stakes and approvals:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DEFAULT_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => handleQuickLogin(u)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: '#191920',
                  border: '1px solid #2f2d38',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
              >
                <span className={`avatar ${u.avatar_color}`} style={{ width: '42px', height: '42px' }}>
                  {u.initials}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '15px' }}>{u.display_name}</strong>
                    <span style={{ fontSize: '11px', color: '#a193ff' }}>@{u.username}</span>
                  </div>
                  <small style={{ color: '#919099' }}>{u.bio}</small>
                </div>
                <ArrowRight size={16} style={{ color: '#919099' }} />
              </button>
            ))}
          </div>

          {isConnected && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#1c1b22', borderRadius: '12px', border: '1px solid #37353f' }}>
              <span style={{ fontSize: '12px', color: '#a4cbb0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} /> Wallet Connected: {address?.slice(0, 8)}…{address?.slice(-6)}
              </span>
            </div>
          )}

          <div style={{ marginTop: '18px', textAlign: 'center' }}>
            <button className="button primary full" onClick={() => setMode('create')}>
              <UserPlus size={16} /> Create Brand New Account
            </button>
          </div>
        </div>
      )}

      {mode === 'create' && (
        <form onSubmit={handleCreateAccount} className="account-create">
          <label className="field-label" htmlFor="acc-display-name">
            Your Name
          </label>
          <input
            id="acc-display-name"
            autoFocus
            required
            maxLength={40}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Chandu Kasireddy"
          />

          <label className="field-label" htmlFor="acc-username">
            Username
          </label>
          <input
            id="acc-username"
            required
            maxLength={25}
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="e.g. chandu"
          />

          <label className="field-label" htmlFor="acc-bio">
            Short Bio / Daily Goal
          </label>
          <input
            id="acc-bio"
            maxLength={80}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="e.g. 10k steps and gym every day"
          />

          <label className="field-label">Avatar Color</label>
          <div style={{ display: 'flex', gap: '8px', margin: '6px 0 14px' }}>
            {colors.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setColor(c.id)}
                className={`avatar tiny ${c.id}`}
                style={{
                  outline: color === c.id ? '2px solid #b9aaff' : 'none',
                  outlineOffset: '2px',
                  cursor: 'pointer',
                }}
              >
                {color === c.id ? <Check size={14} /> : ''}
              </button>
            ))}
          </div>

          {isConnected ? (
            <div style={{ padding: '10px 12px', background: '#1c1b22', borderRadius: '10px', border: '1px solid #37353f', fontSize: '12px', color: '#cac9d1', marginBottom: '14px' }}>
              <ShieldCheck size={15} style={{ display: 'inline', marginRight: '6px', color: '#a4cbb0' }} />
              Will bind to connected wallet: <strong>{address?.slice(0, 6)}…{address?.slice(-4)}</strong>
            </div>
          ) : (
            <div style={{ padding: '10px 12px', background: '#19191e', borderRadius: '10px', border: '1px solid #2a292f', fontSize: '12px', color: '#919099', marginBottom: '14px' }}>
              <Wallet size={15} style={{ display: 'inline', marginRight: '6px' }} />
              You can connect your wallet anytime after creating your account.
            </div>
          )}

          {error && (
            <p className="form-error" role="alert" style={{ marginBottom: '12px' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="button secondary"
              style={{ flex: 1 }}
              onClick={() => setMode(user ? 'view' : 'login')}
            >
              Back
            </button>
            <button type="submit" className="button primary" style={{ flex: 2 }} disabled={busy}>
              <Sparkles size={16} /> {busy ? 'Creating…' : 'Create & Sign In'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
