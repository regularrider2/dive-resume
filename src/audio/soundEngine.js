import audioConfig from '../config/audio.json';

export function initAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  return { ctx, ambientOsc: null, ambientGain: null };
}

export function playEffect(engine, effectName) {
  if (!audioConfig.enabled || !engine) return;
  const effect = audioConfig.effects[effectName];
  if (!effect) return;

  const { ctx } = engine;
  const { frequencies, duration, type, volume } = effect;
  const gain = (volume || 1) * (audioConfig.masterVolume ?? 1);

  const stagger = frequencies.length > 1 ? 80 : 0;

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
    gainNode.gain.setValueAtTime(gain, ctx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + i * stagger / 1000 + duration / 1000);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(ctx.currentTime + i * stagger / 1000);
    osc.stop(ctx.currentTime + i * stagger / 1000 + duration / 1000);
    osc.onended = () => {
      osc.disconnect();
      gainNode.disconnect();
    };
  });
}

export function startAmbient(engine, depth) {
  if (!audioConfig.enabled || !engine || !audioConfig.ambient?.enabled) return;
  stopAmbient(engine);

  const { ctx } = engine;
  const { baseFrequency, volume, type } = audioConfig.ambient;
  const freq = baseFrequency * (1 - (depth || 0) * 0.5);
  const gain = (volume || 0.06) * (audioConfig.masterVolume ?? 1);

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(ctx.currentTime);

  engine.ambientOsc = osc;
  engine.ambientGain = gainNode;
}

export function updateAmbientDepth(engine, depth) {
  if (!engine?.ambientOsc) return;
  const { baseFrequency } = audioConfig.ambient || {};
  const freq = (baseFrequency || 80) * (1 - (depth || 0) * 0.5);
  engine.ambientOsc.frequency.setValueAtTime(freq, engine.ctx.currentTime);
}

export function stopAmbient(engine) {
  if (!engine?.ambientOsc) return;
  engine.ambientOsc.stop(engine.ctx.currentTime);
  engine.ambientOsc.disconnect();
  engine.ambientGain?.disconnect();
  engine.ambientOsc = null;
  engine.ambientGain = null;
}
