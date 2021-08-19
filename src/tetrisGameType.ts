const GameRuleClasses = ['Normal','Terrain'] as const;
type GameRuleClass = typeof GameRuleClasses[number];

const GameRules = ['normal', 'practiceFor4ren'] as const;
type GameRule = typeof GameRules[number];
const EnumOfGameRule:Enum<GameRule> = {
	defArray: GameRules,
	toEnum: toGameRule,
	toString: toString,
	getTitle: getTitleOfGameRule,
}

const gameRuleOption = new GameOption<GameRule>('gameRule', 0, EnumOfGameRule);

function toGameRule(arg: any): GameRule|undefined {
	if (typeof arg !== 'string') {
		return undefined;
	}
	if (GameRules.includes(arg as GameRule)) {
		return arg as GameRule;
	}
	return undefined;
}
function toString(arg: GameRule): string {
	return arg as string;
}
function getTitleOfGameRule(arg: GameRule): string {
	switch (arg) {
		case 'normal': return 'Normal';
		case 'practiceFor4ren': return '4ren'
	}
}

const gameRuleConfigs = new Map<GameRule,GameRuleClass[]>();
gameRuleConfigs.set('normal', ['Normal']);
gameRuleConfigs.set('practiceFor4ren', ['Terrain']);

const generateTerrain = new Map<GameRule, ()=>Tetrimino[][]>();
generateTerrain.set('normal', () => {
	let terrainArray:Tetrimino[][] = [];
	for (let i = 0; i < fieldHeight; i++) {
		terrainArray.push(new Array(fieldWidth).fill('empty'))
	}
	return terrainArray;
})
generateTerrain.set('practiceFor4ren', () => {
	const generateTerrainFn = generateTerrain.get('normal');
	if (typeof generateTerrainFn !== 'undefined') {
		let terrainArray = generateTerrainFn();
		forEachMinoOnField((pos) => {
			if (pos.x<3 || pos.x>6) {
				terrainArray[pos.y][pos.x] = 'wall';
			}
		})
		terrainArray[21][3] = 'wall';
		terrainArray[21][4] = 'wall';
		terrainArray[21][5] = 'wall';

		return terrainArray;
	}
	return []
})

const generateRegularlyTerrain = new Map<GameRule, ()=>Tetrimino[]>();
generateRegularlyTerrain.set('normal', ()=>{
	return Array(fieldWidth).fill('empty');
})
generateRegularlyTerrain.set('practiceFor4ren', ()=>{
	const generateRegularlyTerrainTemp = generateRegularlyTerrain.get('normal');
	if (typeof generateRegularlyTerrainTemp !== 'undefined') {
		let terrain:Tetrimino[] = generateRegularlyTerrainTemp();
		terrain[0] = 'wall';
		terrain[1] = 'wall';
		terrain[2] = 'wall';
		terrain[7] = 'wall';
		terrain[8] = 'wall';
		terrain[9] = 'wall';

		return terrain;
	}
	return [];
})

function hasGameRuleType(rule: GameRule,type: GameRuleClass) {
	const config = gameRuleConfigs.get(rule);
	if (typeof config !== 'undefined') {
		return config.includes(type);
	}
	return false;
}

function resetField() {
	console.log(gameRuleOption.currentOption);
	if (hasGameRuleType(gameRuleOption.currentOption, "Terrain")) {
		const generateTerrainTemp = generateTerrain.get(gameRuleOption.currentOption);
		if (typeof generateTerrainTemp !== 'undefined') {
			fieldArray = generateTerrainTemp();
		}
	} else {
		const generateTerrainTemp = generateTerrain.get('normal');
		if (typeof generateTerrainTemp !== 'undefined') {
			fieldArray = generateTerrainTemp();
		}}
}

function getRegularlyTerrain() {
	if (hasGameRuleType(gameRuleOption.currentOption, "Terrain")) {
		const generateRegularlyTerrainTemp = generateRegularlyTerrain.get(gameRuleOption.currentOption)
		if (typeof generateRegularlyTerrainTemp !== 'undefined') {
			return generateRegularlyTerrainTemp()
		}
	} else {
		const generateRegularlyTerrainTemp = generateRegularlyTerrain.get('normal')
		if (typeof generateRegularlyTerrainTemp !== 'undefined') {
			return generateRegularlyTerrainTemp()
		}
	}
}
