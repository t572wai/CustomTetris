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

interface Pos {
	x: Number,
	y: Number,
}

interface Mino {
	x: Number,
	y: Number,
	mino: Tetrimino,
}


function FallingSpeed(level) {
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

const Actions = ['none','single','double','triple','tetris','mini_tspin','mini_tspin_single','tspin','tspin_single','tspin_double','tspin_triple','back_to_back','softDrop','hardDrop','ren'] as const;
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

const ActionsEnum = [];
//const ActionsEnum = defineEnum({
//	none: {
//		string: 'none',
//		score: 0,
//		displayTitle: ''
//	},
//	single: {
//		string: 'single',
//		score: 100,
//		displayTitle: 'Single'
//	},
//	double: {
//		string: 'double',
//		score: 300,
//		displayTitle: 'Double'
//	},
//	triple: {
//		string: 'triple',
//		score: 500,
//		displayTitle: 'Triple'
//	},
//	tetris: {
//		string: 'tetris',
//		score: 800,
//		displayTitle: 'Tetris'
//	},
//	mini_tspin: {
//		string: 'mini-t',
//		score: 100,
//		displayTitle: ''
//	},
//	mini_tspin_single: {
//		string: 'mini-t_single',
//		score: 200,
//		displayTitle: 'Mini T-Spin Single'
//	},
//	tspin: {
//		string: 'tspin',
//		score: 400,
//		displayTitle: ''
//	},
//	tspin_single: {
//		string: 't_single',
//		score: 800,
//		displayTitle: 'T-Spin Single'
//	},
//	tspin_double: {
//		string: 't_double',
//		score: 1200,
//		displayTitle: 'T-Spin Double'
//	},
//	tspin_triple: {
//		string: 't_triple',
//		score: 1600,
//		displayTitle: 'T-Spin Triple'
//	},
//	back_to_back: {
//		string: 'btob',
//		score: 1.5,
//		displayTitle: ''
//	},
//	softDrop: {
//		string: 'softDrop',
//		score: 1,
//		displayTitle: ''
//	},
//	hardDrop: {
//		string: 'hardDrop',
//		score: 2,
//		displayTitle: ''
//	},
//	ren: {
//		string: 'ren',
//		score: 50,
//		displayTitle: ''
//	}
//})

/**
 * scoreに表示しないaction
 * @type {Array}
 */
const notScorings:Action[] = ['hardDrop','softDrop','back_to_back','mini_tspin','tspin','none','ren']

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
const spinRule = {
	i:{
		0:[
			[//right
				[-2,0],
				[1,0],
				[-2,1],
				[1,-2]
			],[//left
				[-1,0],
				[2,0],
				[-1,-2],
				[2,1]
			]
		],
		1:[
			[
				[-1,0],
				[2,0],
				[-1,-2],
				[2,1]
			],[
				[2,0],
				[-1,0],
				[2,-1],
				[-1,2]
			]
		],
		2:[
			[
				[2,0],
				[-1,0],
				[2,-1],
				[-1,2]
			],[
				[1,0],
				[-2,0],
				[1,2],
				[-2,-1]
			]
		],
		3:[
			[
				[-2,0],
				[1,0],
				[1,2],
				[-2,-1]
			],[
				[1,0],
				[-2,0],
				[-2,1],
				[1,-2]
			]
		]
	},
	o:{
		0:[
			[//right
			],[//left
			]
		],
		1:[
			[
			],[
			]
		],
		2:[
			[
			],[
			]
		],
		3:[
			[
			],[
			]
		]
	},
	l:{
		0:[
			[//right
				[-1,0],
				[-1,-1],
				[0,2],
				[-1,2]
			],[//left
				[1,0],
				[1,-1],
				[0,2],
				[1,2]
			]
		],
		1:[
			[
				[1,0],
				[1,1],
				[0,-2],
				[1,-2]
			],[
				[1,0],
				[1,1],
				[0,-2],
				[1,-2]
			]
		],
		2:[
			[
				[1,0],
				[1,-1],
				[0,2],
				[1,2]
			],[
				[-1,0],
				[-1,-1],
				[0,2],
				[-1,2]
			]
		],
		3:[
			[
				[-1,0],
				[-1,1],
				[0,-2],
				[-1,-2]
			],[
				[-1,0],
				[-1,1],
				[0,-2],
				[-1,-2]
			]
		]
	},
	j:{
		0:[
			[//right
				[-1,0],
				[-1,-1],
				[0,2],
				[-1,2]
			],[//left
				[1,0],
				[1,-1],
				[0,2],
				[1,2]
			]
		],
		1:[
			[
				[1,0],
				[1,1],
				[0,-2],
				[1,-2]
			],[
				[1,0],
				[1,1],
				[0,-2],
				[1,-2]
			]
		],
		2:[
			[
				[1,0],
				[1,-1],
				[0,2],
				[1,2]
			],[
				[-1,0],
				[-1,-1],
				[0,2],
				[-1,2]
			]
		],
		3:[
			[
				[-1,0],
				[-1,1],
				[0,-2],
				[-1,-2]
			],[
				[-1,0],
				[-1,1],
				[0,-2],
				[-1,-2]
			]
		]
	},
	s:{
		0:[
			[//right
				[-1,0],
				[-1,-1],
				[0,2],
				[-1,2]
			],[//left
				[1,0],
				[1,-1],
				[0,2],
				[1,2]
			]
		],
		1:[
			[
				[1,0],
				[1,1],
				[0,-2],
				[1,-2]
			],[
				[1,0],
				[1,1],
				[0,-2],
				[1,-2]
			]
		],
		2:[
			[
				[1,0],
				[1,-1],
				[0,2],
				[1,2]
			],[
				[-1,0],
				[-1,-1],
				[0,2],
				[-1,2]
			]
		],
		3:[
			[
				[-1,0],
				[-1,1],
				[0,-2],
				[-1,-2]
			],[
				[-1,0],
				[-1,1],
				[0,-2],
				[-1,-2]
			]
		]
	},
	z:{
		0:[
			[//right
				[-1,0],
				[-1,-1],
				[0,2],
				[-1,2]
			],[//left
				[1,0],
				[1,-1],
				[0,2],
				[1,2]
			]
		],
		1:[
			[
				[1,0],
				[1,1],
				[0,-2],
				[1,-2]
			],[
				[1,0],
				[1,1],
				[0,-2],
				[1,-2]
			]
		],
		2:[
			[
				[1,0],
				[1,-1],
				[0,2],
				[1,2]
			],[
				[-1,0],
				[-1,-1],
				[0,2],
				[-1,2]
			]
		],
		3:[
			[
				[-1,0],
				[-1,1],
				[0,-2],
				[-1,-2]
			],[
				[-1,0],
				[-1,1],
				[0,-2],
				[-1,-2]
			]
		]
	},
	t:{
		0:[
			[//right
				[-1,0],
				[-1,-1],
				[0,2],
				[-1,2]
			],[//left
				[1,0],
				[1,-1],
				[0,2],
				[1,2]
			]
		],
		1:[
			[
				[1,0],
				[1,1],
				[0,-2],
				[1,-2]
			],[
				[1,0],
				[1,1],
				[0,-2],
				[1,-2]
			]
		],
		2:[
			[
				[1,0],
				[1,-1],
				[0,2],
				[1,2]
			],[
				[-1,0],
				[-1,-1],
				[0,2],
				[-1,2]
			]
		],
		3:[
			[
				[-1,0],
				[-1,1],
				[0,-2],
				[-1,-2]
			],[
				[-1,0],
				[-1,1],
				[0,-2],
				[-1,-2]
			]
		]
	},
}

//const GameRuleType = defineEnum({
//	Normal: {
//		'string': 'normal'
//	},
//	FirstTerrain: {
//		'string': 'firstTerrain'
//	}
//})

const GameRuleClasses = ['Normal','Terrain'] as const;


const matrixHeight: number = 20;
const matrixWidth: number = 10;

const bufferHeight: number = 2;
const bufferWidth:number = matrixWidth;

const fieldHeight: number = matrixHeight + bufferHeight;
const fieldWidth:number = matrixWidth;
