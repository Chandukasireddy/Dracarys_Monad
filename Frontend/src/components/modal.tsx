'use client';
import { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';
export function Modal({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const touch = useRef(0);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const root = ref.current;
    root?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && root) {
        const items = Array.from(
          root.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), select, textarea, [tabindex="0"]',
          ),
        ).filter((el) => el.getClientRects().length > 0);
        const first = items[0],
          last = items.at(-1);
        if (e.shiftKey && (document.activeElement === first || document.activeElement === root)) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener('keydown', key);
      before?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={ref}
      >
        <div
          className="sheet-handle"
          onTouchStart={(e) => (touch.current = e.touches[0].clientY)}
          onTouchEnd={(e) => {
            if (e.changedTouches[0].clientY - touch.current > 70) onClose();
          }}
        >
          <span />
        </div>
        <button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="modal-heading">
          <span className="eyebrow">SMALL STEPS. REAL COMMITMENT.</span>
          <h2 id={titleId}>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
