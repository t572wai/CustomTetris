let currentLevel: number = 1;

//let currentMino: Mino;
let followingMinos:(Tetrimino | undefined)[] = [];

let holdMinoType: Tetrimino;

function currentFallingSpeed(level: number): number {
	let speedRate = 1;
	if(currentMinoIsSoftDrop) {
		speedRate = 0.05;
	}
	return FallingSpeed(level)*speedRate;
}

let canHold: boolean;

let score: number;

let currentREN:number = -1;

let totalClearedLine: number;

let isJustNowSpin: number;

let isPlayingTetris: boolean;

let swiper: Swiper;

//let currentGameRule: GameRule = 'normal';
