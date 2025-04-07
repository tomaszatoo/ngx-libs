export class Utils {
    msToString(ms: number, resolution: string = 'm'): string {
        const pad = (n: number, z: number = 2) => ('00' + n).slice(-z);
        const msPart = Math.floor(ms % 1000);
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