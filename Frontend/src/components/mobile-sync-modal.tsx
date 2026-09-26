'use client';
import { useState } from 'react';
import {
  Smartphone,
  Laptop,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { Modal } from './modal';
import { monadTestnet } from '@/lib/chain';

export function MobileSyncModal({
  onClose,
  walletAddress,
  notify,
}: {
  onClose: () => void;
  walletAddress?: string;
  notify?: (msg: string) => void;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(label);
      notify?.(`${label} copied to clipboard!`);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      notify?.(`Could not copy automatically`);
    }
  };

  const netSettings = [
    { label: 'Network Name', value: 'Monad Testnet' },
    { label: 'RPC URL', value: 'https://testnet-rpc.monad.xyz' },
    { label: 'Chain ID', value: '10143' },
    { label: 'Currency Symbol', value: 'MON' },
    { label: 'Block Explorer', value: 'https://testnet.monadvision.com' },
  ];

  return (
    <Modal
      title="Mobile & MetaMask Sync Guide"
      subtitle="How to connect your laptop wallet to your mobile phone"
      onClose={onClose}
    >
      {/* Overview Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(161, 147, 255, 0.12) 0%, rgba(255, 130, 76, 0.08) 100%)',
          border: '1px solid rgba(161, 147, 255, 0.3)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#d0cde0',
          lineHeight: 1.5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff824c', fontWeight: 600, marginBottom: '6px' }}>
          <Sparkles size={16} /> Why isn't MetaMask automatically synced on Mobile?
        </div>
        <p style={{ margin: 0, color: '#b9b6cb' }}>
          MetaMask on your laptop is a <strong>desktop browser extension</strong>. Mobile browsers (Safari/Chrome on iOS & Android) cannot access laptop extensions or local keys.
          Your <strong>Streaker account (username, streaks & friends)</strong> is already 100% synced via Neon PostgreSQL!
        </p>
      </div>

      {/* Step 1: Open in MetaMask App */}
      <div style={{ marginBottom: '18px' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px', fontSize: '14px', color: '#ff824c' }}>
          <Smartphone size={16} /> Method 1 (Easiest): Open in MetaMask Mobile Browser
        </h4>
        <p style={{ fontSize: '12.5px', color: '#9d99ab', margin: '0 0 10px' }}>
          Open Streaker directly inside the MetaMask Mobile App browser. It automatically detects your wallet!
        </p>
        <a
          href="https://metamask.app.link/dapp/streaker-monad.vercel.app"
          target="_blank"
          rel="noreferrer"
          className="button primary full"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={16} /> Open Streaker in MetaMask App
        </a>
      </div>

      {/* Step 2: Import Account to Mobile */}
      <div style={{ marginBottom: '18px', background: '#16161f', padding: '12px 14px', borderRadius: '10px', border: '1px solid #292833' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 6px', fontSize: '13.5px', color: '#a193ff' }}>
          <Laptop size={15} /> Method 2: Use Same Wallet Address on Both Devices
        </h4>
        <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#b9b6cb', lineHeight: 1.6 }}>
          <li>On Laptop MetaMask: Click <strong>3 dots ➔ Account Details ➔ Show Private Key</strong>.</li>
          <li>On Mobile MetaMask: Tap the account name at the top ➔ <strong>Add account ➔ Import account</strong>.</li>
          <li>Paste the private key. Your mobile phone will now control the exact same Monad address:
            {walletAddress && (
              <span style={{ display: 'block', fontFamily: 'monospace', color: '#ff824c', fontSize: '11.5px', marginTop: '2px' }}>
                {walletAddress}
              </span>
            )}
          </li>
        </ol>
      </div>

      {/* Step 3: Monad Testnet Settings */}
      <div>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px', fontSize: '13.5px', color: '#ff824c' }}>
          <ShieldCheck size={16} /> Monad Testnet RPC Settings (Copy-Paste)
        </h4>
        <p style={{ fontSize: '12px', color: '#9d99ab', margin: '0 0 10px' }}>
          If Monad Testnet is not listed in your mobile MetaMask, go to <strong>Settings ➔ Networks ➔ Add Network ➔ Custom Networks</strong>:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {netSettings.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#1a1922',
                border: '1px solid #2e2c38',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '12px',
              }}
            >
              <div>
                <span style={{ color: '#888', display: 'block', fontSize: '10.5px' }}>{item.label}</span>
                <strong style={{ color: '#fff', fontFamily: 'monospace', fontSize: '12px' }}>{item.value}</strong>
              </div>
              <button
                className="button secondary"
                style={{ padding: '4px 8px', fontSize: '11px', minHeight: 'unset' }}
                onClick={() => copy(item.value, item.label)}
              >
                {copiedKey === item.label ? <Check size={13} style={{ color: '#a4cbb0' }} /> : <Copy size={13} />}
                {copiedKey === item.label ? 'Copied' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <button className="button secondary full" onClick={onClose}>
          Got it, ready to sync! <ArrowRight size={16} />
        </button>
      </div>
    </Modal>
  );
}
