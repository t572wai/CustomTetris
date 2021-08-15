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
	while(typeof followingMinos[0] === 'undefined'){
		followingMinos.shift()
	}
	initMino(followingMinos[0]);
	followingMinos.shift()
	displayHold()
	displayNext()
	displayScoreArea()
	currentMinoLockedDownCallback = function (ind: number) {
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

function isGameOver(indicator: number): boolean {
	// console.log(indicator);
	return isLockOut(indicator);
}

function isLockOut(indicator: number): boolean {
	return indicator<bufferHeight;
}

function withGameOver(indicator: number, gameoverCb: ()=>void, continueCb: ()=>void): void {
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
	const nextArrayWithNumber = shuffle<number>([0,1,2,3,4,5,6]);
	const nextArray = nextArrayWithNumber.map((i) => {
		const tetriminoTemp = TetriminosFromNum.get(i);
		if(typeof tetriminoTemp !== 'undefined'){
			return tetriminoTemp as Tetrimino;
		}
	})
	followingMinos = followingMinos.concat(nextArray);
}

function updateMatrixArray(mino: Mino) {
	//console.log(tile,fieldArray[tile[1]]);
	fieldArray[mino.y][mino.x] = mino.mino;
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

function isScoring(str: Action) {
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

function addScore(actionStr: Action,rate=1) {
	const action = ScoreOfAction.get(actionStr);
	if (typeof action !== 'undefined') {
		score += action*rate;
		if (isScoring(actionStr)) {
			const scoringTemp = scoring.get(actionStr);
			if (typeof scoringTemp !== 'undefined') {
				scoring.set(actionStr,scoringTemp+1);
			}
		}
		scoring.set('score', score);
		displayScoreArea()
	}
}

function checkLine(callback: ()=>void) {
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


function checkAction(currentNumOfClearedLine: number): Action {
	switch (currentNumOfClearedLine) {
		case 1:
			switch(isTSpin()) {
				case 0:
					return 'tspin_single';
				case 1:
					return 'mini_tspin_single';
				default:
					return 'single';
			}
		case 2:
			return (isTSpin()==0)?'tspin_double':'double';
		case 3:
			return (isTSpin()==0)?'tspin_triple':'triple';
		case 4:
			return 'tetris';
		default:
			switch(isTSpin()) {
				case 0:
					return 'tspin';
				case 1:
					return 'mini_tspin';
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

function afterAction(type: Action) {
	// console.log(type);
	addScore(type,currentLevel)
}

function clearLine(i: number) {
	for (var j = i-1; j >= 0; j--) {
		fieldArray[j+1] = cloneArray(fieldArray[j]);
	}
	const generateRegularlyTerrainFn = generateRegularlyTerrain.get(currentGameRule);
	if (typeof generateRegularlyTerrainFn !== 'undefined') {
		fieldArray[0] = generateRegularlyTerrainFn();
	}
	totalClearedLine++;
}

function isLineFilled(array: Tetrimino[]) {
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
function forEachMinoOnMatrix(fn: (p:Pos)=>void) {
	for (let i = bufferHeight-1; i < fieldHeight; i++) {
		for (let j = 0; j < fieldWidth; j++) {
			fn({x:j,y:i})
		}
	}
}

/**
 *
 * @param {function} fn [fn(x,y)]
 */
function forEachMinoOnField(fn: (p:Pos)=>void) {
	for (let i = 0; i < fieldHeight; i++) {
		for (let j = 0; j < fieldWidth; j++) {
			fn({x:j,y:i})
		}
	}
}
