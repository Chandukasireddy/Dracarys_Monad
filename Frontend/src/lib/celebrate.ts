import confetti from 'canvas-confetti';
export function celebrate(sound: boolean) {
  navigator.vibrate?.([35, 40, 60]);
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    void confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.68 },
      colors: ['#836EF9', '#FF5722', '#FF9800', '#ffffff'],
      disableForReducedMotion: true,
    });
  if (sound) {
    try {
      const ctx = new AudioContext();
      [523.25, 659.25, 783.99].forEach((frequency, i) => {
        const oscillator = ctx.createOscillator(),
          gain = ctx.createGain();
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.045, ctx.currentTime + i * 0.075);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32 + i * 0.075);
        oscillator.start(ctx.currentTime + i * 0.075);
        oscillator.stop(ctx.currentTime + 0.35 + i * 0.075);
      });
      setTimeout(() => void ctx.close(), 800);
    } catch {
      /* Sound is optional on unsupported browsers. */
    }
  }
}
