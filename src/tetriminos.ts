let currentMinoType: Tetrimino;

let currentMinoFacing: number;
let currentMinoX: number;
let currentMinoY: number;

let currentMinoTiles: Mino[];
let currentMinoIsVisible: boolean;

let currentMinoIsSoftDrop: boolean;
let currentMinoIsHardDrop: boolean;

let lowestPos: number;
let lowestPosWithLowerFace: number;
let numberOfMoveWithLowerFace: number;
let currentMinoDidLockDown: boolean;
let currentMinoLockDownTimer: any;
let currentMinoLockedDownCallback: (lower: number) => void;

let isLoopingOfFalling: boolean;

let indicatorForLockDown;

let isMoving;

let moveTimers: any;

let ghostMinos: Mino[];

function initMino( type: Tetrimino ) {
	currentMinoType = type;
	currentMinoFacing = 0;
	currentMinoX = 4;
	currentMinoY = 1;
	currentMinoTiles = getTetrimino(currentMinoType,currentMinoX,currentMinoY,currentMinoType)
	currentMinoIsVisible = true;
	currentMinoDidLockDown = false;
	currentMinoIsSoftDrop = false;
	currentMinoIsHardDrop = false;
	setNumberOfMoveWithLowerFace(0);
	lowestPos = currentMinoY;
	currentMinoLockedDownCallback = function () {}
	moveTimers = {}
	ghostMinos = []
	isPlayingTetris = true;
}

function setCurrentMinoY(y: number): number {
	if (lowestPos < y) {
		lowestPos = y;
		setNumberOfMoveWithLowerFace(0)
	}
	currentMinoY = y;
	return currentMinoY;
}

function setNumberOfMoveWithLowerFace(num: number): number {
	console.log('%c' + num, 'color: red');
	numberOfMoveWithLowerFace = num;

	return numberOfMoveWithLowerFace;
}

function lowerPos(): number {
	let lower = -1;
	$.each(currentMinoTiles ,(i, tile: Mino) => {
		if(tile.y>lower) lower=tile.y;
	});
	console.log(lower);
	return lower;
}

function setTimer(name: string, callback: (b: boolean)=>void, delay: number): void {
	if(name=='fall') isLoopingOfFalling = true;
	moveTimers[name] = setTimeout(callback,delay)
}

function clearTimer(name: string): void {
	if(name=='fall') isLoopingOfFalling = false;
	clearTimeout(moveTimers[name])
}

function isWall(x: number, y: number): boolean {
	return (x<0 || x>fieldWidth-1 || y>fieldHeight-1)
}

function isOutOfField(x: number, y: number): boolean {
	return isWall(x,y) || y<0
}
function isOutOfMatrix(x: number, y: number): boolean {
	return isWall(x,y) || y<bufferHeight-1
}

function isFilledOrWall(x: number, y:number): boolean{
	if (isWall(x,y)) return true;

	if (fieldArray[y][x]!='empty') return true;

	return false;
}

function canMove(followingMinos: Mino[]): boolean {
	for (let tile of followingMinos) {
		if (isOutOfField(tile.x,tile.y)) {
			return false;
		}
		if (isOtherTiles(tile)) {
			return false;
		}
	}
	return true;
}

function canBeAppeared(): boolean {
	for (const mino of currentMinoTiles) {
		if (isOutOfField(mino.x,mino.y)) {
			return false;
		}
		if (fieldArray[mino.y][mino.x]!='empty') {
			return false;
		}
	}
	return true;
}

function isOtherTiles(tile: Mino | Pos): boolean {
	if (fieldArray[tile.y][tile.x] != 'empty') {
		if ( !currentMinoIsVisible ) return true;
		if ( !currentMinoTiles.find((element) => {return element.x==tile.x && element.y==tile.y }) ) {
			return true;
		}
	}
	return false;
}

function fall(callback: (b: boolean)=>void): void {
	moveWithDelay(0,1,'fall',callback);
}


function move(dx: number, dy: number, callback: (b:boolean)=>void): void {
	moveAndRotate(dx,dy,0,callback)
}

function moveAndRotate(dx: number, dy: number, sgn: number, callback: (b:boolean)=>void): void {
	let followingTiles = getMovedAndRotatedTetrimino(dx,dy,sgn);
	if (canMove(followingTiles)) {
		currentMinoX += dx;
		setCurrentMinoY(currentMinoY + dy);
		changeCurrentMinos(followingTiles, function () {
			currentMinoFacing = (currentMinoFacing + sgn) % 4;
			displayGhost()
			callback(true)
		})
	} else {
		callback(false)
	}
}


function replaceMinos(tiles: Mino[], type: Tetrimino): Mino[] {
	let replacedTiles:Mino[] = [];
	for (let tile of tiles) {
		replacedTiles.push({x:tile.x,y:tile.y,mino:type})
	}
	return replacedTiles;
}

function moveWithDelay(dx: number, dy: number, timerName: string, callback: (b:boolean)=>void): void {
	moveAndRotateWithDelay(dx,dy,0,timerName,callback)
}

function moveAndRotateWithDelay(dx: number, dy: number, sgn: number, timerName: string, callback: (b:boolean)=>void): void {
	clearTimer(timerName)
	setTimer(timerName,moveAndRotate.bind(null,dx,dy,sgn,callback),currentFallingSpeed(currentLevel))
}

function changeCurrentMinos(followingTiles: Mino[],callback: ()=>void): void {
	let formerTiles = replaceMinos(currentMinoTiles,'empty')
	currentMinoTiles = cloneArray(followingTiles)
	displayDiffer(formerTiles,function () {
		displayDiffer(followingTiles,callback)
	})
}

function hideCurrentMino(callback: ()=>void) {
	removeGhostMinos()
	displayDiffer(replaceMinos(currentMinoTiles,'empty'),callback)
}

function checkGhost(): number {
	let hightOfAbleToDrop = []
	for (let tile of currentMinoTiles) {
		for (var i = tile.y; i < fieldHeight; i++) {
			if (isOtherTiles({x:tile.x,y:i})) {
				hightOfAbleToDrop.push(i-tile.y-1)
				break;
			} else if (i==fieldHeight-1) {
				hightOfAbleToDrop.push(i-tile.y)
				break;
			}
		}
	}
	let hightOfDropping = minArray(hightOfAbleToDrop)
	if (hightOfDropping == 0) {
		ghostMinos = []
	} else {
		ghostMinos = getMovedAndRotatedTetrimino(0,hightOfDropping,0)
	}
	return hightOfDropping;
}


function displayGhost(): void {
	console.log('displayGhost');
	removeGhostMinos()
	checkGhost()
	displayGhostMinos()
}

function hardDrop(): void {
	if (!currentMinoDidLockDown && isPlayingTetris) {
		isJustNowSpin = -1;
		let hightOfDropping = checkGhost()
		removeGhostMinos()
		clearTimer('fall')
		let followingMinos = ghostMinos;
		setCurrentMinoY(currentMinoY+hightOfDropping)
		addScore('hardDrop',hightOfDropping)
		if (ghostMinos.length == 0) {
			followingMinos = currentMinoTiles;
		}
		changeCurrentMinos(followingMinos,lockDown)
	}
}

function softDrop(b: boolean): void {
	if (b && canFall() && !currentMinoIsSoftDrop) {
		clearTimer('fall')
		currentMinoIsSoftDrop = true
		loopOfFall()
	} else if(!b) {
		currentMinoIsSoftDrop = false
	}
}

function startFall(): void {
	if (!currentMinoDidLockDown) {
		console.log('start to fall');
		clearTimeout(currentMinoLockDownTimer)
		console.log(canMove(currentMinoTiles));
		if (canBeAppeared()) {
			currentMinoIsVisible = true;
			currentMinoDidLockDown = false;
			displayDiffer(currentMinoTiles,function () {
				displayGhost()
				if(!canFall())countLockDownTimer()
				loopOfFall()
			})
		} else {
			console.log(lowerPos());
			currentMinoLockedDownCallback(lowerPos())
		}
	}
}

function canFall(): boolean {
	let fallenTiles = getMovedTetrimino(0,1)
	let b = canMove(fallenTiles);
	if (isPlayingTetris) {
		return b;
	}
	return false;
}

function loopOfFall(): void {
	console.log('fall');
	isLoopingOfFalling = canFall()
	fall(function (b) {
		if (b) {
			isJustNowSpin = -1;
		}
		if (currentMinoIsSoftDrop) {
			addScore('softDrop')
		}
		if (canFall()) {
			loopOfFall()
		} else {
			console.log('clearTimeout');
			clearTimer('fall')
			countLockDownTimer();
		}
	})
}

function restartFall(): void {
	if (canFall() && !isLoopingOfFalling) {
		console.log('clear all timer');
		clearTimeout(currentMinoLockDownTimer)
		clearTimer('fall')
		loopOfFall()
	}
}

function countLockDownTimer(): void {
	console.log('set timer');
	if (!currentMinoDidLockDown) {
		clearTimeout(currentMinoLockDownTimer)
		currentMinoLockDownTimer = setTimeout(function () {
			lockDown()
		},500)
	}
}

function lockDown(): void {
	console.log('mino locks down');
	currentMinoDidLockDown = true;
	clearTimeout(currentMinoLockDownTimer)
	//ion.sound.play("lockDownSE", {
	//	ended_callback : function () {
	//		console.log("lockDownSE end");
	//	}
	//})
	//lockDownSound.play()
	let lower = lowerPos()
	checkLine(currentMinoLockedDownCallback.bind(null,lower))
}

function moveToLeft(callback: (b:boolean)=>void): void {
	operate(-1,0,0,callback)
}

function moveToRight(callback: (b:boolean)=>void): void {
	operate(1,0,0,callback)
}

function isAllowedOperate(): boolean {
	return numberOfMoveWithLowerFace<15;
}

function operate(dx: number, dy: number, sgn: number, callback: (b:boolean)=>void): void {
	if (canOperate()) {
		const formerCanFall = canFall();
		moveAndRotate(dx, dy, sgn, function(b) {
			if (b) {
				onOperating(formerCanFall)
			}
			callback(b)
		})
	}
}

function onOperating(formerCanFall: boolean): void {
	let currentCanFall = canFall()
	if (!currentCanFall && !isAllowedOperate()) {
		lockDown()
		return;
	}
	if (!formerCanFall) {
		setNumberOfMoveWithLowerFace(numberOfMoveWithLowerFace+1);
		clearTimeout(currentMinoLockDownTimer);
		if (currentCanFall) {
			restartFall()
		} else {
			countLockDownTimer()
		}
	} else {
		if (!currentCanFall) {
			countLockDownTimer()
			clearTimer('fall')
		}
	}
}

function canOperate(): boolean {
	return !currentMinoDidLockDown && isPlayingTetris;
}


function getTetriminoShape(type: Tetrimino): Pos[] | null {
	let minoArray:Pos[] = [];
	const shape: number[][] | undefined = ShapesOfTetrimino.get(type);
	let originPos:Pos = {x:0,y:0};
	if (typeof shape != 'undefined') {
		for (var i = 0; i < shape.length; i++) {
			for (var j = 0; j < shape[i].length; j++) {
				if (shape[i][j]!=-1){
					minoArray.push({x:j,y:i});
				}
				if (shape[i][j]==0) {
					originPos = {x:j,y:i}
				}
			}
		}
		console.log();
		return getMovedMinos(minoArray,-originPos.x,-originPos.y);
	} else {
		return null;
	}
}

function getMovedMinos(tiles: Pos[], dx: number, dy: number): Pos[] {
	return tiles.map((tile) => ({x:tile.x+dx,y:tile.y+dy}))
}

function getRotatedTetriminoShape(type: Tetrimino,d: number): Pos[] {
	const shape: Pos[] | null = getTetriminoShape(type);
	if (typeof shape !== null) {
		const shape_pos: Pos[] = shape as Pos[];
		if (type=='o') {
			return shape_pos;
		} else if (type=='i') {
			const differ = [
				[0,0],
				[1,0],
				[1,1],
				[0,1]
			]
			return getMovedMinos(changeFacing(shape_pos,d), differ[d][0], differ[d][1]);
		} else {
			return changeFacing(shape_pos,d);
		}
	} else {
		return []
	}
}

function getTetrimino(type: Tetrimino, x: number, y: number, mino: Tetrimino): Mino[] {
	return getRotatedTetrimino(type,x,y,currentMinoFacing,mino)
}

function getRotatedTetrimino(type: Tetrimino, x: number, y: number, d: number, mino: Tetrimino): Mino[] {
	return getRotatedTetriminoShape(type,d).map((array: Pos) => ({x:x+array.x,y:y+array.y,mino:mino}));
}

function getMovedTetrimino(dx: number, dy: number): Mino[] {
	return getTetrimino(currentMinoType,currentMinoX+dx,currentMinoY+dy,currentMinoType)
}

function getMovedAndRotatedTetrimino(dx: number, dy: number, sgn: number): Mino[] {
	return getRotatedTetrimino(currentMinoType,currentMinoX+dx,currentMinoY+dy,(currentMinoFacing+sgn)%4,currentMinoType);
}

/**
 *
 * @param {number} formerFacing
 * @param {number} followingFacing
 * @returns どれだけ回転させるのか[n:n回右回転]
 */
function signOfRotation(formerFacing: number, followingFacing: number): number {
	return (((followingFacing - formerFacing) % 4) + 4) % 4;
}


/**
 * [changeDirection description]
 * @param  {Array<number>} tiles               [x,y]
 * @param  {number} sgn                 [0-3]
 * @return {Array<number>}       [0-3]
 */
function changeFacing(tiles: Pos[], sgn: number): Pos[] {
	//console.log(tiles);
	let newTiles:Pos[] = cloneArray<Pos>(tiles)
	//console.log(newTiles);
	if (sgn==0) {
		return newTiles;
	} else if(sgn==1) {
		newTiles = newTiles.map((tile) => ({x: -tile.y, y: tile.x}))
		return newTiles;
	} else if(sgn==2) {
		newTiles = newTiles.map((tile) => ({x:-tile.x, y:-tile.y}))
		return newTiles;
	} else {
		newTiles = newTiles.map((tile) => ({x: tile.y, y: -tile.x}))
		return newTiles;
	}
}


function superRotation(spinDirection: number, callback: (b:boolean)=>void): void {
	let i=0;
	moveSRS(spinDirection,i,function (b) {
		if (b) isJustNowSpin = i;
		callback(b)
	})
}

function moveSRS(spinDirection: number,i: number,callback: (b:boolean)=>void): void {
	let dx = 0;
	let dy = 0;
	if (i!=0) {
		const spinRuleTemp = spinRule.get(currentMinoType);
		if (typeof spinRuleTemp !== 'undefined') {
			const spinRuleTemp_defined = spinRuleTemp as Pos[][][];
			let differ = spinRuleTemp_defined[currentMinoFacing][spinDirection][i-1];
			dx = differ.x;
			dy = differ.y;
		}
	}
	// console.log(dx,dy);
	let sgn = (spinDirection==0)?1:3;
	operate(dx,dy,sgn,function(b){
		if (!b) {
			const spinRuleTemp = spinRule.get(currentMinoType);
			if (typeof spinRuleTemp !== 'undefined') {
				const spinRuleTemp_defined = spinRuleTemp as Pos[][][];
				if(spinRuleTemp_defined[currentMinoFacing][spinDirection][i]) {
					moveSRS(spinDirection,++i,callback)
				} else {
					callback(false)
				}
			} else {
				callback(false)
			}
		} else {
			callback(true)
		}
	})
}

function rightRotation() {
	console.log('rightSpin');
	if (canOperate()) {
		superRotation(0, function(b) {
			if (b) {

			}
		})
	}
}

function leftRotation() {
	console.log('leftSpin');
	if (canOperate()) {
		superRotation(1, function (b) {
			if (b) {
				// isJustNowSpin = b;
			}
		})
	}
}
