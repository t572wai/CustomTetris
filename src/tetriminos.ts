let currentMinoType: Tetriminos;

let currentMinoFacing;
let currentMinoX;
let currentMinoY;

let currentMinoTiles;
let currentMinoIsVisible;

let currentMinoIsSoftDrop;
let currentMinoIsHardDrop;

let lowestPos;
let lowestPosWithLowerFace;
let numberOfMoveWithLowerFace;
let currentMinoDidLockDown;
let currentMinoLockDownTimer;
let currentMinoLockedDownCallback;

let isLoopingOfFalling;

let indicatorForLockDown;

let isMoving;

let moveTimers;

let ghostMinos;

function initMino( type: Tetriminos ) {
	//if(typeof type == ) {
		// console.log(type);
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
		//setIndicatorForLockDown(0)
		moveTimers = {}
		ghostMinos = []
		isPlayingTetris = true;
		//canHold = true;
	//}else {
	//	console.log("unknown mino error");
	//}
}

function setCurrentMinoY(y) {
	//console.log(y,current);
	if (lowestPos < y) {
		lowestPos = y;
		setNumberOfMoveWithLowerFace(0)
	}
	currentMinoY = y;
	return currentMinoY;
}

//function setIndicatorForLockDown(val) {
//	console.log(val);
//	indicatorForLockDown = val;
//	if (indicatorForLockDown < 0) {
//		// console.log(greenLog + indicatorForLockDown + resetLogColor);
//		console.log(indicatorForLockDown);
//		indicatorForLockDown = 0;
//		setNumberOfMoveWithLowerFace(0)
//	}

//	return indicatorForLockDown;
//}

function setNumberOfMoveWithLowerFace(num) {
	console.log('%c' + num, 'color: red');
	numberOfMoveWithLowerFace = num;
	// if (!isAllowedOperate()) {
	// 	lockDown()
	// }

	return numberOfMoveWithLowerFace;
}

function lowerPos() {
	let lower = -1;
	$.each(currentMinoTiles ,(i, tile) => {
		// console.log(tile);
		if(tile[1]>lower) lower=tile[1];
	});
	console.log(lower);
	return lower;
}

function setTimer(name,callback,delay) {
	if(name=='fall') isLoopingOfFalling = true;
	moveTimers[name] = setTimeout(callback,delay)
}

function clearTimer(name) {
	if(name=='fall') isLoopingOfFalling = false;
	clearTimeout(moveTimers[name])
}

function isWall(x,y) {
	return (x<0 || x>fieldWidth-1 || y>fieldHeight-1)
}

function isOutOfField(x,y) {
	return isWall(x,y) || y<0
}
function isOutOfMatrix(x,y) {
	return isWall(x,y) || y<bufferHeight-1
}

function isFilledOrWall(x,y){
	if (isWall(x,y)) return true;

	if (fieldArray[y][x]!='empty') return true;
	// console.log(x,y,isWall(x,y),fieldArray[y][x]);

	return false;
}

function canMove(followingTiles) {
	// console.log("check");
	for (let tile of followingTiles) {
		// console.log(tile);
		if (tile[0]<0 || tile[0]>9 || tile[1]<0 || tile[1]>21) {
			console.log(tile);
			return false;
		}
		if (isOtherTiles(tile)) {
			console.log(tile,fieldArray);
			return false;
		}
	}
	return true;
}

function isOtherTiles(tile) {
	if (fieldArray[tile[1]][tile[0]] != 'empty') {
		// console.log(tile);
		//console.log(currentMinoIsVisible);
		if ( !currentMinoIsVisible ) return true;
		if ( !currentMinoTiles.find((element) => {return element[0]==tile[0] && element[1]==tile[1] }) ) {
			// console.log(currentMinoTiles);
			//console.log(tile,fieldArray[tile[1]][tile[0]].string);
			return true;
		}
	}
	return false;
}

function fall(callback) {
	moveWithDelay(0,1,'fall',callback);
}


function move(dx,dy,callback) {
	moveAndRotate(dx,dy,0,callback)
}

function moveAndRotate(dx,dy,sgn,callback) {
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

function replaceTiles(tiles,type: Tetriminos) {
	let replacedTiles = [];
	for (let tile of tiles) {
		replacedTiles.push([tile[0],tile[1],type])
	}
	return replacedTiles;
}

function moveWithDelay(dx,dy,timerName,callback) {
	moveAndRotateWithDelay(dx,dy,0,timerName,callback)
}

function moveAndRotateWithDelay(dx,dy,sgn,timerName,callback) {
	// console.log('moveWithDelay');
	// console.log(currentFallingSpeed(currentLevel));
	clearTimer(timerName)
	setTimer(timerName,moveAndRotate.bind(null,dx,dy,sgn,callback),currentFallingSpeed(currentLevel))
	// fallTimer = setTimeout(move.bind(null,dx,dy,callback),currentFallingSpeed(currentLevel))
}

function changeCurrentMinos(followingTiles,callback) {
	let formerTiles = replaceTiles(currentMinoTiles,'empty')
	currentMinoTiles = cloneArray(followingTiles)
	// console.log(Date.now());
	displayDiffer(formerTiles,function () {
		displayDiffer(followingTiles,callback)
	})
}

function hideCurrentMino(callback) {
	removeGhostMinos()
	displayDiffer(replaceTiles(currentMinoTiles,'empty'),callback)
}

function checkGhost() {
	let hightOfAbleToDrop = []
	for (let tile of currentMinoTiles) {
		for (var i = tile[1]; i < fieldHeight; i++) {
			if (isOtherTiles([tile[0],i])) {
				hightOfAbleToDrop.push(i-tile[1]-1)
				break;
			} else if (i==fieldHeight-1) {
				hightOfAbleToDrop.push(i-tile[1])
				break;
			}
		}
	}
	// console.log(hightOfAbleToDrop);
	let hightOfDropping = minArray(hightOfAbleToDrop)
	if (hightOfDropping == 0) {
		ghostMinos = []
	} else {
		ghostMinos = getMovedAndRotatedTetrimino(0,hightOfDropping,0)
	}
	return hightOfDropping;
}


function displayGhost() {
	console.log('displayGhost');
	// let formerGhost = cloneArray(ghostTiles);
	removeGhostMinos()
	checkGhost()
	displayGhostMinos()
	// console.log(Date.now());
}

function hardDrop() {
	if (!currentMinoDidLockDown) {
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

function softDrop(b) {
	// console.log(b,canFall(),currentMinoIsSoftDrop);
	if (b && canFall() && !currentMinoIsSoftDrop) {
		// clearTimeout(fallTimer)
		clearTimer('fall')
		currentMinoIsSoftDrop = true
		loopOfFall()
	} else if(!b) {
		currentMinoIsSoftDrop = false
	}
}

function startFall() {
	if (!currentMinoDidLockDown) {
		console.log('start to fall');
		// console.log(this.type);
		clearTimeout(currentMinoLockDownTimer)
		// console.log('clear timer');

		if (canMove(currentMinoTiles)) {
			currentMinoIsVisible = true;
			currentMinoDidLockDown = false;
			// console.log(this.tiles);
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

function canFall() {
	let fallenTiles = getMovedTetrimino(0,1)
	let b = canMove(fallenTiles);
	if (isPlayingTetris) {
		return b;
	}
}

function loopOfFall() {
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
			// setNumberOfMoveWithLowerFace(numberOfMoveWithLowerFace+1)
			// clearTimeout(fallTimer)
			clearTimer('fall')
			// currentMinoIsFalling = false;
			countLockDownTimer();
		}
	})
}

function restartFall() {
	// console.log(isLoopingOfFalling);
	if (canFall() && !isLoopingOfFalling) {
		console.log('clear all timer');
		clearTimeout(currentMinoLockDownTimer)
		// clearTimeout(fallTimer)
		clearTimer('fall')
		// fallTimer = setTimeout(loopOfFall,currentFallingSpeed(currentLevel))
		loopOfFall()
	}
}

// function isFalling() {
// 	return currentMinoIsFalling;
// }

function countLockDownTimer() {
	console.log('set timer');
	if (!currentMinoDidLockDown) {
		clearTimeout(currentMinoLockDownTimer)
		currentMinoLockDownTimer = setTimeout(function () {
			lockDown()
		},500)
	}
}

function lockDown() {
	console.log('mino locks down');
	currentMinoDidLockDown = true;
	clearTimeout(currentMinoLockDownTimer)
	//ion.sound.play("lockDownSE", {
	//	ended_callback : function () {
	//		console.log("lockDownSE end");
	//	}
	//})
	let lower = lowerPos()
	checkLine(currentMinoLockedDownCallback.bind(null,lower))
	// currentMinoLockedDownCallback(lower)
}

function moveToLeft(callback) {
	//console.log('move to left');
	operate(-1,0,0,callback)
}

function moveToRight(callback) {
	//console.log('move to right');
	operate(1,0,0,callback)
}

function isAllowedOperate() {
	return numberOfMoveWithLowerFace<15;
}

function operate(dx, dy, sgn, callback) {
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

function onOperating(formerCanFall) {
	//console.log('with move to left or right');
	let currentCanFall = canFall()
	//console.log(currentCanFall, isAllowedOperate());
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

function canOperate() {
	return !currentMinoDidLockDown && isPlayingTetris;
}


function getTetriminoShape(type) {
	let minoArray = [];
	//console.log(type, ShapesOfTetriminoEnum.getByValue('string',type) );
	const shape = ShapesOfTetrimino.get(type);
	// let minoArray = [];
	let originPos = [];
	for (var i = 0; i < shape.length; i++) {
		for (var j = 0; j < shape[i].length; j++) {
			// console.log(j,i);
			if (shape[i][j]!=-1){
				minoArray.push([j,i]);
			}
			if (shape[i][j]==0) {
				originPos = [j,i]
			}
		}
	}
	// console.log(minoArray);

	return getMovedMinos(minoArray,-originPos[0],-originPos[1]);
}

function getMovedMinos(tiles,dx,dy) {
	return tiles.map((tile) => [tile[0]+dx,tile[1]+dy])
}

function getRotatedTetriminoShape(type,d) {
	if (type=='o') {
		return getTetriminoShape(type)
	} else if (type=='i') {
		const differ = [
			[0,0],
			[1,0],
			[1,1],
			[0,1]
		]
		return getMovedMinos(changeFacing(getTetriminoShape(type),d), differ[d][0], differ[d][1]);
	} else {
		return changeFacing(getTetriminoShape(type),d);
	}
}

function getTetrimino(type,x,y,mino: Tetriminos) {
	return getRotatedTetrimino(type,x,y,currentMinoFacing,mino)
}

function getRotatedTetrimino(type,x,y,d,mino: Tetriminos) {
	return getRotatedTetriminoShape(type,d).map((array) => [x+array[0],y+array[1],mino]);
}

function getMovedTetrimino(dx,dy) {
	return getTetrimino(currentMinoType,currentMinoX+dx,currentMinoY+dy,currentMinoType)
}

function getMovedAndRotatedTetrimino(dx,dy,sgn) {
	return getRotatedTetrimino(currentMinoType,currentMinoX+dx,currentMinoY+dy,(currentMinoFacing+sgn)%4,currentMinoType);
}

/**
 *
 * @param {number} formerFacing
 * @param {number} followingFacing
 * @returns どれだけ回転させるのか[n:n回右回転]
 */
function signOfRotation(formerFacing, followingFacing) {
	return (((followingFacing - formerFacing) % 4) + 4) % 4;
}


/**
 * [changeDirection description]
 * @param  {Array<number>} tiles               [x,y]
 * @param  {number} sgn                 [0-3]
 * @return {Array<number>}       [0-3]
 */
function changeFacing(tiles, sgn) {
	// console.log(sgn);
	let newTiles = cloneArray(tiles)
	if (sgn==0) {
		return newTiles;
	} else if(sgn==1) {
		newTiles = newTiles.map((tile) => [-tile[1],tile[0]])
		return newTiles;
	} else if(sgn==2) {
		newTiles = newTiles.map((tile) => [-tile[0],-tile[1]])
		return newTiles;
	} else {
		newTiles = newTiles.map((tile) => [tile[1],-tile[0]])
		return newTiles;
	}
}


function superRotation(spinDirection, callback) {
	let i=0;
	moveSRS(spinDirection,i,function (b) {
		if (b) isJustNowSpin = i;
		callback(b)
	})
}

function moveSRS(spinDirection,i,callback) {
	let dx = 0;
	let dy = 0;
	if (i!=0) {
		let differ = spinRule[currentMinoType][currentMinoFacing][spinDirection][i-1];
		dx = differ[0];
		dy = differ[1];
	}
	// console.log(dx,dy);
	let sgn = (spinDirection==0)?1:3;
	operate(dx,dy,sgn,function(b){
		if (!b) {
			if(spinRule[currentMinoType][currentMinoFacing][spinDirection][i]) {
				moveSRS(spinDirection,++i,callback)
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
