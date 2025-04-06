import { Component, OnInit, OnDestroy } from '@angular/core';
// ngx-timer
import {
  TimerData,
  CountDownTimerService,
  CountUpTimerService
} from '@tomaszatoo/ngx-timer';
// rxjs
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ngx-timer',
  standalone: true,
  imports: [],
  templateUrl: './ngx-timer.component.html',
  styleUrl: './ngx-timer.component.scss'
})
export class NgxTimerComponent implements OnInit, OnDestroy {

  private countDownSubscription: Subscription = new Subscription();
  private countUpSubscription: Subscription = new Subscription();

  private countDownPaused: boolean = false;
  private countUpPaused: boolean = false;

  private minute: number = 1 * 60 * 1000;

  countUpData!: TimerData;
  countDownData!: TimerData;

  constructor(
    private readonly countDown: CountDownTimerService,
    private readonly countUp: CountUpTimerService
  ) {}

  ngOnInit(): void {
    // countdown
    this.startCountDown();
    

    // countup
    this.startCountUp();
  }

  private startCountDown() {
    this.countDown.start(this.minute, 'm', 1);
    const subscription = this.countDown.getObservable().subscribe({
      next: (data: TimerData) => {
        this.countDownData = data;
        // console.log('DOWN:', data)
      },
      complete: () => {
        subscription.unsubscribe();
        console.log('countDown complete')
      }
    });
  }

  private startCountUp() {
    this.countUp.start(0, this.minute, 'm', 1);
    const subscription = this.countUp.getObservable().subscribe({
      next: (data: TimerData) => this.countUpData = data,
      complete: () => {
        subscription.unsubscribe();
        console.log('countUp complete')
      }
    })
  }

  changeCountUpSpeed(changeEvent: any): void {
    console.log('changeSpeedEvent', changeEvent);
    if (changeEvent && changeEvent.target && changeEvent.target.value && parseFloat(changeEvent.target.value)) {
      this.countUp.setSpeed(parseFloat(changeEvent.target.value));
    }
    
  }

  changeCountDownSpeed(changeEvent: any): void {
    console.log('changeSpeedEvent', changeEvent);
    if (changeEvent && changeEvent.target && changeEvent.target.value && parseFloat(changeEvent.target.value)) {
      this.countDown.setSpeed(parseFloat(changeEvent.target.value));
    }
    
  }


  ngOnDestroy(): void {
    this.countDownSubscription.unsubscribe();
    this.countUpSubscription.unsubscribe();
  }

  toggleCountUp(): void {
    if (this.countUpPaused) {
      this.countUp.resume();
    } else {
      this.countUp.pause();
    }
    this.countUpPaused = !this.countUpPaused;
  }

  toggleCountDown(): void {
    if (this.countDownPaused) {
      this.countDown.resume();
    } else {
      this.countDown.pause();
    }
    this.countDownPaused = !this.countDownPaused;
  }

}
