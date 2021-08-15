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

function toMainMenu(): void {
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

function displayMainMenu(): void {
	displayStartButton();
	displayOptions();
}

function displayStartButton(): void {
	$('#startButtonArea').html(textOfStartButton());
}

function displayOptions(): void {
	$('#optionsArea').html(textOfOptions());
}

function textOfStartButton(): string {
	return	'<button id="startButton">ゲームスタート</button>'
}

function textOfOptions(): string {
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

function displayMatrix(): void {
	let matrixText = "";

	forEachMinoOnMatrix((x,y) => {
			matrixText += "<div class='minos' data-x='"+x+"' data-y='"+y+"'></div>"
	})

	$('#field').html(matrixText);
}

function clearField(): void {
	resetField();
	displayAllMinos();
}

function displayAllMinos(): void {
	console.log(fieldArray);
	forEachMinoOnMatrix((x,y) => {
			$('.minos[data-x="'+x+'"][data-y="'+y+'"]').attr('class','minos '+fieldArray[y][x]+"Minos");
	})
}

function displayDiffer(differs: Mino[],callback: ()=>void): void {
	for (var mino of differs) {
		displayMino(mino)
		updateMatrixArray(mino)
	}

	callback()
}

function displayDifferWithDelay(differs: Mino[],callback: ()=>void) {
	let differsTemp = cloneArray(differs)

	clearTimer('fall')
	setTimer('fall',displayDiffer.bind(null,differsTemp,callback),currentFallingSpeed(currentLevel))
}

function displayGhostMinos(): void {
	for (let tile of ghostMinos) {
		displayGhostMino(tile)
	}
}

function removeGhostMinos(): void {
	const formerGhost = cloneArray<Mino>(ghostMinos)
	for (let tile of formerGhost) {
		removeGhostMino(tile)
	}
}

function displayMino(mino: Mino): void {
	$('.minos[data-x="'+mino[0]+'"][data-y="'+mino[1]+'"]').attr('class','minos '+mino[2]+"Minos");
}

function displayGhostMino(mino: Mino): void {
	if (mino[1]< bufferHeight) {
		return ;
	}
	let ghostText = "<div class='ghostMinos "+mino[2]+"GhostMinos'></div>"
	$('.minos[data-x="'+mino[0]+'"][data-y="'+mino[1]+'"]').html(ghostText);
}

function removeGhostMino(mino: Mino | Pos): void {
	$('.minos[data-x="'+mino[0]+'"][data-y="'+mino[1]+'"]').html("");
}

function displayNext(): void {
	$('#nextArea').html(textOfNext())
}

function textOfNext(): string {
	let text = "<p id='nextHead'>Next</p>";
	for (let i = 0; i < NumOfNext; i++) {
		text += textOfMinoAlone(followingMinos[i])
	}
	return text;
}

function displayHold(): void {
	$('#holdArea').html(textOfHold())
}

function textOfHold(): string {
	let text = "<p id='holdHead'>hold</p>"+textOfMinoAlone(holdMinoType);
	return text;
}

function textOfMinoAlone(type: Tetrimino): string {
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

function displayScoreArea(): void {
	$('#scoreArea').html(textOfScoreArea())
}

function textOfScoreArea(): string {
	let text = ''
	scoring.forEach((val,key) => {
		text += DisplayTitleOfAction.get(key)+":"+scoring.get(key)+"<br>"
	})
	return text;
}

function clearHoldArea():void {
	$('#holdArea').html('')
}

function clearNextArea(): void {
	$('#nextArea').html('')
}

function clearScoreArea(): void {
	$('#scoreArea').html('')
}
