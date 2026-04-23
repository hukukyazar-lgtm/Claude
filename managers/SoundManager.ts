
/**
 * LUMINA - Uzay Temalı Profesyonel Ses Yönetim Sistemi
 * 
 * Bu sınıf, Web Audio API kullanarak derin, analog hissi veren ve 
 * uzay boşluğu atmosferini yansıtan bir ses altyapısı kurar.
 */
export class SoundManager {
  private static instance: SoundManager;
  private ctx: AudioContext | null = null;
  
  // Ana Kontrol Düğümleri
  private masterGain: GainNode | null = null;
  private globalFilter: BiquadFilterNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;

  private isMuted: boolean = false;
  private musicEnabled: boolean = true;
  private soundEnabled: boolean = true;
  private currentLevel: number = 1;
  private difficulty: number = 1.0;

  // Sürekli Ses Kontrolcüleri
  private droneOsc: OscillatorNode | null = null;
  private droneLFO: OscillatorNode | null = null;
  private tensionTimeout: any = null;
  private isMusicPlaying: boolean = false;
  private musicTimeout: any = null;

  private constructor() {
    this.initAudioContext();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * AudioContext ve Efekt Zincirini Başlatır
   * Zincir: [Source] -> [Global Filter] -> [Dry/Wet Split]
   * Dry: [Dry Gain] -> [Master Gain] -> [Destination]
   * Wet: [Reverb Node] -> [Reverb Gain] -> [Master Gain] -> [Destination]
   */
  private async initAudioContext() {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // 1. Master Gain (Genel Ses Seviyesi)
      this.masterGain = this.ctx!.createGain();
      this.masterGain.connect(this.ctx!.destination);

      // 2. Global Low Pass Filter (Analog Yumuşaklık İçin)
      this.globalFilter = this.ctx!.createBiquadFilter();
      this.globalFilter.type = 'lowpass';
      this.globalFilter.frequency.setValueAtTime(3500, this.ctx!.currentTime); // Üst frekansları hafifçe tıraşla
      this.globalFilter.Q.setValueAtTime(0.7, this.ctx!.currentTime);

      // 3. Reverb Sistemi (Uzay Boşluğu Yankısı)
      this.reverbNode = this.ctx!.createConvolver();
      this.reverbNode.buffer = this.createImpulseResponse(3.5, 2.0); // 3.5 saniyelik derin yankı

      this.reverbGain = this.ctx!.createGain();
      this.reverbGain.gain.setValueAtTime(0.4, this.ctx!.currentTime); // %40 Wet (Yankı miktarı)

      this.dryGain = this.ctx!.createGain();
      this.dryGain.gain.setValueAtTime(0.8, this.ctx!.currentTime); // %80 Dry (Ham ses miktarı)

      // 4. Yönlendirme (Routing)
      // Giriş -> Filtre
      // Filtre -> Dry Gain -> Master
      // Filtre -> Reverb -> Reverb Gain -> Master
      
      this.globalFilter.connect(this.dryGain);
      this.dryGain.connect(this.masterGain);

      this.globalFilter.connect(this.reverbNode);
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.masterGain);

    } catch (e) {
      console.error("Lumina Audio Engine başlatılamadı:", e);
    }
  }

  /**
   * Procedural Impulse Response: 
   * Dışarıdan dosya yüklemeden, matematiksel olarak derin bir uzay yankısı oluşturur.
   */
  private createImpulseResponse(duration: number, decay: number): AudioBuffer {
    const sampleRate = this.ctx!.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx!.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Beyaz gürültü (White Noise) üzerine eksponansiyel azalma (Decay)
        const n = i / length;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
      }
    }
    return impulse;
  }

  /**
   * Tarayıcı kısıtlamaları nedeniyle AudioContext'i canlandırır
   */
  public resume() {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Master ses seviyesini ayarlar
   */
  public setVolume(value: number) {
    if (this.masterGain && this.ctx) {
      const clampedValue = Math.max(0, Math.min(1, value));
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : clampedValue, this.ctx.currentTime, 0.1);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    this.setVolume(muted ? 0 : 1);
  }

  public setLevel(level: number) {
    this.currentLevel = level;
    // İleride seviyeye göre filtre frekansını dinamik değiştirebiliriz
  }

  public setDifficulty(factor: number) {
    this.difficulty = factor;
  }

  /**
   * Ses kaynaklarının (Oscillator vb.) bağlanacağı ana giriş düğümünü döner
   */
  public get inputNode(): AudioNode | null {
    return this.globalFilter;
  }

  public get context(): AudioContext | null {
    return this.ctx;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
      this.stopAmbientDrone();
    } else {
      this.startAmbientDrone();
      this.playMusic();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  /**
   * UI Etkileşim Sesleri (Synthesizer Mantığı)
   */
  public playClick(type: 'onay' | 'iptal' | 'tehlike' = 'onay') {
    if (!this.ctx || !this.globalFilter || !this.soundEnabled || this.isMuted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.globalFilter);

    const now = this.ctx.currentTime;

    switch (type) {
      case 'onay':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        
        // ADSR Envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15); // Decay
        
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'iptal':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'tehlike':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
        break;
    }
  }

  /**
   * Tok ve tatlı 'plop' sesi (Yıldız/Coin artışları için)
   */
  public playPop() {
    if (!this.ctx || !this.globalFilter || !this.soundEnabled || this.isMuted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(this.globalFilter);

    const now = this.ctx.currentTime;

    // Frekans Kayması (Pitch Slide) - Bass etkisi için düşük frekanstan başlar
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    // ADSR Envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.01); // Hızlı attack
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4); // Derin yankı için uzun decay

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * Başarı ve Ödül Sesleri (Katmanlı Sentezleme)
   */
  public playSuccess() {
    if (!this.ctx || !this.globalFilter || !this.soundEnabled || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.2); // C6'ya yükseliş

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.globalFilter);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playFail() {
    if (!this.ctx || !this.globalFilter || !this.soundEnabled || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Hafif bozulma (distortion) hissi için kare dalga
    osc.type = 'square';
    osc.frequency.setValueAtTime(110, now); // A2
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.3); // A1'e düşüş

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(this.globalFilter);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Görkemli Jackpot Ses Tasarımı (3 Katmanlı)
   */
  public playJackpot() {
    if (!this.ctx || !this.globalFilter || !this.soundEnabled || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;

    // 1. KATMAN: Parıltı (Shimmer) - Tiz ve Kristalize
    const shimmerOsc = this.ctx.createOscillator();
    const shimmerGain = this.ctx.createGain();
    const tremolo = this.ctx.createOscillator();
    const tremoloGain = this.ctx.createGain();

    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.setValueAtTime(2000, now);
    
    // Tremolo Efekti (Hızlı Titreşim)
    tremolo.frequency.setValueAtTime(20, now); // 20Hz titreşim
    tremoloGain.gain.setValueAtTime(0.1, now);
    tremolo.connect(tremoloGain.gain);
    
    shimmerGain.gain.setValueAtTime(0, now);
    shimmerGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    shimmerGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(this.globalFilter);
    tremolo.start(now);
    shimmerOsc.start(now);
    shimmerOsc.stop(now + 1.5);

    // 2. KATMAN: Yükseliş (Riser) - Heyecan Artışı
    const riserOsc = this.ctx.createOscillator();
    const riserGain = this.ctx.createGain();

    riserOsc.type = 'sawtooth';
    riserOsc.frequency.setValueAtTime(100, now);
    riserOsc.frequency.exponentialRampToValueAtTime(800, now + 1.0);

    riserGain.gain.setValueAtTime(0, now);
    riserGain.gain.linearRampToValueAtTime(0.1, now + 0.5);
    riserGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

    riserOsc.connect(riserGain);
    riserGain.connect(this.globalFilter);
    riserOsc.start(now);
    riserOsc.stop(now + 1.2);

    // 3. KATMAN: Vuruş (Impact) - Derin Bas ve Yankı
    const impactOsc = this.ctx.createOscillator();
    const impactGain = this.ctx.createGain();

    impactOsc.type = 'triangle';
    impactOsc.frequency.setValueAtTime(60, now);
    impactOsc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

    impactGain.gain.setValueAtTime(0, now);
    impactGain.gain.linearRampToValueAtTime(0.6, now + 0.01);
    impactGain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);

    impactOsc.connect(impactGain);
    impactGain.connect(this.globalFilter);
    impactOsc.start(now);
    impactOsc.stop(now + 2.0);
  }

  /**
   * Arka Plan Atmosfer ve Müzik Sistemleri
   */

  /**
   * Uzay Gemisi Uğultusu (Ambient Drone)
   * 40Hz-60Hz arası LFO modülasyonlu derin uğultu
   */
  public startAmbientDrone() {
    if (!this.ctx || !this.globalFilter || this.droneOsc) return;
    this.resume();

    const now = this.ctx.currentTime;
    this.droneOsc = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    this.droneLFO = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(50, now);
    
    // LFO: Uğultunun yavaşça dalgalanması için
    this.droneLFO.type = 'sine';
    this.droneLFO.frequency.setValueAtTime(0.2, now); // 0.2Hz (Çok yavaş)
    lfoGain.gain.setValueAtTime(5, now); // 5Hz'lik bir sapma
    
    this.droneLFO.connect(lfoGain);
    lfoGain.connect(this.droneOsc.frequency);

    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.linearRampToValueAtTime(0.05, now + 2.0); // Yavaşça belirir

    this.droneOsc.connect(droneGain);
    droneGain.connect(this.globalFilter);

    this.droneOsc.start(now);
    this.droneLFO.start(now);
  }

  public stopAmbientDrone() {
    if (this.droneOsc && this.ctx) {
      this.droneOsc.stop();
      this.droneLFO?.stop();
      this.droneOsc = null;
      this.droneLFO = null;
    }
  }

  /**
   * Gerilim Ritmi (Tension Beat)
   * Intensity (0-1) arttıkça hızlanan kalp atışı
   */
  public playTensionBeat(intensity: number) {
    if (!this.ctx || !this.globalFilter) return;
    this.resume();

    const triggerBeat = () => {
      if (intensity <= 0) return;

      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      // Kick Drum Sentezi
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60 + (intensity * 20), now);
      osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);

      gain.gain.setValueAtTime(0.15 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      // LPF'i yoğunluğa göre aç (Daha parlak ses)
      this.globalFilter!.frequency.setTargetAtTime(3500 + (intensity * 2000), now, 0.1);

      osc.connect(gain);
      gain.connect(this.globalFilter!);
      osc.start(now);
      osc.stop(now + 0.1);

      // Bir sonraki vuruşun zamanlaması
      const delay = Math.max(200, 1000 - (intensity * 800));
      this.tensionTimeout = setTimeout(triggerBeat, delay);
    };

    if (this.tensionTimeout) clearTimeout(this.tensionTimeout);
    triggerBeat();
  }

  public stopTensionBeat() {
    if (this.tensionTimeout) {
      clearTimeout(this.tensionTimeout);
      this.tensionTimeout = null;
    }
    // Filtreyi normale döndür
    if (this.ctx && this.globalFilter) {
      this.globalFilter.frequency.setTargetAtTime(3500, this.ctx.currentTime, 1.0);
    }
  }

  /**
   * Minimalist Uzay Müziği (Atmospheric Loop)
   */
  public playMusic(tempo: number = 1.0) {
    if (!this.ctx || !this.globalFilter || this.isMusicPlaying || !this.musicEnabled || this.isMuted) return;
    this.isMusicPlaying = true;
    this.resume();

    const notes = [220, 277.18, 329.63, 415.30]; // A3, C#4, E4, G#4 (Amaj7)
    let noteIndex = 0;

    const playLoop = () => {
      if (!this.isMusicPlaying) return;

      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[noteIndex], now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 1.0); // Uzun attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4.0); // Çok uzun release

      osc.connect(gain);
      gain.connect(this.globalFilter!);
      
      osc.start(now);
      osc.stop(now + 4.0);

      noteIndex = (noteIndex + 1) % notes.length;
      const delay = (2000 / tempo);
      this.musicTimeout = setTimeout(playLoop, delay);
    };

    playLoop();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  public playCoin() {
    if (!this.ctx || !this.globalFilter || !this.soundEnabled || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1); // E6'ya sıçrama

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.globalFilter);

    osc.start(now);
    osc.stop(now + 0.3);
  }
}
