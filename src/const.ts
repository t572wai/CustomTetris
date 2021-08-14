const TetriminoUnion = ['i','o','s','z','j','l','t','empty','wall'] as const;
type Tetriminos = typeof TetriminoUnion[number];

const TetriminosFromNum = new Map<Number,Tetriminos>();
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
	mino: Tetriminos,
}


function FallingSpeed(level) {
	return 1000*(0.8 - ((level-1) * 0.007))**(level-1);
}

const ShapesOfTetrimino = new Map<Tetriminos,number[][]>();
ShapesOfTetrimino.set("i", [[1,0,1,1]]);
ShapesOfTetrimino.set("o", [[1,1],[0,1]])
ShapesOfTetrimino.set("s", [[-1,1,1],[1,0,-1]])
ShapesOfTetrimino.set("z", [[1,1,-1],[-1,0,1]])
ShapesOfTetrimino.set("j", [[1,-1,-1],[1,0,1]])
ShapesOfTetrimino.set("l", [[-1,-1,1],[1,0,1]])
ShapesOfTetrimino.set("t", [[-1,1,-1],[1,0,1]])

const NumOfNext = 6;

/// <reference path='enum.ts'/>
const ActionsEnum = defineEnum({
	none: {
		string: 'none',
		score: 0,
		displayTitle: ''
	},
	single: {
		string: 'single',
		score: 100,
		displayTitle: 'Single'
	},
	double: {
		string: 'double',
		score: 300,
		displayTitle: 'Double'
	},
	triple: {
		string: 'triple',
		score: 500,
		displayTitle: 'Triple'
	},
	tetris: {
		string: 'tetris',
		score: 800,
		displayTitle: 'Tetris'
	},
	mini_tspin: {
		string: 'mini-t',
		score: 100,
		displayTitle: ''
	},
	mini_tspin_single: {
		string: 'mini-t_single',
		score: 200,
		displayTitle: 'Mini T-Spin Single'
	},
	tspin: {
		string: 'tspin',
		score: 400,
		displayTitle: ''
	},
	tspin_single: {
		string: 't_single',
		score: 800,
		displayTitle: 'T-Spin Single'
	},
	tspin_double: {
		string: 't_double',
		score: 1200,
		displayTitle: 'T-Spin Double'
	},
	tspin_triple: {
		string: 't_triple',
		score: 1600,
		displayTitle: 'T-Spin Triple'
	},
	back_to_back: {
		string: 'btob',
		score: 1.5,
		displayTitle: ''
	},
	softDrop: {
		string: 'softDrop',
		score: 1,
		displayTitle: ''
	},
	hardDrop: {
		string: 'hardDrop',
		score: 2,
		displayTitle: ''
	},
	ren: {
		string: 'ren',
		score: 50,
		displayTitle: ''
	}
})

/**
 * scoreに表示しないaction
 * @type {Array}
 */
const notScorings = ['hardDrop','softDrop','btob','mini-t','tspin','none','ren']

///<reference path='./enum.ts'/>
const Direction = defineEnum({
	Up: {
		string: 'up',
		value: 0
	},
	Right: {
		string: 'right',
		value: 1
	},
	Down: {
		string: 'down',
		value: 2
	},
	Left: {
		string: 'left',
		value: 3
	}
})

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

const GameRuleType = defineEnum({
	Normal: {
		'string': 'normal'
	},
	FirstTerrain: {
		'string': 'firstTerrain'
	}
})

const matrixHeight = 20;
const matrixWidth = 10;

const bufferHeight = 2;
const bufferWidth = matrixWidth;

const fieldHeight = matrixHeight + bufferHeight;
const fieldWidth = matrixWidth;
