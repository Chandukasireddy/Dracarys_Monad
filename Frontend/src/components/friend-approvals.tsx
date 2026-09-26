'use client';
import { Check, Flame, ArrowUpRight, ShieldCheck, PartyPopper } from 'lucide-react';
import { useState } from 'react';
import { Approval } from '@/lib/types';
import { Modal } from './modal';
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
  const pending = approvals.filter((a) => !a.approved);
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
        {pending.length === 0 ? (
          <div className="empty-state">
            <PartyPopper size={34} />
            <h3>You’re a good accountability friend.</h3>
            <p>All caught up. Your crew is cheering you on.</p>
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
                    onClick={() => onApprove(a.id)}
                  >
                    <Check size={17} />
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
                    <button className="button primary full" onClick={() => onApprove(a.id)}>
                      <Check size={17} /> Approve {a.name.split(' ')[0]}
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
