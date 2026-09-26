'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Camera,
  ImagePlus,
  Check,
  ArrowRight,
  ShieldCheck,
  LoaderCircle,
  Flame,
} from 'lucide-react';
import { Modal } from './modal';
import { FlameArt } from './flame';
import { celebrate } from '@/lib/celebrate';
import type { Challenge } from '@/lib/types';
export function CheckInModal({
  challenge,
  onClose,
  onClaim,
  sound,
}: {
  challenge: Challenge;
  onClose: () => void;
  onClaim: (proofUri: string) => boolean | Promise<boolean>;
  sound: boolean;
}) {
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [note, setNote] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(
    () => () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  async function claim() {
    if (!preview || busy || claimed) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 650));
    if (!alive.current) return;
    const ok = await onClaim(preview);
    if (ok) {
      setClaimed(true);
      celebrate(sound);
    } else setError('You have already claimed this day. Come back tomorrow!');
    setBusy(false);
  }
  return (
    <Modal
      title={claimed ? 'That’s another day in the bag.' : 'Show up. Check in.'}
      subtitle={claimed ? 'Your commitment is paying off. Keep this energy.' : challenge.title}
      onClose={onClose}
    >
      {claimed ? (
        <div className="claim-success">
          <FlameArt small />
          <div className="success-pill">
            <Check size={16} /> DAILY STAKE CLAIMED
          </div>
          <h3>
            +{challenge.dailyStake} <span>MON</span>
          </h3>
          <p>
            Day {challenge.completed + 1} of {challenge.duration} complete
          </p>
          <div className="info-box">
            Demo reward added to your progress. No funds were transferred.
          </div>
          <button className="button primary full" onClick={onClose}>
            Keep the fire going <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <>
          <div className="checkin-meta">
            <span>
              <Flame size={17} /> Day {challenge.completed + 1} of {challenge.duration}
            </span>
            <span>+{challenge.dailyStake} MON back</span>
          </div>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            capture="environment"
            className="sr-only"
            aria-label="Upload proof photo"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (!file.type.startsWith('image/')) {
                setError('Choose an image file.');
                return;
              }
              if (file.size > 10 * 1024 * 1024) {
                setError('Keep your photo under 10 MB.');
                return;
              }
              setError('');
              setPreview(URL.createObjectURL(file));
            }}
          />
          <button
            className={`upload-zone ${preview ? 'has-preview' : ''}`}
            onClick={() => input.current?.click()}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Your check-in proof"
                  onError={() => {
                    setPreview('');
                    setError('This image format could not be previewed. Please try a JPEG or PNG.');
                  }}
                />
                <span className="change-photo">
                  <Camera size={16} /> Change photo
                </span>
              </>
            ) : (
              <>
                <div className="upload-icon">
                  <Camera size={30} />
                </div>
                <strong>A little proof of your progress</strong>
                <span>Take a photo or choose from your library</span>
                <small>JPG, PNG, WebP · up to 10 MB</small>
              </>
            )}
          </button>
          <button
            className="text-link demo-proof"
            onClick={() => {
              setPreview(`/proof-${challenge.kind}.svg`);
              setError('');
            }}
          >
            <ImagePlus size={15} /> Try with a sample photo
          </button>
          <label className="field-label" htmlFor="checkin-note">
            A note to your future self <span>optional</span>
          </label>
          <textarea
            id="checkin-note"
            rows={2}
            maxLength={240}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How did it feel to show up today?"
          />
          <div className="proof-privacy">
            <ShieldCheck size={15} /> Photo stays on this device in the frontend demo.
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary full" disabled={!preview || busy} onClick={claim}>
            {busy ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />}{' '}
            {busy ? 'Claiming your day…' : 'Claim Daily Stake'}{' '}
            {!busy && <span className="button-value">{challenge.dailyStake} MON</span>}
          </button>
          <p className="helper center">Demo claim · instant feedback · no transaction</p>
        </>
      )}
    </Modal>
  );
}
