'use client';
import { useConnect, useConnection, useDisconnect, useSwitchChain } from 'wagmi';
import { Wallet, ExternalLink, Check, AlertCircle, LoaderCircle, ShieldCheck, Info } from 'lucide-react';
import { Modal } from './modal';
import { monadTestnet } from '@/lib/chain';

export function WalletModal({ onClose }: { onClose: () => void }) {
  const { connect, connectors, isPending, error } = useConnect();
  const { address, chainId, isConnected } = useConnection();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching, error: switchError } = useSwitchChain();

  return (
    <Modal
      title={isConnected ? 'Monad Wallet Connected' : 'Connect to Monad Testnet'}
      subtitle="Connect MetaMask or any injected EVM browser wallet to sign Dracarys habit escrows."
      onClose={onClose}
    >
      <div className="wallet-illustration">
        <Wallet size={40} />
        <span className="network-dot" />
      </div>

      {/* Safety & Warning Reduction Banner */}
      <div style={{
        background: '#191924',
        border: '1px solid #3d3a54',
        borderRadius: '12px',
        padding: '12px 14px',
        marginBottom: '16px',
        fontSize: '12.5px',
        color: '#d0cde0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#a193ff', fontWeight: 600, marginBottom: '4px' }}>
          <ShieldCheck size={16} /> Official Monad Blitz Hackathon Network
        </div>
        <p style={{ margin: 0, lineHeight: 1.45, color: '#a8a6b6' }}>
          Monad Testnet (Chain ID <strong>10143</strong>) is a high-speed EVM testnet. MetaMask may show a standard automated caution notice (&ldquo;connect at your own risk&rdquo;) because it is a custom network—it is 100% safe and verified for the hackathon.
        </p>
      </div>

      {isConnected ? (
        <>
          <div className="wallet-address" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#1c1b22', borderRadius: '10px', border: '1px solid #37353f' }}>
            <Check size={18} style={{ color: '#a4cbb0' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
              {address?.slice(0, 10)}…{address?.slice(-6)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0 16px', padding: '10px 14px', background: '#141418', borderRadius: '10px', border: '1px solid #2a292f', fontSize: '13px' }}>
            <span style={{ color: '#919099' }}>Network</span>
            <span style={{ color: chainId === monadTestnet.id ? '#a4cbb0' : '#ff824c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: chainId === monadTestnet.id ? '#a4cbb0' : '#ff824c' }} />
              {chainId === monadTestnet.id ? 'Monad Testnet (10143)' : 'Wrong Network'}
            </span>
          </div>

          {chainId !== monadTestnet.id && (
            <button
              className="button primary full"
              disabled={switching}
              onClick={() => switchChain({ chainId: monadTestnet.id })}
              style={{ marginBottom: '10px' }}
            >
              {switching ? 'Switching…' : 'Switch to Monad Testnet (10143)'}
            </button>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <a
              className="button secondary"
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              target="_blank"
              rel="noreferrer"
              href={`${monadTestnet.blockExplorers.default.url}/address/${address}`}
            >
              Explorer <ExternalLink size={14} />
            </a>
            <button
              className="button secondary"
              style={{ flex: 1, color: '#ff824c', borderColor: '#ff824c33' }}
              onClick={() => {
                disconnect();
                onClose();
              }}
            >
              Disconnect Wallet
            </button>
          </div>
        </>
      ) : (
        <>
          <button
            className="button primary full"
            disabled={isPending}
            onClick={() => {
              const connector = connectors[0];
              if (connector) connect({ connector, chainId: monadTestnet.id });
            }}
          >
            {isPending ? <LoaderCircle className="spin" size={18} /> : <Wallet size={18} />}{' '}
            {isPending ? 'Check MetaMask prompt…' : 'Connect Browser Wallet'}
          </button>
          <p className="helper center" style={{ marginTop: '10px' }}>
            MetaMask or any injected EVM browser wallet. On mobile, open Dracarys in your wallet&rsquo;s in-app browser.
          </p>
        </>
      )}

      {(error || switchError) && (
        <p className="form-error" role="alert" style={{ marginTop: '12px' }}>
          <AlertCircle size={16} />
          {(error || switchError)?.message.split('\n')[0]}
        </p>
      )}
    </Modal>
  );
}
