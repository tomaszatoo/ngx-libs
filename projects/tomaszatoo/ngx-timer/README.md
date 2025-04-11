# ⏱️ ngx-timer

Reactive, high-precision, animation-frame-based timers for Angular.  
Easily count up or down with support for pause/resume, custom speeds, and completion handling.

---

## 📦 Installation

```bash
npm install @tomaszatoo/ngx-timer
```

---
## 🔗 Source
- [Angular Project](https://github.com/tomaszatoo/ngx-libs/tree/main/projects/tomaszatoo/ngx-timer)
- [Repository](https://github.com/tomaszatoo/ngx-libs.git)

## 🚀 Features

- 🎯 Count **up** or **down**
- ⏸️ `pause()` / ▶️ `resume()` support
- 🚀 Custom `speed` (e.g. `0.5` = slow-mo, `2` = fast-forward)
- 📏 Optional `maxValue` (for `CountUp`) or duration (for `CountDown`)
- 🧠 Smart emissions (no redundant updates)
- 🧮 Emits both human-readable string and raw milliseconds
- 🧼 Lightweight and zero-dependency

---

## 🧠 Interface

```ts
export interface TimerData {
  valueString: string;  // Formatted string like "00:42.381"
  valueNumber: number;  // Raw milliseconds
}
```

---

## ⬇️ CountDownTimerService

### Usage

```ts
constructor(private countDown: CountDownTimerService) {}

ngOnInit() {
  const duration = 10_000; // 10 seconds

  this.countDown.start(duration, 's', 1); // (duration, resolution?, speed?)

  this.countDown.getObservable().subscribe({
    next: (data) => console.log('Countdown:', data.valueString),
    complete: () => console.log('Countdown complete!'),
  });
}
```

---

## ⬆️ CountUpTimerService

### Usage

```ts
constructor(private countUp: CountUpTimerService) {}

ngOnInit() {
  const max = 60_000; // 1 minute

  this.countUp = new CountUpTimerService(max); // maxValue passed to constructor
  this.countUp.start(0, 's', 1); // (startFrom?, resolution?, speed?)

  this.countUp.getObservable().subscribe({
    next: (data) => console.log('CountUp:', data.valueString),
    complete: () => console.log('CountUp complete!'),
  });
}
```

---

## ⏯️ Pause / Resume / Speed Control

```ts
this.countUp.pause();
this.countUp.resume();
this.countUp.setSpeed(0.5); // Half speed
```

---

## 🔚 Stop & Restart

```ts
this.countDown.stop();
this.countDown.start(30_000); // Restart from 30 sec
```

---

## 🧪 Resolutions

| Key | Format Example     |
|-----|--------------------|
| `s` | `42.381`           |
| `m` | `00:42.381`        |
| `h` | `00:00:42.381`     |
| `d` | `0d 00:00:42.381`  |