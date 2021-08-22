//
//
// const
//
//

const TetriminoUnion = ['i','o','s','z','j','l','t','empty','wall'] as const;
type Tetrimino = typeof TetriminoUnion[number];

const TetriminosFromNum = new Map<Number,Tetrimino>();
TetriminosFromNum.set(-2,"wall");
TetriminosFromNum.set(-1,"empty");
TetriminosFromNum.set(0,"i");
TetriminosFromNum.set(1,"o");
TetriminosFromNum.set(2,"s");
TetriminosFromNum.set(3,"z");
TetriminosFromNum.set(4,"j");
TetriminosFromNum.set(5,"l");
TetriminosFromNum.set(6,"t");

type Pos = {
	x: number,
	y: number,
}

type Mino = {
	x: number,
	y: number,
	mino: Tetrimino,
}


function FallingSpeed(level: number): number {
	return 1000*(0.8 - ((level-1) * 0.007))**(level-1);
}

const ShapesOfTetrimino = new Map<Tetrimino,number[][]>();
ShapesOfTetrimino.set("i", [[1,0,1,1]]);
ShapesOfTetrimino.set("o", [[1,1],[0,1]])
ShapesOfTetrimino.set("s", [[-1,1,1],[1,0,-1]])
ShapesOfTetrimino.set("z", [[1,1,-1],[-1,0,1]])
ShapesOfTetrimino.set("j", [[1,-1,-1],[1,0,1]])
ShapesOfTetrimino.set("l", [[-1,-1,1],[1,0,1]])
ShapesOfTetrimino.set("t", [[-1,1,-1],[1,0,1]])

const NumOfNext = 6;

const Actions = ['none','single','double','triple','tetris','mini_tspin','mini_tspin_single','tspin','tspin_single','tspin_double','tspin_triple','back_to_back','softDrop','hardDrop','ren','singlePerfectClear','doublePerfectClear','triplePerfectClear','tetrisPerfectClear','tetrisBtoBPerfectClear'] as const;
type Action = typeof Actions[number];

const ScoreOfAction = new Map<Action, number>();
ScoreOfAction.set("none", 0);
ScoreOfAction.set("single", 100);
ScoreOfAction.set("double", 300);
ScoreOfAction.set("triple", 500);
ScoreOfAction.set("tetris", 800);
ScoreOfAction.set("mini_tspin", 100);
ScoreOfAction.set("mini_tspin_single", 200);
ScoreOfAction.set("tspin", 400);
ScoreOfAction.set("tspin_single", 800);
ScoreOfAction.set("tspin_double", 1200);
ScoreOfAction.set("tspin_triple", 1600);
ScoreOfAction.set("back_to_back", 1.5);
ScoreOfAction.set("softDrop", 1);
ScoreOfAction.set("hardDrop", 2);
ScoreOfAction.set("ren", 50);
ScoreOfAction.set("singlePerfectClear", 800);
ScoreOfAction.set("doublePerfectClear", 1200);
ScoreOfAction.set("triplePerfectClear", 1800);
ScoreOfAction.set("tetrisPerfectClear", 2000);
ScoreOfAction.set("tetrisBtoBPerfectClear", 3200);

const DisplayTitleOfAction = new Map<String, String>();
DisplayTitleOfAction.set("none", '');
DisplayTitleOfAction.set("single", 'Single');
DisplayTitleOfAction.set("double", 'Double');
DisplayTitleOfAction.set("triple", 'Triple');
DisplayTitleOfAction.set("tetris", 'Tetris');
DisplayTitleOfAction.set("mini_tspin", '');
DisplayTitleOfAction.set("mini_tspin_single", 'Mini T-spin Single');
DisplayTitleOfAction.set("tspin", '');
DisplayTitleOfAction.set("tspin_single", 'T-spin Single');
DisplayTitleOfAction.set("tspin_double", 'T-spin Double');
DisplayTitleOfAction.set("tspin_triple", 'T-spin Triple');
DisplayTitleOfAction.set("back_to_back", '');
DisplayTitleOfAction.set("softDrop", '');
DisplayTitleOfAction.set("hardDrop", '');
DisplayTitleOfAction.set("ren", '');
DisplayTitleOfAction.set("score", 'score');
DisplayTitleOfAction.set("ren", 'REN');
DisplayTitleOfAction.set("perfectClear", "perfectClear");

const ActionsEnum = [];

/**
 * scoreに表示しないaction
 * @type {Array}
 */
const notScorings:Action[] = ['hardDrop','softDrop','back_to_back','mini_tspin','tspin','none','ren','singlePerfectClear','doublePerfectClear','triplePerfectClear','tetrisPerfectClear','tetrisBtoBPerfectClear']

//const Direction = defineEnum({
//	Up: {
//		string: 'up',
//		value: 0
//	},
//	Right: {
//		string: 'right',
//		value: 1
//	},
//	Down: {
//		string: 'down',
//		value: 2
//	},
//	Left: {
//		string: 'left',
//		value: 3
//	}
//})

/**
 * SRSのとき、中心がどれだけ変わるかの値
 * @type {Object} spinRule[minoType][formerDirection][0:right,1:left][num]=[dx,dy]
 *
 */
const spinRule = new Map<Tetrimino,Pos[][][]>();
spinRule.set("i", [
	[
		[
			{x:-2,y:0},
			{x:1,y:0},
			{x:-2,y:1},
			{x:1,y:-2}
		],[
			{x:-1,y:0},
			{x:2,y:0},
			{x:-1,y:-2},
			{x:2,y:1}
		]
	],[
		[
			{x:-1,y:0},
			{x:2,y:0},
			{x:-1,y:-2},
			{x:2,y:1}
		],[
			{x:2,y:0},
			{x:-1,y:0},
			{x:2,y:-1},
			{x:-1,y:2}
		]
	],[
		[
			{x:2,y:0},
			{x:-1,y:0},
			{x:2,y:-1},
			{x:-1,y:2}
		],[
			{x:1,y:0},
			{x:-2,y:0},
			{x:1,y:2},
			{x:-2,y:-1}
		]
	],[
		[
			{x:-2,y:0},
			{x:1,y:0},
			{x:1,y:2},
			{x:-2,y:-1}
		],[
			{x:1,y:0},
			{x:-2,y:0},
			{x:-2,y:1},
			{x:1,y:-2}
		]
	]
])
spinRule.set("o", [
	[
		[//right
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
		],[//left
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
		]
	],[
		[
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
		],[
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
		]
	],[
		[
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
		],[
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
		]
	],[
		[
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
		],[
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
			{x:0,y:0},
		]
	]
])
spinRule.set('l', [
	[
		[//right
			{x:-1,y:0},
			{x:-1,y:-1},
			{x:0,y:2},
			{x:-1,y:2}
		],[//left
			{x:1,y:0},
			{x:1,y:-1},
			{x:0,y:2},
			{x:1,y:2}
		]
	],[
		[
			{x:1,y:0},
			{x:1,y:1},
			{x:0,y:-2},
			{x:1,y:-2}
		],[
			{x:1,y:0},
			{x:1,y:1},
			{x:0,y:-2},
			{x:1,y:-2}
		]
	],[
		[
			{x:1,y:0},
			{x:1,y:-1},
			{x:0,y:2},
			{x:1,y:2}
		],[
			{x:-1,y:0},
			{x:-1,y:-1},
			{x:0,y:2},
			{x:-1,y:2}
		]
	],[
		[
			{x:-1,y:0},
			{x:-1,y:1},
			{x:0,y:-2},
			{x:-1,y:-2}
		],[
			{x:-1,y:0},
			{x:-1,y:1},
			{x:0,y:-2},
			{x:-1,y:-2}
		]
	]
])
spinRule.set("j",[
	[
		[//right
			{x:-1,y:0},
			{x:-1,y:-1},
			{x:0,y:2},
			{x:-1,y:2}
		],[//left
			{x:1,y:0},
			{x:1,y:-1},
			{x:0,y:2},
			{x:1,y:2}
		]
	],[
		[
			{x:1,y:0},
			{x:1,y:1},
			{x:0,y:-2},
			{x:1,y:-2}
		],[
			{x:1,y:0},
			{x:1,y:1},
			{x:0,y:-2},
			{x:1,y:-2}
		]
	],[
		[
			{x:1,y:0},
			{x:1,y:-1},
			{x:0,y:2},
			{x:1,y:2}
		],[
			{x:-1,y:0},
			{x:-1,y:-1},
			{x:0,y:2},
			{x:-1,y:2}
		]
	],[
		[
			{x:-1,y:0},
			{x:-1,y:1},
			{x:0,y:-2},
			{x:-1,y:-2}
		],[
			{x:-1,y:0},
			{x:-1,y:1},
			{x:0,y:-2},
			{x:-1,y:-2}
		]
	]
])
spinRule.set("s",[
	[
		[//right
			{x:-1,y:0},
			{x:-1,y:-1},
			{x:0,y:2},
			{x:-1,y:2}
		],[//left
			{x:1,y:0},
			{x:1,y:-1},
			{x:0,y:2},
			{x:1,y:2}
		]
	],[
		[
			{x:1,y:0},
			{x:1,y:1},
			{x:0,y:-2},
			{x:1,y:-2}
		],[
			{x:1,y:0},
			{x:1,y:1},
			{x:0,y:-2},
			{x:1,y:-2}
		]
	],[
		[
			{x:1,y:0},
			{x:1,y:-1},
			{x:0,y:2},
			{x:1,y:2}
		],[
			{x:-1,y:0},
			{x:-1,y:-1},
			{x:0,y:2},
			{x:-1,y:2}
		]
	],[
		[
			{x:-1,y:0},
			{x:-1,y:1},
			{x:0,y:-2},
			{x:-1,y:-2}
		],[
			{x:-1,y:0},
			{x:-1,y:1},
			{x:0,y:-2},
			{x:-1,y:-2}
		]
	]
])
spinRule.set("z",[
	[
		[//right
			{x:-1,y:0},
			{x:-1,y:-1},
			{x:0,y:2},
			{x:-1,y:2}
		],[//left
			{x:1,y:0},
			{x:1,y:-1},
			{x:0,y:2},
			{x:1,y:2}
		]
	],[
		[
			{x:1,y:0},
			{x:1,y:1},
			{x:0,y:-2},
			{x:1,y:-2}
		],[
			{x:1,y:0},
			{x:1,y:1},
			{x:0,y:-2},
			{x:1,y:-2}
		]
	],[
		[
			{x:1,y:0},
			{x:1,y:-1},
			{x:0,y:2},
			{x:1,y:2}
		],[
			{x:-1,y:0},
			{x:-1,y:-1},
			{x:0,y:2},
			{x:-1,y:2}
		]
	],[
		[
			{x:-1,y:0},
			{x:-1,y:1},
			{x:0,y:-2},
			{x:-1,y:-2}
		],[
			{x:-1,y:0},
			{x:-1,y:1},
			{x:0,y:-2},
			{x:-1,y:-2}
		]
	]
])
spinRule.set("t",[
	[
		[//right
			{x:-1,y:0},
			{x:-1,y:-1},
			{x:0,y:2},
			{x:-1,y:2}
		],[//left
			{x:1,y:0},
			{x:1,y:-1},
			{x:0,y:2},
			{x:1,y:2}
		]
	],[
		[
			{x:1,y:0},
			{x:1,y:1},
			{x:0,y:-2},
			{x:1,y:-2}
		],[
			{x:1,y:0},
			{x:1,y:1},
			{x:0,y:-2},
			{x:1,y:-2}
		]
	],[
		[
			{x:1,y:0},
			{x:1,y:-1},
			{x:0,y:2},
			{x:1,y:2}
		],[
			{x:-1,y:0},
			{x:-1,y:-1},
			{x:0,y:2},
			{x:-1,y:2}
		]
	],[
		[
			{x:-1,y:0},
			{x:-1,y:1},
			{x:0,y:-2},
			{x:-1,y:-2}
		],[
			{x:-1,y:0},
			{x:-1,y:1},
			{x:0,y:-2},
			{x:-1,y:-2}
		]
	]
])

const matrixHeight: number = 20;
const matrixWidth: number = 10;

const bufferHeight: number = 2;
const bufferWidth:number = matrixWidth;

const fieldHeight: number = matrixHeight + bufferHeight;
const fieldWidth:number = matrixWidth;

//
//
// dialogs
//
//

function initDialogs(): void {
	$('.dialogs').each((i, obj) => {
		console.log(i,obj);
		$(obj).dialog({
			autoOpen: false,
			modal: false,
			title: 'dialog',
			buttons: { 'ok': function(){
					$(obj).dialog('close')
				}
			}
		})
	})
}

$(function () {
	$('#gameoverDialog').dialog({
		title: 'game over',
		buttons: {
			'restart': function () {
				startTetris();
				$(this).dialog('close');
			},
			'toMainMenu': function () {
				toMainMenu();
				$(this).dialog('close');
			}
		}
	})
})

//
//
// display
//
//

const TouchScreenQuery = window.matchMedia('(pointer: coarse)');
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
	gameRuleOption.displayRadioOption('#optionsArea');

	//$('input[name="gameRule"]').val([gameRuleOption.currentOption]);
}

function textOfStartButton(): string {
	return	'<button id="startButton">ゲームスタート</button>'
}

function textOfOptions(): string {
	let text = '';
	text += '<button id="toKeyBindings">操作設定</button>'
	text += '<div></div>';
	return text;
}

function displayKeyBindings() {
	$('#keyBindingsArea').html(textOfFromKeyToMainMenu());
	if (TouchScreenQuery.matches) {
		MethodOfOpForTouchOption.displayRadioOption('#keyBindingsArea')
		//$('#keyBindingsArea').append(textOfKeyBindingsForTouch());
	} else {
		$('#keyBindingsArea').append(textOfKeyBindingsForPC());

		for (const operation of Operations) {
			console.log(operation, keyBinding.get(operation));
			$('#keyFor'+toUpperFirstLetter(operation)).text(keyBinding.get(operation)!);
		}
	}
}

function textOfFromKeyToMainMenu(): string {
	return '<button id="fromKeyToMainMenu">メインメニュー</button>';
}

//function textOfKeyBindingsForTouch(): string {
//	let text = '';
//	text += `
//		<div class="optionRadio" id="methodOfOperationForTouchRadioContainer">
//			<div class="radio">
//				<input type="radio" name="methodOfOperationForTouch" value="swipe" id="methodForTouch-swipe" checked>
//				<label for="methodForTouch-swipe" class="radio-label">スワイプ</label>
//			</div>
//			<div class="radio">
//				<input type="radio" name="methodOfOperationForTouch" value="button" id="methodForTouch-button">
//				<label for="methodForTouch-button" class="radio-label">ボタン</label>
//			</div>
//		</div>
//	`
//	return text;
//}

function textOfKeyBindingsForPC(): string {
	let text = '';
	text += `
		<table border='1'>
			<tr>
				<th>操作</th>
				<th>キー</th>
			</tr>
			<tr>
				<td>左移動</td>
				<td>
					<p class='keyForAny' id='keyForLeft'>
						a
					</p>
				</td>
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

function displayButtonsToOperate(): void {
	$('#buttonsToOperateArea').html(textOfButtonsToOperate);
}
function hideButtonsToOperate(): void {
	$('#buttonsToOperateArea').html('');
}

function textOfButtonsToOperate(): string {
	let text = '';
	text += `
		<button class='buttonsToOperate' data-operate='left'></button>
		<button class='buttonsToOperate' data-operate='right'></button>
		<button class='buttonsToOperate' data-operate='softDrop'></button>
		<button class='buttonsToOperate' data-operate='hardDrop'></button>
		<button class='buttonsToOperate' data-operate='leftRotation'></button>
		<button class='buttonsToOperate' data-operate='rightRotation'></button>
		<button class='buttonsToOperate' data-operate='hold'>Hold</button>
	`;
	//text += `
	//	<button class='buttonsToOperate' data-operate='left'><img src='imgs/right.png'></button>
	//	<button class='buttonsToOperate' data-operate='right'><img src='imgs/right.png'></button>
	//	<button class='buttonsToOperate' data-operate='softDrop'><img src='imgs/right.png'></button>
	//	<button class='buttonsToOperate' data-operate='hardDrop'><img src='imgs/right-double.png'></button>
	//	<button class='buttonsToOperate' data-operate='leftRotation'><img src='imgs/leftRotation.png'></button>
	//	<button class='buttonsToOperate' data-operate='rightRotation'><img src='imgs/rightRotation.png'></button>
	//	<button class='buttonsToOperate' data-operate='hold'>Hold</button>
	//`;
	return text;
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
