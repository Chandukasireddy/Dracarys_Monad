'use client';
import { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Share2,
  Dumbbell,
  BookOpen,
  Wind,
  Users,
  LockKeyhole,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from './modal';
import { stakeTotal } from '@/hooks/use-streaker';
import { Challenge, HabitKind } from '@/lib/types';
export function CreateChallenge({
  onClose,
  onCreate,
  notify,
}: {
  onClose: () => void;
  onCreate: (c: Pick<Challenge, 'title' | 'duration' | 'dailyStake' | 'kind'>) => Challenge;
  notify: (s: string) => void;
}) {
  const [step, setStep] = useState(1),
    [title, setTitle] = useState(''),
    [kind, setKind] = useState<HabitKind>('fitness'),
    [duration, setDuration] = useState(21),
    [stake, setStake] = useState('0.1'),
    [error, setError] = useState(''),
    [created, setCreated] = useState<Challenge | null>(null);
  const validStake =
    /^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(stake) && Number(stake) > 0 && Number(stake) <= 100;
  const invite = created ? `${window.location.origin}/?invite=${created.inviteCode}` : '';
  async function copy() {
    try {
      await navigator.clipboard.writeText(invite);
      notify('Invite link copied. Bring your people.');
    } catch {
      notify(`Your invite code: ${created?.inviteCode}`);
    }
  }
  return (
    <Modal
      title={created ? 'Better together.' : 'Make a promise to yourself.'}
      subtitle={
        created
          ? 'Your challenge is ready. Invite someone to keep you honest.'
          : 'Start small. Stay consistent. Make it count.'
      }
      onClose={onClose}
    >
      {!created ? (
        <>
          <div className="flow-steps">
            <span className={step === 1 ? 'active' : ''}>
              01 <b>The habit</b>
            </span>
            <i />
            <span className={step === 2 ? 'active' : ''}>
              02 <b>The commitment</b>
            </span>
          </div>
          {step === 1 ? (
            <>
              <label className="field-label" htmlFor="habit-title">
                What will you show up for?
              </label>
              <input
                autoFocus
                id="habit-title"
                value={title}
                maxLength={60}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Move my body for 30 minutes"
              />
              <label className="field-label">Pick your energy</label>
              <div className="kind-picker">
                {(
                  [
                    { id: 'fitness', icon: Dumbbell, label: 'Movement' },
                    { id: 'reading', icon: BookOpen, label: 'Learning' },
                    { id: 'mindfulness', icon: Wind, label: 'Mindfulness' },
                  ] as const
                ).map((k) => (
                  <button
                    key={k.id}
                    className={kind === k.id ? 'selected' : ''}
                    aria-pressed={kind === k.id}
                    onClick={() => setKind(k.id)}
                  >
                    <k.icon size={23} />
                    {k.label}
                  </button>
                ))}
              </div>
              <label className="field-label" htmlFor="duration">
                How long is your challenge?
              </label>
              <div className="duration-options">
                {[7, 14, 21, 30].map((d) => (
                  <button
                    key={d}
                    className={duration === d ? 'selected' : ''}
                    onClick={() => setDuration(d)}
                  >
                    {d} days
                  </button>
                ))}
              </div>
              <div className="custom-days">
                <span>Or choose your own</span>
                <input
                  id="duration"
                  type="number"
                  min={1}
                  max={365}
                  value={duration || ''}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
                <span>days</span>
              </div>
              <button
                className="button primary full"
                onClick={() => {
                  if (!title.trim()) {
                    setError('Give your habit a name.');
                    return;
                  }
                  if (!Number.isInteger(duration) || duration < 1 || duration > 365) {
                    setError('Choose between 1 and 365 days.');
                    return;
                  }
                  setError('');
                  setStep(2);
                }}
              >
                Set your commitment <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <>
              <div className="commitment-title">
                <div className={`habit-icon ${kind}`}>
                  {kind === 'fitness' ? <Dumbbell /> : kind === 'reading' ? <BookOpen /> : <Wind />}
                </div>
                <div>
                  <strong>{title}</strong>
                  <span>{duration} days of showing up</span>
                </div>
              </div>
              <label className="field-label" htmlFor="daily-stake">
                Daily micro-stake
              </label>
              <div className="stake-input">
                <input
                  id="daily-stake"
                  type="text"
                  inputMode="decimal"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                />
                <span>MON</span>
              </div>
              <p className="helper">
                An amount that motivates you. Earn one daily stake back with each check-in.
              </p>
              <div className="commitment-summary">
                <div>
                  <span>Daily stake</span>
                  <strong>{validStake ? stake : '—'} MON</strong>
                </div>
                <div>
                  <span>Duration</span>
                  <strong>{duration} days</strong>
                </div>
                <div className="summary-total">
                  <span>
                    <LockKeyhole size={15} /> Total commitment
                  </span>
                  <strong>{validStake ? stakeTotal(stake, duration) : '—'} MON</strong>
                </div>
              </div>
              <div className="info-box">
                <Users size={19} />
                <span>
                  Invite friends after creating your challenge. All stakes and rewards are simulated
                  in this demo.
                </span>
              </div>
              <div className="form-actions">
                <button
                  className="button secondary"
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                >
                  <ArrowLeft size={17} /> Back
                </button>
                <button
                  className="button primary"
                  onClick={() => {
                    if (!validStake) {
                      setError(
                        'Enter a stake greater than 0 and up to 100 MON, with at most 6 decimals.',
                      );
                      return;
                    }
                    setCreated(
                      onCreate({ title: title.trim(), duration, dailyStake: stake, kind }),
                    );
                    setError('');
                  }}
                >
                  <Check size={18} /> Create challenge
                </button>
              </div>
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </>
      ) : (
        <>
          <div className="invite-card">
            <div className="qr-wrap">
              <QRCodeSVG value={invite} size={164} level="M" />
            </div>
            <h3>{created.title}</h3>
            <p>
              {created.duration} days · {created.dailyStake} MON / day
            </p>
            <button className="invite-code" onClick={copy}>
              {created.inviteCode}
              <Copy size={16} />
            </button>
          </div>
          <button
            className="button primary full"
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: 'Join my Dracarys challenge',
                    text: created.title,
                    url: invite,
                  });
                } catch (e) {
                  if ((e as Error).name !== 'AbortError') await copy();
                }
              } else await copy();
            }}
          >
            <Share2 size={17} /> Share invite
          </button>
          <p className="helper center">
            Demo invites are stored on this device. Cross-device joining needs a backend.
          </p>
          <button className="button secondary full" onClick={onClose}>
            Let’s start this streak <ArrowRight size={17} />
          </button>
        </>
      )}
    </Modal>
  );
}
export function JoinChallenge({
  onClose,
  onJoin,
  initialCode = '',
}: {
  onClose: () => void;
  onJoin: (code: string) => void;
  initialCode?: string;
}) {
  const [code, setCode] = useState(initialCode),
    [error, setError] = useState('');
  return (
    <Modal
      title="Find your accountability crew."
      subtitle="A friend’s challenge is a good place to start."
      onClose={onClose}
    >
      <div className="wallet-illustration">
        <Users size={38} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            onJoin(code);
            onClose();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <label className="field-label" htmlFor="invite-code">
          Invite code
        </label>
        <input
          id="invite-code"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="DRA-WALK7"
          required
        />
        <p className="helper">
          Try{' '}
          <button type="button" className="text-link" onClick={() => setCode('DRA-WALK7')}>
            DRA-WALK7
          </button>{' '}
          to join the demo walking challenge.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary full" type="submit">
          Join challenge <ArrowRight size={18} />
        </button>
      </form>
    </Modal>
  );
}
