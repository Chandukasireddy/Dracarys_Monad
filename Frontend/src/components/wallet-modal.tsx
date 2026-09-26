'use client';
import { useConnect, useConnection, useDisconnect, useSwitchChain } from 'wagmi';
import { Wallet, ExternalLink, Check, AlertCircle, LoaderCircle } from 'lucide-react';
import { Modal } from './modal';
import { monadTestnet } from '@/lib/chain';
export function WalletModal({ onClose }: { onClose: () => void }) {
  const { connect, connectors, isPending, error } = useConnect();
  const { address, chainId, isConnected } = useConnection();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching, error: switchError } = useSwitchChain();
  return (
    <Modal
      title={isConnected ? 'Your wallet' : 'A little skin in the game.'}
      subtitle="Connect to Monad Testnet. Your demo streaks work with or without a wallet."
      onClose={onClose}
    >
      <div className="wallet-illustration">
        <Wallet size={40} />
        <span className="network-dot" />
      </div>
      {isConnected ? (
        <>
          <div className="wallet-address">
            <Check size={18} />
            {address?.slice(0, 8)}…{address?.slice(-6)}
          </div>
          <p className="center muted">
            {chainId === monadTestnet.id
              ? 'Connected to Monad Testnet'
              : 'Your wallet is on another network.'}
          </p>
          {chainId !== monadTestnet.id && (
            <button
              className="button primary full"
              disabled={switching}
              onClick={() => switchChain({ chainId: monadTestnet.id })}
            >
              {switching ? 'Switching…' : 'Switch to Monad Testnet'}
            </button>
          )}
          <button className="button secondary full" onClick={() => disconnect()}>
            Disconnect wallet
          </button>
          <a
            className="text-link center block"
            target="_blank"
            rel="noreferrer"
            href={`${monadTestnet.blockExplorers.default.url}/address/${address}`}
          >
            View on explorer <ExternalLink size={14} />
          </a>
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
            {isPending ? 'Check your wallet…' : 'Connect browser wallet'}
          </button>
          <p className="helper center">
            MetaMask or another injected wallet. On mobile, open Dracarys in your wallet’s browser.
          </p>
        </>
      )}
      {(error || switchError) && (
        <p className="form-error" role="alert">
          <AlertCircle size={16} />
          {(error || switchError)?.message.split('\n')[0]}
        </p>
      )}
      <div className="info-box">
        This is a frontend demo. Claims and stakes are simulated; connecting your wallet does not
        move any funds.
      </div>
    </Modal>
  );
}
