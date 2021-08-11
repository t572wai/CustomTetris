function startTetris() {
	ion.sound.play("startSound",{volume:'0.4'})
	displayField()
	reset()
	startToAppearMinos()
	swiper = new Swiper(document, 70, 300, 50)
}

function startToAppearMinos() {
	console.log('start');
	checkGenerationOfTetriminos()
	initMino(followingMinos[0]);
	followingMinos.shift()
	displayHold()
	displayNext()
	displayScoreArea()
	// initMino(TetriminoEnum.getByValue('value',Math.floor( Math.random() * 7 )).string);
	currentMinoLockedDownCallback = function (ind) {
		console.log(ind);
		withGameOver(ind,function () {
			// alert('game over')
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
	return indicator<2;
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
	followingMinos = followingMinos.concat(shuffle([0,1,2,3,4,5,6]).map((i) => TetriminoEnum.getByValue('value',i).string))
}

function updateFieldArray(tile) {
	fieldArray[tile[1]][tile[0]] = tile[2]
}

function reset() {
	score = 0;
	totalClearedLine = 0;

	clearField();
	resetBag();
	resetScoringArray();
}

function hold() {
	if (!currentMinoDidLockDown && canHold) {
		canHold = false;
		if (holdMinoType) {
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
	scoring['score'] = 0;
	ActionsEnum.forEach((item) => {
		if (isScoring(item.string)) {
			scoring[item.string] = 0;
		}
	});
}

function addScore(actionStr,rate=1) {
	score += ActionsEnum.getByValue('string',actionStr).score*rate;
	if (isScoring(actionStr)) {
		scoring[actionStr]++;
	}
	scoring['score'] = score;
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

	let indicatorArray = getFilledTilesAroundT_normalized()
	console.log(indicatorArray,indicatorArray.includesArray([-1,-1]) && indicatorArray.includesArray([1,-1]));

	if (isJustNowSpin==5) {
		return 0;
	}

	if (indicatorArray.length<3) {
		return -1;
	} else if (indicatorArray.includesArray([-1,-1]) && indicatorArray.includesArray([1,-1])) {
		return 0;
	} else {
		console.log(indicatorArray);
		return 1;
	}
}

function getFilledTilesAroundT() {
	let tiles = []

	if (isFilledOrWall(currentMinoX-1,currentMinoY-1)) tiles.push([-1,-1])
	if (isFilledOrWall(currentMinoX-1,currentMinoY+1)) tiles.push([-1,1])
	if (isFilledOrWall(currentMinoX+1,currentMinoY-1)) tiles.push([1,-1])
	if (isFilledOrWall(currentMinoX+1,currentMinoY+1)) tiles.push([1,1])

	console.log(tiles);
	return tiles;
}

function getFilledTilesAroundT_normalized() {
	return changeDirection(getFilledTilesAroundT(),currentMinoD)
}

function afterAction(type) {
	// console.log(type);
	addScore(type,currentLevel)
}

function clearLine(i) {
	for (var j = i-1; j >= 0; j--) {
		fieldArray[j+1] = cloneArray(fieldArray[j]);
	}
	totalClearedLine++;
}

function isLineFilled(array) {
	return  !array.find((e) => e.string == "empty");
}

function endTetris() {
	console.log('end tetris');
	isPlayingTetris = false;
	swiper.destructor()
}
