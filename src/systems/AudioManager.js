// ============================================================
// AudioManager - 音频管理器（Web Audio API 合成音效）
// ============================================================
class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.masterVolume = 0.4;
        this.ambientNodes = {};
    }

    // ---- 初始化（需用户交互后调用）----
    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.ctx.destination);
            console.log('[Audio] 初始化成功');
        } catch (e) {
            console.warn('[Audio] 初始化失败:', e);
            this.enabled = false;
        }
    }

    // ---- 播放单音 ----
    playTone(freq, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // ---- 对话弹出音 ----
    dialogueOpen() {
        this.playTone(520, 0.12, 'sine', 0.2);
        setTimeout(() => this.playTone(780, 0.1, 'sine', 0.15), 60);
    }

    // ---- 对话打字音 ----
    dialogueType() {
        this.playTone(800 + Math.random() * 400, 0.03, 'square', 0.06);
    }

    // ---- 传送门音 ----
    portalActivate() {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
    }

    // ---- 传送门环境音 ----
    portalAmbient() {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 2);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 2);
    }

    // ---- 亲密度提升音 ----
    intimacyUp() {
        this.playTone(523, 0.15, 'sine', 0.2);
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.2), 100);
        setTimeout(() => this.playTone(784, 0.2, 'sine', 0.25), 200);
    }

    // ---- 剧情事件音 ----
    storyEvent() {
        this.playTone(330, 0.3, 'triangle', 0.3);
        setTimeout(() => this.playTone(440, 0.3, 'triangle', 0.25), 200);
        setTimeout(() => this.playTone(330, 0.4, 'triangle', 0.2), 400);
    }

    // ---- 场景切换音 ----
    sceneTransition() {
        if (!this.enabled || !this.ctx) return;
        // 白噪声 + 低频扫
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        // 低频震荡
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);
        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        noise.connect(gain);
        gain.connect(this.masterGain);
        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        noise.start();
        osc.start();
        noise.stop(this.ctx.currentTime + 0.3);
        osc.stop(this.ctx.currentTime + 0.3);
    }

    // ---- UI按钮点击音 ----
    uiClick() {
        this.playTone(600, 0.05, 'square', 0.1);
    }

    // ---- 开始场景环境音 ----
    startAmbient(sceneKey) {
        this.stopAmbient();
        if (!this.enabled || !this.ctx) return;

        const ambConfig = {
            HubScene: { freq: 80, type: 'sawtooth', vol: 0.03 },
            GovernorScene: { freq: 60, type: 'sine', vol: 0.02 },
            MiningScene: { freq: 100, type: 'sawtooth', vol: 0.04 },
            PortScene: { freq: 70, type: 'triangle', vol: 0.03 },
            BlackMarketScene: { freq: 55, type: 'sine', vol: 0.03 }
        };

        const cfg = ambConfig[sceneKey];
        if (!cfg) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        // LFO调制频率，产生微妙的起伏感
        lfo.type = 'sine';
        lfo.frequency.value = 0.3;
        lfoGain.gain.value = cfg.freq * 0.05;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.type = cfg.type;
        osc.frequency.value = cfg.freq;
        gain.gain.value = cfg.vol * this.masterVolume;
        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        lfo.start();

        this.ambientNodes[sceneKey] = { osc, gain, lfo, lfoGain };
    }

    // ---- 停止环境音 ----
    stopAmbient() {
        for (const key of Object.keys(this.ambientNodes)) {
            const n = this.ambientNodes[key];
            try {
                n.osc.stop();
                n.lfo.stop();
            } catch (e) {}
        }
        this.ambientNodes = {};
    }

    // ---- 设置音量 ----
    setVolume(v) {
        this.masterVolume = Math.max(0, Math.min(1, v));
        if (this.masterGain) this.masterGain.gain.value = this.masterVolume;
    }

    // ---- 切换静音 ----
    toggleMute() {
        this.enabled = !this.enabled;
        if (!this.enabled) this.stopAmbient();
        return this.enabled;
    }
}

window.audioManager = new AudioManager();
