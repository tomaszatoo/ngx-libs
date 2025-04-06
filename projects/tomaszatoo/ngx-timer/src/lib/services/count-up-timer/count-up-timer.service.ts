import { Injectable } from '@angular/core';
// interfaces
import { TimerData } from '../../timer.interface';
// rxjs
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountUpTimerService {

  private subject = new BehaviorSubject<TimerData>({ valueNumber: 0, valueString: '00:00.000' });

  private startTime: number = 0;
  private elapsedWhenPaused: number = 0;
  private isPaused = false;
  private speed = 1;
  private resolution: string = 'm';
  private maxValue: number = 0; // 0 = no limit
  private rafId: number | null = null;

  private lastUpdateString: string = '';
  private lastUpdateTime: number = 0;

  start(startFrom: number = 0, maxValue: number = 0, resolution: string = 'm', speed: number = 1): void {
    this.stop();
    this.isPaused = false;
    this.elapsedWhenPaused = startFrom;
    this.resolution = resolution;
    this.speed = speed;
    this.maxValue = maxValue;
    this.startTime = Date.now();
    this.lastUpdateString = '';
    this.lastUpdateTime = 0;
    this.tick();
  }

  private tick = () => {
    if (this.isPaused) return;

    const now = Date.now();
    const elapsed = this.elapsedWhenPaused + (now - this.startTime) * this.speed;
    const capped = this.maxValue > 0 ? Math.min(elapsed, this.maxValue) : elapsed;
    const formatted = this.msToString(capped, this.resolution);

    // Throttle frame emission based on speed
    const targetFps = 60 * this.speed;
    const minInterval = 1000 / targetFps;

    if (formatted !== this.lastUpdateString && now - this.lastUpdateTime >= minInterval) {
      this.lastUpdateString = formatted;
      this.lastUpdateTime = now;

      this.subject.next({
        valueNumber: capped,
        valueString: formatted,
      });
    }

    if (this.maxValue > 0 && capped >= this.maxValue) {
      this.subject.complete();
    } else {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  pause(): void {
    if (!this.isPaused) {
      this.isPaused = true;
      this.elapsedWhenPaused += (Date.now() - this.startTime) * this.speed;
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
