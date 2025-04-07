import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TimerData } from '../../timer.interface';
import { Utils } from '../../utils';

@Injectable({ providedIn: 'root' })
export class CountUpTimerService {

  private subject = new BehaviorSubject<TimerData>({ valueNumber: 0, valueString: '00:00.000' });

  private startTime = 0;
  private elapsedWhenPaused = 0;
  private isPaused = false;
  private speed = 1;
  private resolution: string = 'm';
  private maxValue = 0;
  private rafId: number | null = null;

  private lastUpdateTime = 0;
  private lastValue = 0;
  private visualSmooth = false;

  start(startFrom = 0, maxValue = 0, resolution: string = 'm', speed = 1, visualSmooth = false): void {
    this.stop();
    this.isPaused = false;
    this.elapsedWhenPaused = startFrom;
    this.resolution = resolution;
    this.speed = speed;
    this.maxValue = maxValue;
    this.visualSmooth = visualSmooth;
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;
    this.lastValue = startFrom;
    this.tick();
  }

  private tick = () => {
    if (this.isPaused) return;

    const now = Date.now();
    const rawElapsed = this.elapsedWhenPaused + (now - this.startTime) * this.speed;
    const capped = this.maxValue > 0 ? Math.min(rawElapsed, this.maxValue) : rawElapsed;

    let displayElapsed = capped;

    if (this.visualSmooth) {
      const timeSinceLast = now - this.lastUpdateTime;
      const approxFps = 60;
      const frameInterval = 1000 / approxFps;
      const deltaPerFrame = frameInterval * this.speed;
      const estimatedElapsed = this.lastValue + deltaPerFrame;

      displayElapsed = Math.min(estimatedElapsed, capped);
    }

    const formatted = new Utils().msToString(displayElapsed, this.resolution);

    this.subject.next({
      valueNumber: capped,
      valueString: formatted
    });

    this.lastUpdateTime = now;
    this.lastValue = capped;

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
      this.lastUpdateTime = this.startTime;
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

}