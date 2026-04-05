let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let bgmGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let isMuted = false;
let bgmOscillator: OscillatorNode | null = null;
let bgmRunning = false;

export function initAudio() {
  if (audioContext) return;
  audioContext = new AudioContext();
  masterGain = audioContext.createGain();
  masterGain.connect(audioContext.destination);
  masterGain.gain.value = 0.5;

  bgmGain = audioContext.createGain();
  bgmGain.connect(masterGain);
  bgmGain.gain.value = 0.3;

  sfxGain = audioContext.createGain();
  sfxGain.connect(masterGain);
  sfxGain.gain.value = 0.8;
}

function resumeAudio() {
  if (audioContext?.state === 'suspended') {
    audioContext.resume();
  }
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', gainNode: GainNode = sfxGain!) {
  if (!audioContext || !gainNode) return;
  resumeAudio();

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  osc.connect(gain);
  gain.connect(gainNode);

  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

export function playEssenceCollect() {
  if (!audioContext || isMuted) return;
  playTone(880, 0.1, 'sine');
  setTimeout(() => playTone(1100, 0.1, 'sine'), 50);
  setTimeout(() => playTone(1320, 0.15, 'sine'), 100);
}

export function playEvolution() {
  if (!audioContext || isMuted) return;
  const frequencies = [440, 554, 659, 880, 1047, 1320];
  frequencies.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'triangle'), i * 80);
  });
  setTimeout(() => playTone(1760, 0.4, 'sine'), 400);
}

export function playUIClick() {
  if (!audioContext || isMuted) return;
  playTone(600, 0.05, 'square');
}

export function playMenuOpen() {
  if (!audioContext || isMuted) return;
  playTone(330, 0.1, 'triangle');
  setTimeout(() => playTone(440, 0.1, 'triangle'), 80);
}

function createBGM() {
  if (!audioContext || !bgmGain) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.value = 220;

  lfo.type = 'sine';
  lfo.frequency.value = 0.5;
  lfoGain.gain.value = 30;

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  gain.gain.value = 0.5;
  osc.connect(gain);
  gain.connect(bgmGain);

  osc.start();
  lfo.start();

  return { osc, gain, lfo };
}

export function startBGM() {
  if (bgmRunning || !audioContext) return;
  resumeAudio();
  bgmRunning = true;

  const bgm = createBGM();
  if (bgm) {
    bgmOscillator = bgm.osc;
  }

  setTimeout(() => {
    if (bgmRunning && bgmOscillator) {
      const osc = audioContext!.createOscillator();
      const gain = audioContext!.createGain();
      osc.type = 'sine';
      osc.frequency.value = 330;
      gain.gain.value = 0.3;
      osc.connect(gain);
      gain.connect(bgmGain!);
      osc.start();
      bgmOscillator = osc;
    }
  }, 2000);
}

export function stopBGM() {
  if (bgmOscillator) {
    try {
      bgmOscillator.stop();
    } catch (e) {}
    bgmOscillator = null;
  }
  bgmRunning = false;
}

export function toggleMute(): boolean {
  isMuted = !isMuted;
  if (masterGain) {
    masterGain.gain.value = isMuted ? 0 : 0.5;
  }
  return isMuted;
}

export function getMuted(): boolean {
  return isMuted;
}

export function playMenuClose() {
  if (!audioContext || isMuted) return;
  playTone(440, 0.1, 'triangle');
  setTimeout(() => playTone(330, 0.1, 'triangle'), 80);
}
