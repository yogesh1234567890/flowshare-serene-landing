
// Simple sound effects using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;

  private getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Connection success sound - ascending notes
  playConnectSound() {
    const ctx = this.getAudioContext();
    const frequencies = [261.63, 329.63, 392.00]; // C, E, G
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToTimeAtTime(0.1, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToTimeAtTime(0.001, ctx.currentTime + 0.3);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      }, index * 100);
    });
  }

  // File drop sound - subtle whoosh
  playDropSound() {
    const ctx = this.getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToTimeAtTime(80, ctx.currentTime + 0.2);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToTimeAtTime(0.05, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToTimeAtTime(0.001, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }

  // Complete sound - celebratory chime
  playCompleteSound() {
    const ctx = this.getAudioContext();
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToTimeAtTime(0.08, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToTimeAtTime(0.001, ctx.currentTime + 0.4);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
      }, index * 80);
    });
  }

  // QR scan sound - quick beep
  playQRScanSound() {
    const ctx = this.getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToTimeAtTime(0.1, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToTimeAtTime(0.001, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }
}

export const soundEffects = new SoundEffects();
