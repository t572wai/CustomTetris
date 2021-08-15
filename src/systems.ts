function startTetris() {
	//ion.sound.play("startSound",{volume:'0.4'})
	displayMatrix()
	reset()
	startToAppearMinos()
	swiper = new Swiper(document, 70, 300, 50)
}

function initTetris() {
	const value = $('input[name=gameRule]:checked').val();
	if (typeof value == 'string') {
		const value_str:string = value;
		const gameRuleFromGameRuleInput = toGameRule(value_str);
		if (gameRuleFromGameRuleInput) {
			currentGameRule = gameRuleFromGameRuleInput;
		} else {
			currentGameRule = 'normal';
		}
	}
	toGame()
}


function startToAppearMinos() {
	console.log('start');
	checkGenerationOfTetriminos()
	console.log(followingMinos);
	initMino(followingMinos[0]);
	followingMinos.shift()
	displayHold()
	displayNext()
	displayScoreArea()
	currentMinoLockedDownCallback = function (ind) {
		console.log(ind);
		withGameOver(ind,function () {
			endTetris()
			$('#gameoverDialog').dialog('open')
		},function () {
			canHold = true;
			startToAppearMinos()
		})
	}
	startFall()
}

function isGameOver(indicator) {
	// console.log(indicator);
	return isLockOut(indicator);
}

function isLockOut(indicator) {
	return indicator<bufferHeight;
}

function withGameOver(indicator,gameoverCb,continueCb) {
	if (isGameOver(indicator)) {
		gameoverCb()
	} else {
		continueCb()
	}
}

function checkGenerationOfTetriminos() {
	if (followingMinos.length < NumOfNext+1) {
		generateTetriminos()
	}
}

function generateTetriminos() {
	//ミノをランダムにソート
	followingMinos = followingMinos.concat(shuffle([0,1,2,3,4,5,6]).map((i) => TetriminosFromNum.get(i)))
}

function updateMatrixArray(tile) {
	//console.log(tile,fieldArray[tile[1]]);
	fieldArray[tile[1]][tile[0]] = tile[2]
}

function reset() {
	score = 0;
	totalClearedLine = 0;

	clearHoldQueue();
	clearNextQueue();
	displayHold();
	clearField();
	resetBag();
	resetScoringArray();
	displayScoreArea();
}

function hold() {
	if (!currentMinoDidLockDown && canHold) {
		canHold = false;
		if (holdMinoType && holdMinoType != 'empty') {
			// console.log(holdMinoType);
			let minoTypeTemp = holdMinoType;
			holdMinoType = currentMinoType;
			followingMinos.unshift(minoTypeTemp)
		} else {
			holdMinoType = currentMinoType;
		}
		hideCurrentMino(function () {
			clearTimer('fall')
			clearTimeout(currentMinoLockDownTimer)
			startToAppearMinos()
		})
	}
}

function resetBag() {
	canHold = true;
}

function isScoring(str) {
	return !notScorings.includes(str);
}

function resetScoringArray() {
	scoring.set('score', 0);
	scoring.set('ren', 0);
	Actions.forEach(item => {
		if (isScoring(item)) {
			scoring.set(item, 0);
		}
	});
}

function addScore(actionStr,rate=1) {
	score += ScoreOfAction.get(actionStr)*rate;
	if (isScoring(actionStr)) {
		scoring.set(actionStr,scoring.get(actionStr)+1);
	}
	scoring.set('score', score);
	displayScoreArea()
}

function checkLine(callback) {
	let didClear = false;
	let linesToClear = [];
	for (var i = 0; i < fieldArray.length; i++) {
		if (isLineFilled(fieldArray[i])) {
			linesToClear.push(i)
			didClear = true;
		}
	}
	const numOfClearedLine = linesToClear.length;
	if (numOfClearedLine > 0) {
		currentREN++;
		if (currentREN>0) {
			addScore('ren', currentREN*currentLevel)
		}
	} else {
		currentREN = -1;
	}
	scoring.set('ren' ,(currentREN>0)?currentREN:0);
	displayScoreArea();
	afterAction(checkAction(numOfClearedLine));
	for (let ind of linesToClear) {
		clearLine(ind)
	}
	if (didClear) {
		displayAllMinos()
	}
	callback()
}


function checkAction(currentNumOfClearedLine) {
	switch (currentNumOfClearedLine) {
		case 1:
			switch(isTSpin()) {
				case 0:
					return 't_single';
				case 1:
					return 'mini-t_single';
				default:
					return 'single';
			}
		case 2:
			return (isTSpin()==0)?'t_double':'double';
		case 3:
			return (isTSpin()==0)?'t_triple':'triple';
		case 4:
			return 'tetris';
		default:
			switch(isTSpin()) {
				case 0:
					return 'tspin';
				case 1:
					return 'mini-t';
				default:
					return 'none';
			}
	}
}

/**
 * @return {number} -1:normal 0:t-spin 1:mini t-spin
 */
function isTSpin() {
	if(currentMinoType!='t' || isJustNowSpin==-1) return -1;

	let indicatorArray:Pos[] = getFilledTilesAroundT_normalized()
	console.log(indicatorArray,includesArray<Pos>(indicatorArray,{x:-1,y:-1}) && includesArray<Pos>(indicatorArray,{x:1,y:-1}));

	if (isJustNowSpin==5) {
		return 0;
	}

	if (indicatorArray.length<3) {
		return -1;
	} else if (includesArray(indicatorArray,{x:-1,y:-1}) && includesArray(indicatorArray,{x:1,y:-1})) {
		return 0;
	} else {
		console.log(indicatorArray);
		return 1;
	}
}

function getFilledTilesAroundT(): Pos[] {
	let tiles:Pos[] = [];

	if (isFilledOrWall(currentMinoX-1,currentMinoY-1)) tiles.push({x:-1,y:-1})
	if (isFilledOrWall(currentMinoX-1,currentMinoY+1)) tiles.push({x:-1,y: 1})
	if (isFilledOrWall(currentMinoX+1,currentMinoY-1)) tiles.push({x: 1,y:-1})
	if (isFilledOrWall(currentMinoX+1,currentMinoY+1)) tiles.push({x: 1,y: 1})

	console.log(tiles);
	return tiles;
}

function getFilledTilesAroundT_normalized(): Pos[] {
	return changeFacing(getFilledTilesAroundT(),currentMinoFacing)
}

function afterAction(type) {
	// console.log(type);
	addScore(type,currentLevel)
}

function clearLine(i) {
	for (var j = i-1; j >= 0; j--) {
		fieldArray[j+1] = cloneArray(fieldArray[j]);
	}
	fieldArray[0] = generateRegularlyTerrain[currentGameRule]();
	totalClearedLine++;
}

function isLineFilled(array) {
	return  !array.find((e) => e == "empty");
}

function endTetris() {
	console.log('end tetris');
	isPlayingTetris = false;
	swiper.destructor()
}

function clearHoldQueue() {
	holdMinoType = 'empty';
}

function clearNextQueue() {
	followingMinos = [];
}

/**
 *
 * @param {function} fn [fn(x,y)]
 */
function forEachMinoOnMatrix(fn) {
	for (let i = bufferHeight-1; i < fieldHeight; i++) {
		for (let j = 0; j < fieldWidth; j++) {
			fn(j,i)
		}
	}
}

/**
 *
 * @param {function} fn [fn(x,y)]
 */
function forEachMinoOnField(fn) {
	for (let i = 0; i < fieldHeight; i++) {
		for (let j = 0; j < fieldWidth; j++) {
			fn(j,i)
		}
	}
}
