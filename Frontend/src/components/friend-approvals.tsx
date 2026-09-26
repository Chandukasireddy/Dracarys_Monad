'use client';
import { Check, Flame, ArrowUpRight, ShieldCheck, PartyPopper, LoaderCircle, Zap, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Approval } from '@/lib/types';
import { Modal } from './modal';
import { useChallengeContract } from '@/hooks/use-challenge-contract';
import { useConnection } from 'wagmi';
import { isAddress, type Address } from 'viem';

export function FriendApprovals({
  approvals,
  onApprove,
  compact = false,
  onViewAll,
}: {
  approvals: Approval[];
  onApprove: (id: string) => void;
  compact?: boolean;
  onViewAll?: () => void;
}) {
  const [proof, setProof] = useState<Approval | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState('');
  const contract = useChallengeContract();
  const { isConnected } = useConnection();
  const pending = approvals.filter((a) => !a.approved);

  const handleApprove = async (approval: Approval) => {
    setApprovingId(approval.id);
    setError('');
    try {
      // Approving on-chain releases the friend's daily stake back to them.
      if (isConnected && contract.configured && approval.onchainId) {
        if (!approval.address || !isAddress(approval.address) || !approval.day)
          throw new Error('This proof is missing the wallet or day needed to approve it on-chain.');
        const receipt = await contract.approveCheckIn(
          BigInt(approval.onchainId),
          approval.address as Address,
          BigInt(approval.day),
        );
        setTxHash(receipt.transactionHash);
      }
      onApprove(approval.id);
    } catch (e) {
      setError(e instanceof Error ? e.message.split('\n')[0] : 'Approval failed.');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <>
      <section className={compact ? 'panel friend-panel' : 'friends-page'}>
        <div className="section-heading">
          <h2>{compact ? 'Show up for your friends' : 'A little support goes a long way.'}</h2>
          {compact && <span className="count-badge">{pending.length}</span>}
        </div>
        <p className="section-description">
          {compact
            ? 'Their streak is in your hands.'
            : 'Take a look at their proof. Give their commitment a little credit.'}
        </p>

        {error && (
          <p className="helper" role="alert" style={{ color: '#ff824c', marginBottom: '14px' }}>
            {error}
          </p>
        )}

        {txHash && (
          <div style={{
            background: 'rgba(164, 203, 176, 0.1)',
            border: '1px solid rgba(164, 203, 176, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '14px',
            fontSize: '12.5px',
            color: '#a4cbb0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={15} /> Approved on Monad Testnet!
            </span>
            <a
              href={`https://testnet.monadvision.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#ff824c', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
            >
              View Tx <ExternalLink size={12} />
            </a>
          </div>
        )}

        {pending.length === 0 ? (
          <div className="empty-state">
            <PartyPopper size={34} />
            <h3>No pending friend approvals.</h3>
            <p>When friends in your streak circles upload daily habit proofs, they will appear here for verification!</p>
          </div>
        ) : (
          <div className={compact ? 'friend-list' : 'approval-grid'}>
            {pending.map((a) => (
              <article className={compact ? 'friend-row' : 'approval-card'} key={a.id}>
                <button
                  className={`avatar ${a.color}`}
                  onClick={() => setProof(a)}
                  aria-label={`View ${a.name}'s proof`}
                >
                  {a.initials}
                </button>
                <div className="friend-info">
                  <strong>
                    {a.name}
                    <span>
                      <Flame size={12} />
                      {a.streak}
                    </span>
                  </strong>
                  <p>{a.challenge}</p>
                  {!compact && <small>Submitted today · awaiting your approval</small>}
                </div>
                {compact ? (
                  <button
                    className="approve-icon"
                    aria-label={`Approve ${a.name}`}
                    disabled={approvingId === a.id}
                    onClick={() => handleApprove(a)}
                  >
                    {approvingId === a.id ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}
                  </button>
                ) : (
                  <>
                    <button className="proof-image-button" onClick={() => setProof(a)}>
                      <img src={`/proof-${a.kind}.svg`} alt={`${a.name}'s demo ${a.kind} proof`} />
                      <span>
                        View proof <ArrowUpRight size={14} />
                      </span>
                    </button>
                    <p className="proof-note">“{a.note}”</p>
                    <button
                      className="button primary full"
                      disabled={approvingId === a.id}
                      onClick={() => handleApprove(a)}
                    >
                      {approvingId === a.id ? (
                        <>
                          <LoaderCircle className="spin" size={17} /> Signing on Monad…
                        </>
                      ) : (
                        <>
                          <Check size={17} /> Approve {a.name.split(' ')[0]}
                        </>
                      )}
                    </button>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
        {compact && (
          <button className="panel-link" onClick={onViewAll}>
            View all approvals <ArrowUpRight size={16} />
          </button>
        )}
        {!compact && approvals.some((a) => a.approved) && (
          <div className="approved-history">
            <h3>
              <ShieldCheck size={18} /> You backed them today
            </h3>
            {approvals
              .filter((a) => a.approved)
              .map((a) => (
                <div key={a.id}>
                  <span className={`avatar tiny ${a.color}`}>{a.initials}</span>
                  <strong>{a.name}</strong>
                  <span className="approved-label">
                    <Check size={14} /> Approved
                  </span>
                </div>
              ))}
          </div>
        )}
      </section>
      {proof && (
        <Modal
          title={`${proof.name.split(' ')[0]} showed up.`}
          subtitle={`${proof.challenge} · ${proof.streak}-day streak`}
          onClose={() => setProof(null)}
        >
          <img
            className="proof-full"
            src={`/proof-${proof.kind}.svg`}
            alt={`${proof.name}'s demo proof`}
          />
          <p className="proof-note">“{proof.note}”</p>
          <p className="helper">Sample proof for this interactive demo.</p>
          <button
            className="button primary full"
            onClick={() => {
              onApprove(proof.id);
              setProof(null);
            }}
          >
            <Check size={18} /> Approve check-in
          </button>
        </Modal>
      )}
    </>
  );
}
