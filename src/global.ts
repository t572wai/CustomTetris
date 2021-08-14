let currentLevel = 1;

let currentMino;
let followingMinos:Tetriminos[] = [];

let holdMinoType;

function currentFallingSpeed(level) {
	let speedRate = 1;
	if(currentMinoIsSoftDrop) {
		speedRate = 0.05;
	}
	return FallingSpeed(level)*speedRate;
}

let canHold;

let score;

let currentREN = -1;

let totalClearedLine;

let isJustNowSpin:Number;

let isPlayingTetris;

let swiper;

let currentGameRule:any = 'normal';
