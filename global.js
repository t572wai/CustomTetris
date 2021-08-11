let currentLevel = 1;

let currentMino;
let followingMinos = [];

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

let totalClearedLine;

let isJustNowSpin;

let isPlayingTetris;

let swiper;

let currentGameRule = 'normal';
