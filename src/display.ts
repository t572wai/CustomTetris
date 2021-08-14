/**
 * [fieldArray description]
 * @type {Array} fieldArray[y][x]=TetriminoEnum
 */
let fieldArray:Tetrimino[][] = [];

/**
 * scoreに表示する値
 * @type {Object}
 */
//let scoring = {};
let scoring = new Map<string, number>();
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
	$('#gameArea').css('display','none');
	$('#mainMenuArea').css('display','block');
}
function toGame() {
	$('#gameArea').css('display','grid');
	$('#mainMenuArea').css('display','none');
}

function displayMainMenu() {
	displayStartButton();
	displayOptions();
}

function displayStartButton() {
	$('#startButtonArea').html(textOfStartButton());
}

function displayOptions() {
	$('#optionsArea').html(textOfOptions());
}

function textOfStartButton() {
	return	'<button id="startButton">ゲームスタート</button>'
}

function textOfOptions() {
	let text = `
						<div class="radio optionRadio">
							<div class="radio">
								<input type="radio" name="gameRule" value="normal" id="gameRuleRadio-normal" checked>
								<label for="gameRuleRadio-normal" class="radio-label">Normal</label>
							</div>
							<div class="radio">
								<input type="radio" name="gameRule" value="practiceFor4ren" id="gameRuleRadio-practiceFor4ren">
								<label for="gameRuleRadio-practiceFor4ren" class="radio-label">4REN</label>
							</div>
						</div>
						`
	return text;
}

//
//
// フィールド
//
//

function displayMatrix() {
	let matrixText = "";

	forEachMinoOnMatrix((x,y) => {
			matrixText += "<div class='minos' data-x='"+x+"' data-y='"+y+"'></div>"
	})

	$('#field').html(matrixText);
}

function clearField() {
	resetField();
	displayAllMinos();
}

function displayAllMinos() {
	console.log(fieldArray);
	forEachMinoOnMatrix((x,y) => {
			$('.minos[data-x="'+x+'"][data-y="'+y+'"]').attr('class','minos '+fieldArray[y][x]+"Minos");
	})
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
	$('.minos[data-x="'+tile[0]+'"][data-y="'+tile[1]+'"]').attr('class','minos '+tile[2]+"Minos");
}

function displayGhostMino(mino) {
	if (mino[1]<2) {
		return ;
	}
	let ghostText = "<div class='ghostMinos "+mino[2]+"GhostMinos'></div>"
	$('.minos[data-x="'+mino[0]+'"][data-y="'+mino[1]+'"]').html(ghostText);
}

function removeGhostMino(mino) {
	$('.minos[data-x="'+mino[0]+'"][data-y="'+mino[1]+'"]').html("");
}

function displayDifferWithDelay(differs,callback) {
	let differsTemp = cloneArray(differs)

	clearTimer('fall')
	setTimer('fall',displayDiffer.bind(null,differsTemp,callback),currentFallingSpeed(currentLevel))
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

	for (let line of ShapesOfTetrimino.get(type)) {
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
	scoring.forEach((val,key) => {
		text += DisplayTitleOfAction.get(key)+":"+scoring.get(key)+"<br>"
	})
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
