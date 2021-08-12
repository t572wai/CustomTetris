/**
 * [fieldArray description]
 * @type {Array} fieldArray[y][x]=TetriminoEnum
 */
let fieldArray = [];

/**
 * scoreに表示する値
 * @type {Object}
 */
let scoring = {};

//
//
//	メインメニュー
//
//

function toMainMenu() {
	displayMainMenu();
	clearField();
	clearScoreArea();
	clearHoldArea();
	clearNextArea();
	clearHoldQueue();
	clearNextQueue();
}

function displayMainMenu() {
	let mainMenuText = ''
	mainMenuText += textOfStartButton()
	mainMenuText += textOfOptions()
	$('#field').html(mainMenuText)
}

function textOfStartButton() {
	return	'<button id="startButton">ゲームスタート</button>'
}

function textOfOptions() {
	let text = '<p class="optionRadio">'
						+'<input name="gameRule" type="radio" value="normal" checked>Normal'
						+'<input name="gameRule" type="radio" value="practiceFor4ren">4REN'
						+'</p>'
	return text;
}

//
//
// フィールド
//
//

function displayMatrix() {
	let matrixText = "";

	for (var i = bufferHeight-1; i < fieldHeight; i++) {
		for (var j = 0; j < fieldWidth; j++) {
			matrixText += "<div class='minos' data-x='"+j+"' data-y='"+i+"'></div>"
		}
	}

	$('#field').html(matrixText);
}

function clearField() {
	resetField();
	displayAllMinos();
}

function displayAllMinos() {
	console.log(fieldArray);
	for (var i = bufferHeight-1; i < fieldHeight; i++) {
		for (var j = 0; j < fieldWidth; j++) {
			$('.minos[data-x="'+j+'"][data-y="'+i+'"]').attr('class','minos '+fieldArray[i][j]["string"]+"Minos");
		}
	}
}

function displayDiffer(differs,callback) {
	for (var tile of differs) {
		displayMino(tile)
		updateMatrixArray(tile)
	}

	callback()
}

function displayGhostMinos() {
	for (let tile of ghostMinos) {
		displayGhostMino(tile)
	}
}
function removeGhostMinos() {
	const formerGhost = cloneArray(ghostMinos)
	for (let tile of formerGhost) {
		removeGhostMino(tile)
	}
}

function displayMino(tile) {
	$('.minos[data-x="'+tile[0]+'"][data-y="'+tile[1]+'"]').attr('class','minos '+tile[2]["string"]+"Minos");
}
function displayGhostMino(mino) {
	if (mino[1]<2) {
		return ;
	}
	let ghostText = "<div class='ghostMinos "+mino[2]["string"]+"GhostMinos'></div>"
	$('.minos[data-x="'+mino[0]+'"][data-y="'+mino[1]+'"]').html(ghostText);
}
function removeGhostMino(mino) {
	$('.minos[data-x="'+mino[0]+'"][data-y="'+mino[1]+'"]').html("");
}

function displayDifferWithDelay(differs,callback) {
	differsTemp = cloneArray(differs)

	clearTimeout(fallTimer)
	fallTimer = setTimeout(displayDiffer.bind(null,differsTemp,callback),currentFallingSpeed(currentLevel))
}

function displayNext() {
	$('#nextArea').html(textOfNext())
}

function textOfNext() {
	let text = "<p id='nextHead'>Next</p>";
	for (let i = 0; i < NumOfNext; i++) {
		text += textOfMinoAlone(followingMinos[i])
	}
	return text;
}

function displayHold() {
	$('#holdArea').html(textOfHold())
}

function textOfHold() {
	let text = "<p id='holdHead'>hold</p>"+textOfMinoAlone(holdMinoType);
	return text;
}

function textOfMinoAlone(type) {
	// console.log(type);
	let text = "<div class='displayers'>";
	if (!type || type=='empty') {
		for (var i = 0; i < 8; i++) {
			text += '<div class="minos emptyMinos"></div>'
		}
		text + '</div>'
		return text;
	}

	for (let line of ShapesOfTetriminoEnum.getByValue('string',type).shape) {
		if (type != 'i') {
			if (type == 'o') {
				text += '<div class="minos emptyMinos"></div>'
				text += '<div class="minos emptyMinos"></div>'
			} else {
				text += '<div class="minos emptyMinos"></div>'
			}
		}
		for (let tile of line) {
			if (tile==-1) {
				text += '<div class="minos emptyMinos"></div>'
			} else {
				text += '<div class="minos '+type+'Minos"></div>'
			}
		}
	}
	if (type=='i') {
		text += '<div class="minos emptyMinos"></div><div class="minos emptyMinos"></div><div class="minos emptyMinos"></div><div class="minos emptyMinos"></div>'
	}
	text += '</div>'
	return text;
}

function displayScoreArea() {
	$('#scoreArea').html(textOfScoreArea())
}

function textOfScoreArea() {
	let text = ''
	for (let action in scoring) {
		if (action=='score') {
			text += 'score:'+scoring['score']+'<br>'
		} else if(action=='REN') {
			text += 'REN:'+scoring['ren']+'<br>'
		} else {
			text += ActionsEnum.getByValue('string',action).displayTitle+':'+scoring[action]+'<br>'
		}
	}
	return text;
}

function clearHoldArea() {
	$('#holdArea').html('')
}

function clearNextArea() {
	$('#nextArea').html('')
}

function clearScoreArea() {
	$('#scoreArea').html('')
}
