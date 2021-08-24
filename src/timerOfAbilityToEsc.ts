export class TimerOfAbilityToEsc {
	private timer: NodeJS.Timer;
	private endCb: ()=>void;
	private waitSec: number;
	private startTime: number;
	private processTime: number;

	constructor(callback: ()=>void,sec: number) {
		this.waitSec = sec;
		this.endCb = callback;
		this.processTime = 0;
	}

	setTimeout(): void {
		this.timer = setTimeout(this.endCb, this.waitSec);
		this.startTime = Date.now();
	}
	clearTimeout(): void {
		clearTimeout(this.timer);
	}

	pauseTimeout() {
		this.processTime += Date.now() - this.startTime;
		if (this.processTime < this.waitSec) {
			clearTimeout(this.timer);
		}
	}
	restartTimeout() {
		this.startTime = Date.now();
		this.timer = setTimeout(this.endCb,this.waitSec-this.processTime);
	}
}
