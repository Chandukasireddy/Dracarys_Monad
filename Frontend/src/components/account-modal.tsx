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
  Lock,
  Mail,
  KeyRound,
  ExternalLink,
  Copy,
  Trash2,
} from 'lucide-react';
import { Modal } from './modal';
import { UserProfile } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dracarys-monad-z59m.vercel.app';

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
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [color, setColor] = useState('purple');

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const colors = [
    { id: 'purple', label: 'Purple' },
    { id: 'peach', label: 'Peach' },
    { id: 'mint', label: 'Mint' },
    { id: 'lilac', label: 'Lilac' },
    { id: 'orange', label: 'Orange' },
  ];

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const cleanId = loginIdentifier.trim();
    if (!cleanId) {
      setError('Please enter your username or email.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username_or_email: cleanId,
          password: loginPassword || undefined,
          wallet_address: address || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Invalid username or password.');
      }

      const loggedUser = await res.json();
      onLogin(loggedUser);
      notify(`Welcome back, ${loggedUser.display_name}! 🔥`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setBusy(false);
    }
  }

  async function handleWalletQuickLogin() {
    if (!address) {
      setError('Please connect your MetaMask or EVM wallet first.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username_or_email: address,
          wallet_address: address,
        }),
      });

      if (res.ok) {
        const loggedUser = await res.json();
        onLogin(loggedUser);
        notify(`Logged in with wallet: ${address.slice(0, 6)}…${address.slice(-4)}`);
        onClose();
      } else {
        // If not registered yet with this wallet, switch to create tab with wallet pre-filled
        setMode('create');
        notify('No account linked to this wallet yet. Create your profile below!');
      }
    } catch {
      setMode('create');
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!displayName.trim()) {
      setError('Please provide your name.');
      return;
    }
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Username must be at least 3 alphanumeric characters.');
      return;
    }
    if (password && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const parts = displayName.trim().split(' ');
    const initials =
      parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();

    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          display_name: displayName.trim(),
          email: email.trim() || undefined,
          password: password || undefined,
          wallet_address: address || undefined,
          bio: bio.trim() || 'Kindling my flame on Monad 🔥',
          avatar_color: color,
          initials,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Could not create account. Username might be taken.');
      }

      const createdUser = await res.json();
      onLogin(createdUser);
      notify(`Welcome to Dracarys, ${displayName.trim()}! Flame kindled 🔥`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  }

  function handleDisconnectWallet() {
    disconnect();
    notify('Wallet disconnected successfully.');
  }

  function handleLogOut() {
    onLogout();
    notify('Logged out of Dracarys.');
    setMode('login');
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          ? 'Manage your habit identity, wallet binding, and streaks.'
          : mode === 'create'
            ? 'Join the arena. Stake habits, kindle your flame.'
            : 'Sign in to access your streaks and peer approvals.'
      }
      onClose={onClose}
    >
      {/* ================= VIEW PROFILE MODE ================= */}
      {mode === 'view' && user && (
        <div className="account-view">
          <div
            className="account-header-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px',
              background: '#1c1b22',
              borderRadius: '14px',
              border: '1px solid #37353f',
            }}
          >
            <span
              className={`avatar ${user.avatar_color || 'purple'}`}
              style={{ width: '56px', height: '56px', fontSize: '22px' }}
            >
              {user.initials || user.display_name.slice(0, 2).toUpperCase()}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '18px' }}>{user.display_name}</strong>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#a193ff',
                    background: 'rgba(161,147,255,0.15)',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontWeight: 600,
                  }}
                >
                  @{user.username}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', color: '#919099', fontSize: '13px' }}>
                {user.bio || 'Kindling my flame on Monad 🔥'}
              </p>
            </div>
          </div>

          <div className="commitment-summary" style={{ margin: '14px 0' }}>
            <div>
              <span>Current Streak</span>
              <strong>{user.streak_count || 0} days 🔥</strong>
            </div>
            <div>
              <span>Earned Back</span>
              <strong>{(user.total_earned_mon || 0).toFixed(2)} MON</strong>
            </div>
          </div>

          {/* Linked Wallet Section */}
          <div
            className="wallet-status-box"
            style={{
              background: '#141418',
              border: '1px solid #2a292f',
              borderRadius: '12px',
              padding: '14px',
              margin: '14px 0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#cac9d1' }}>
                <Wallet size={16} /> Linked Monad Wallet
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: isConnected ? '#a4cbb0' : '#ff824c',
                  background: isConnected ? 'rgba(164,203,176,0.12)' : 'rgba(255,130,76,0.12)',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  fontWeight: 600,
                }}
              >
                {isConnected ? 'Active & Ready' : 'Disconnected'}
              </span>
            </div>

            {isConnected && address ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#0d0d10',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #222129',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: '#e4e3ea',
                  }}
                >
                  <span>{address.slice(0, 8)}…{address.slice(-6)}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="icon-button"
                      title="Copy Address"
                      onClick={() => handleCopy(address)}
                      style={{ padding: '4px', color: copied ? '#a4cbb0' : '#919099' }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <a
                      href={`https://testnet.monadvision.com/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-button"
                      title="View on MonadVision"
                      style={{ padding: '4px', color: '#919099' }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleDisconnectWallet}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ff824c',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                    }}
                  >
                    <Trash2 size={13} /> Remove / Disconnect Wallet
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ margin: '4px 0 0', color: '#919099', fontSize: '12px' }}>
                Connect MetaMask in the top bar to sign on-chain habit escrows and receive 0.3s micro-payouts.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              className="button secondary"
              style={{ flex: 1, color: '#ff824c', borderColor: 'rgba(255,130,76,0.25)' }}
              onClick={handleLogOut}
            >
              <LogOut size={16} /> Log Out
            </button>
            <button className="button primary" style={{ flex: 1 }} onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* ================= SIGN IN MODE ================= */}
      {mode === 'login' && (
        <div className="account-login-flow">
          {/* Dragon Flame Brand Logo Header */}
          <div
            style={{
              textAlign: 'center',
              padding: '16px 0 20px',
              borderBottom: '1px solid #23222a',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 12px',
                background: 'linear-gradient(135deg, #ff5722 0%, #ff9800 50%, #8338ec 100%)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(255,87,34,0.3)',
              }}
            >
              <Flame size={36} fill="#ffffff" color="#ffffff" />
            </div>
            <h2
              style={{
                margin: '0 0 4px',
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(90deg, #ff7a45, #ffa940, #b37feb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              DRACARYS
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#919099' }}>
              Sub-second habit staking & peer consensus on Monad
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(255,82,82,0.1)',
                border: '1px solid rgba(255,82,82,0.3)',
                borderRadius: '10px',
                padding: '10px 12px',
                color: '#ff6b6b',
                fontSize: '13px',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <label className="field-label" htmlFor="login-id">
              Username or Email
            </label>
            <input
              id="login-id"
              autoFocus
              required
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              placeholder="e.g. chandu or your@email.com"
              style={{ marginBottom: '14px' }}
            />

            <label className="field-label" htmlFor="login-pwd">
              Password
            </label>
            <input
              id="login-pwd"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              style={{ marginBottom: '18px' }}
            />

            <button type="submit" className="button primary full" disabled={busy}>
              <KeyRound size={16} /> {busy ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          {/* Quick Wallet Login Option */}
          {isConnected && (
            <div style={{ marginTop: '14px' }}>
              <button
                type="button"
                className="button secondary full"
                onClick={handleWalletQuickLogin}
                disabled={busy}
                style={{
                  borderColor: 'rgba(164,203,176,0.3)',
                  background: 'rgba(164,203,176,0.06)',
                  color: '#a4cbb0',
                }}
              >
                <ShieldCheck size={16} /> 1-Click Sign In with Wallet ({address?.slice(0, 6)}…{address?.slice(-4)})
              </button>
            </div>
          )}

          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #23222a',
              textAlign: 'center',
              fontSize: '13.5px',
              color: '#919099',
            }}
          >
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setError('');
                setMode('create');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ff824c',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* ================= CREATE ACCOUNT MODE ================= */}
      {mode === 'create' && (
        <form onSubmit={handleCreateAccount} className="account-create-flow">
          {/* Flame Logo Header */}
          <div
            style={{
              textAlign: 'center',
              padding: '12px 0 16px',
              borderBottom: '1px solid #23222a',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                margin: '0 auto 10px',
                background: 'linear-gradient(135deg, #ff5722 0%, #ff9800 50%, #8338ec 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(255,87,34,0.3)',
              }}
            >
              <Flame size={30} fill="#ffffff" color="#ffffff" />
            </div>
            <h3 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: 700 }}>
              Join DRACARYS 🔥
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#919099' }}>
              Commit micro-stakes. Build unbreakable habits on Monad.
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(255,82,82,0.1)',
                border: '1px solid rgba(255,82,82,0.3)',
                borderRadius: '10px',
                padding: '10px 12px',
                color: '#ff6b6b',
                fontSize: '13px',
                marginBottom: '14px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <label className="field-label" htmlFor="reg-name">
            Your Full Name
          </label>
          <input
            id="reg-name"
            autoFocus
            required
            maxLength={40}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Chandu Kasireddy"
            style={{ marginBottom: '12px' }}
          />

          <label className="field-label" htmlFor="reg-username">
            Username (@handle)
          </label>
          <input
            id="reg-username"
            required
            maxLength={25}
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="e.g. chandu"
            style={{ marginBottom: '12px' }}
          />

          <label className="field-label" htmlFor="reg-email">
            Email (optional)
          </label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ marginBottom: '12px' }}
          />

          <label className="field-label" htmlFor="reg-pwd">
            Password
          </label>
          <input
            id="reg-pwd"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            style={{ marginBottom: '12px' }}
          />

          <label className="field-label" htmlFor="reg-bio">
            Short Bio / Daily Habit Goal
          </label>
          <input
            id="reg-bio"
            maxLength={80}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="e.g. 10k steps and gym every single day"
            style={{ marginBottom: '14px' }}
          />

          <label className="field-label">Avatar Color</label>
          <div style={{ display: 'flex', gap: '8px', margin: '4px 0 16px' }}>
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
            <div
              style={{
                padding: '10px 12px',
                background: '#1c1b22',
                borderRadius: '10px',
                border: '1px solid #37353f',
                fontSize: '12px',
                color: '#cac9d1',
                marginBottom: '16px',
              }}
            >
              <ShieldCheck size={15} style={{ display: 'inline', marginRight: '6px', color: '#a4cbb0' }} />
              Will bind to connected wallet: <strong>{address?.slice(0, 6)}…{address?.slice(-4)}</strong>
            </div>
          ) : (
            <div
              style={{
                padding: '10px 12px',
                background: '#19191e',
                borderRadius: '10px',
                border: '1px solid #2a292f',
                fontSize: '12px',
                color: '#919099',
                marginBottom: '16px',
              }}
            >
              <Wallet size={15} style={{ display: 'inline', marginRight: '6px' }} />
              You can connect your MetaMask wallet anytime after registration.
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="button secondary"
              style={{ flex: 1 }}
              onClick={() => {
                setError('');
                setMode('login');
              }}
            >
              Back to Sign In
            </button>
            <button type="submit" className="button primary" style={{ flex: 2 }} disabled={busy}>
              <Sparkles size={16} /> {busy ? 'Creating…' : 'Create & Ignite'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
