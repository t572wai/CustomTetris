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
	displayMainMenu()
	clearField()
	clearScoreArea()
	clearHoldArea()
	clearNextArea()
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

function displayField() {
	let fieldText = "";

	for (var i = 1; i < 22; i++) {
		for (var j = 0; j < 10; j++) {
			fieldText += "<div class='minos' data-x='"+j+"' data-y='"+i+"'></div>"
		}
	}

	$('#field').html(fieldText);
}

function clearField() {
	resetField();
	displayAllMinos();
}

function displayAllMinos() {
	console.log(fieldArray);
	for (var i = 1; i < 22; i++) {
		for (var j = 0; j < 10; j++) {
			$('.minos[data-x="'+j+'"][data-y="'+i+'"]').attr('class','minos '+fieldArray[i][j]["string"]+"Minos");
		}
	}
}

function displayDiffer(differs,callback) {
	for (var tile of differs) {
		displayTile(tile)
		updateFieldArray(tile)
	}

	callback()
}

function displayGhostTiles() {
	for (let tile of ghostTiles) {
		displayGhostTile(tile)
	}
}
function removeGhostTiles() {
	const formerGhost = cloneArray(ghostTiles)
	for (let tile of formerGhost) {
		removeGhostTile(tile)
	}
}

function displayTile(tile) {
	$('.minos[data-x="'+tile[0]+'"][data-y="'+tile[1]+'"]').attr('class','minos '+tile[2]["string"]+"Minos");
}
function displayGhostTile(tile) {
	if (tile[1]<2) {
		return ;
	}
	let ghostText = "<div class='ghostMinos "+tile[2]["string"]+"GhostMinos'></div>"
	$('.minos[data-x="'+tile[0]+'"][data-y="'+tile[1]+'"]').html(ghostText);
}
function removeGhostTile(tile) {
	$('.minos[data-x="'+tile[0]+'"][data-y="'+tile[1]+'"]').html("");
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
	if (!type) {
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
