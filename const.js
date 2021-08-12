const TetriminoEnum = defineEnum({
	I: {
		value : 0,
		string: 'i',
	},
	O: {
		value: 1,
		string: 'o',
	},
	S: {
		value: 2,
		string: 's',
	},
	Z: {
		value: 3,
		string: 'z',
	},
	J: {
		value: 4,
		string: 'j',
	},
	L: {
		value: 5,
		string: 'l',
	},
	T: {
		value: 6,
		string: 't',
	},
	Empty: {
		value: -1,
		string: 'empty',
	},
})


function FallingSpeed(level) {
	return 1000*(0.8 - ((level-1) * 0.007))**(level-1);
}

const ShapesOfTetriminoEnum = defineEnum({
	I:{
		string: 'i',
		shape: [[1,0,1,1]]
	},
	O:{
		string: 'o',
		shape: [[1,1],[0,1]]
	},
	S:{
		string: 's',
		shape: [[-1,1,1],[1,0,-1]]
	},
	Z:{
		string: 'z',
		shape: [[1,1,-1],[-1,0,1]]
	},
	J:{
		string: 'j',
		shape: [[1,-1,-1],[1,0,1]]
	},
	L:{
		string: 'l',
		shape: [[-1,-1,1],[1,0,1]]
	},
	T:{
		string: 't',
		shape: [[-1,1,-1],[1,0,1]]
	}
})

const NumOfNext = 6;

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
