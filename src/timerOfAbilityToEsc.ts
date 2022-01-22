export class TimerAbleToEsc {
	private timer: NodeJS.Timer;
	private endCb: ()=>void;
	private _waitSec: number;
	private startTime: number;
	private processTime: number;

	constructor(callback: ()=>void = ()=>{},sec: number = 1000) {
		this._waitSec = sec;
		this.endCb = callback;
		this.processTime = 0;
	}

	setTimeout(): void {
		this.processTime = 0;
		this.timer = setTimeout(this.endCb, this._waitSec);
		this.startTime = Date.now();
	}
	clearTimeout(): void {
		clearTimeout(this.timer);
		this.processTime = 0;
	}

	pauseTimeout() {
		this.processTime += Date.now() - this.startTime;
		if (this.processTime < this._waitSec) {
			clearTimeout(this.timer);
		}
	}
	restartTimeout() {
		this.startTime = Date.now();
		this.timer = setTimeout(this.endCb,this._waitSec-this.processTime);
	}

	set waitSec(sec: number) {
		this._waitSec = sec;
	}
}
