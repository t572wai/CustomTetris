const TouchScreenQuery = matchMedia('pointer: coarse');
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

function hideAll() {
	$('#gameArea').css('display', 'none');
	$('#mainMenuArea').css('display', 'none');
	$('#keyBindingsArea').css('display', 'none');
}

function toMainMenu(): void {
	displayMainMenu();
	clearField();
	clearScoreArea();
	clearHoldArea();
	clearNextArea();
	clearHoldQueue();
	clearNextQueue();
	hideAll();
	$('#mainMenuArea').css('display','block');
}
function toGame() {
	hideAll();
	$('#gameArea').css('display','grid');
}
function toKeyBindings() {
	hideAll();
	$('#keyBindingsArea').css('display','block');
	displayKeyBindings()
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
	let text = '';
	text += '<button id="toKeyBindings">操作設定</button>'
	text += `
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

function displayKeyBindings() {
	$('#keyBindingsArea').html(textOfFromKeyToMainMenu());
	if (TouchScreenQuery.matches) {
		$('#keyBindingsArea').append(textOfKeyBindingsForTouch());
	} else {
		$('#keyBindingsArea').append(textOfKeyBindingsForPC());
	}
}

function textOfFromKeyToMainMenu(): string {
	return '<button id="fromKeyToMainMenu">メインメニュー</button>';
}

function textOfKeyBindingsForTouch(): string {
	return '';
}

function textOfKeyBindingsForPC(): string {
	let text = '';
	text += `
		<table border='1'>
			<tr>
				<th>操作</th>
				<th>キー</th>
			</tr>
			<tr>
				<td>右移動</td>
				<td>
					<p class='keyForAny' id='keyForRight'>
						d
					</p>
				</td>
			</tr>
			<tr>
				<td>ソフトドロップ</td>
				<td>
					<p class='keyForAny' id='keyForSoftDrop'>
						s
					</p>
				</td>
			</tr>
			<tr>
				<td>ハードドロップ</td>
				<td>
					<p class='keyForAny' id='keyForHardDrop'>
						w
					</p>
				</td>
			</tr>
			<tr>
				<td>左回転</td>
				<td>
					<p class='keyForAny' id='keyForLeftRotation'>
						ArrowLeft
					</p>
				</td>
			</tr>
			<tr>
				<td>右回転</td>
				<td>
					<p class='keyForAny' id='keyForRightRotation'>
						ArrowRight
					</p>
				</td>
			</tr>
			<tr>
				<td>ホールド</td>
				<td>
					<p class='keyForAny' id='keyForHold'>
						Shift
					</p>
				</td>
			</tr>
		</table>
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

	forEachMinoOnMatrix((pos) => {
			matrixText += "<div class='minos' data-x='"+pos.x+"' data-y='"+pos.y+"'></div>"
	})

	$('#field').html(matrixText);
}

function clearField(): void {
	resetField();
	displayAllMinos();
}

function displayAllMinos(): void {
	console.log(fieldArray);
	forEachMinoOnMatrix((pos) => {
			$('.minos[data-x="'+pos.x+'"][data-y="'+pos.y+'"]').attr('class','minos '+fieldArray[pos.y][pos.x]+"Minos");
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
	$('.minos[data-x="'+mino.x+'"][data-y="'+mino.y+'"]').attr('class','minos '+mino.mino+"Minos");
}

function displayGhostMino(mino: Mino): void {
	if (mino.y< bufferHeight) {
		return ;
	}
	let ghostText = "<div class='ghostMinos "+mino.mino+"GhostMinos'></div>"
	$('.minos[data-x="'+mino.x+'"][data-y="'+mino.y+'"]').html(ghostText);
}

function removeGhostMino(mino: Mino | Pos): void {
	$('.minos[data-x="'+mino.x+'"][data-y="'+mino.y+'"]').html("");
}

function displayNext(): void {
	$('#nextArea').html(textOfNext())
}

function textOfNext(): string {
	let text = "<p id='nextHead'>Next</p>";
	for (let i = 0; i < NumOfNext; i++) {
		if(typeof followingMinos[i] !== 'undefined') {
			text += textOfMinoAlone(followingMinos[i] as Tetrimino);
		}
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

	const shape = ShapesOfTetrimino.get(type);
	if (typeof shape !== 'undefined') {
		const shape_defined = shape as number[][];
		for (let line of shape_defined) {
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
