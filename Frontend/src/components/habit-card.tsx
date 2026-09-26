'use client';
import {
  Dumbbell,
  BookOpen,
  Wind,
  Flame,
  ArrowUpRight,
  Check,
  Users,
  LockKeyhole,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Challenge, dayKey } from '@/lib/types';
import { stakeTotal } from '@/hooks/use-streaker';
const icons = { fitness: Dumbbell, reading: BookOpen, mindfulness: Wind };
export function HabitCard({
  challenge,
  onCheckIn,
  onDetails,
  onEdit,
  onDelete,
}: {
  challenge: Challenge;
  onCheckIn: () => void;
  onDetails: () => void;
  onEdit?: () => void;
  onDelete: () => void;
}) {
  const Icon = icons[challenge.kind];
  const done = challenge.lastCheckIn === dayKey();
  const finished = challenge.completed >= challenge.duration;
  const progress = Math.min(100, (challenge.completed / challenge.duration) * 100);
  return (
    <article className={`habit-card ${challenge.kind}`}>
      <div className="habit-card-top">
        <div className={`habit-icon ${challenge.kind}`}>
          <Icon size={23} />
        </div>
        <span className={`status-tag ${done || finished ? 'done' : ''}`}>
          <span />
          {finished ? 'Completed' : done ? 'Checked in' : 'In progress'}
        </span>
        <div className="habit-actions">
          {onEdit && (
            <button
              className="icon-button habit-action"
              onClick={onEdit}
              aria-label={`Edit ${challenge.title}`}
              title="Edit"
            >
              <Pencil size={16} />
            </button>
          )}
          <button
            className="icon-button habit-action danger"
            onClick={onDelete}
            aria-label={`Delete ${challenge.title}`}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <button
            className="icon-button habit-details"
            onClick={onDetails}
            aria-label={`View ${challenge.title}`}
          >
            <ArrowUpRight size={19} />
          </button>
        </div>
      </div>
      <h3>{challenge.title}</h3>
      <p className="habit-description">{challenge.description}</p>
      <div className="habit-progress-label">
        <strong>
          <Flame size={16} /> {challenge.completed} day{challenge.completed === 1 ? '' : 's'}
        </strong>
        <span>of {challenge.duration} days</span>
      </div>
      <div className="progress-track">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="habit-finances">
        <span>
          Earned back
          <strong>
            {stakeTotal(challenge.dailyStake, challenge.completed)} <small>MON</small>
          </strong>
        </span>
        <span className="right">
          Total stake
          <strong>
            <LockKeyhole size={12} />
            {stakeTotal(challenge.dailyStake, challenge.duration)} <small>MON</small>
          </strong>
        </span>
      </div>
      <div className="habit-card-bottom">
        <div className="mini-crew">
          <div className="avatar tiny peach">M</div>
          <div className="avatar tiny lilac">A</div>
          <span>
            <Users size={12} />
            {challenge.members}
          </span>
        </div>
        <button
          className={`button checkin-button ${done || finished ? 'checked' : ''}`}
          disabled={done || finished}
          onClick={onCheckIn}
        >
          {finished ? 'Challenge complete' : done ? 'Done for today' : 'Check in'}
          {done || finished ? <Check size={15} /> : <ArrowUpRight size={15} />}
        </button>
      </div>
    </article>
  );
}
