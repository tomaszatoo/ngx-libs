import { Injectable } from '@angular/core';
// interface
import { TimerData } from '../../timer.interface';
// rxjs
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CountDownTimerService {

  private subject = new BehaviorSubject<TimerData>({ valueNumber: 0, valueString: '00:00.000' });

  private duration: number = 0;
  private startTime: number = 0;
  private remainingWhenPaused: number = 0;
  private isPaused = false;
  private speed = 1;
  private resolution: string = 'm';
  private rafId: number | null = null;

  private lastUpdateString: string = '';
  private lastUpdateTime: number = 0;

  start(duration: number, resolution: string = 'm', speed: number = 1): void {
    this.stop(); // kill old timer
    this.isPaused = false;
    this.duration = duration;
    this.remainingWhenPaused = duration;
    this.resolution = resolution;
    this.speed = speed;
    this.startTime = Date.now();
    this.lastUpdateString = '';
    this.lastUpdateTime = 0;
    this.tick();
  }

  private tick = () => {
    if (this.isPaused) return;

    const now = Date.now();
    const elapsed = (now - this.startTime) * this.speed;
    const remaining = Math.max(0, this.remainingWhenPaused - elapsed);
    const formatted = this.msToString(remaining, this.resolution);

    // throttle frame emission based on speed (optional)
    const targetFps = 60 * this.speed;
    const minInterval = 1000 / targetFps;

    if (formatted !== this.lastUpdateString && now - this.lastUpdateTime >= minInterval) {
      this.lastUpdateString = formatted;
      this.lastUpdateTime = now;

      this.subject.next({
        valueNumber: remaining,
        valueString: formatted,
      });
    }

    if (remaining > 0) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.subject.next({
        valueNumber: 0,
        valueString: this.msToString(0, this.resolution),
      });
      this.subject.complete();
    }
  };

  pause(): void {
    if (!this.isPaused) {
      this.isPaused = true;
      this.remainingWhenPaused -= (Date.now() - this.startTime) * this.speed;
      if (this.rafId) cancelAnimationFrame(this.rafId);
    }
  }

  resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.startTime = Date.now();
      this.tick();
    }
  }

  setSpeed(newSpeed: number): void {
    this.pause();
    this.speed = newSpeed;
    this.resume();
  }

  stop(): void {
    this.isPaused = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.subject.complete();
    this.subject = new BehaviorSubject<TimerData>({ valueNumber: 0, valueString: '00:00.000' });
  }

  getObservable(): BehaviorSubject<TimerData> {
    return this.subject;
  }

  private msToString(ms: number, resolution: string = 'm'): string {
    const pad = (n: number, z: number = 2) => ('00' + n).slice(-z);
    const msPart = ms % 1000;
    ms = Math.floor(ms / 1000);
    const secs = ms % 60;
    ms = Math.floor(ms / 60);
    const mins = ms % 60;
    ms = Math.floor(ms / 60);
    const hrs = ms % 24;
    const days = Math.floor(ms / 24);

    switch (resolution) {
      case 's': return `${pad(secs)}.${pad(msPart, 3)}`;
      case 'm': return `${pad(mins)}:${pad(secs)}.${pad(msPart, 3)}`;
      case 'h': return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(msPart, 3)}`;
      case 'd': return `${days}d ${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(msPart, 3)}`;
      default: return `${pad(mins)}:${pad(secs)}.${pad(msPart, 3)}`;
    }
  }

}
