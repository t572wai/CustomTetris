const gameRuleConfigs = {
	'normal': [GameRuleType.Normal.string],
	'practiceFor4ren': [GameRuleType.FirstTerrain.string],
}

const generateTerrain = {
	'normal': () => {
		return Array(fieldHeight).fill().map(() => Array(fieldWidth).fill(TetriminoEnum.Empty));
	},
	'practiceFor4ren': () => {
		let terrainArray = generateTerrain['normal']();
		forEachMinoOnMatrix((x,y) => {
			if (x<3 || x>6) {
				terrainArray[y][x] = TetriminoEnum.I;
			}
		})
		terrainArray[21][3] = TetriminoEnum.I;
		terrainArray[21][4] = TetriminoEnum.I;
		terrainArray[21][5] = TetriminoEnum.I;

		return terrainArray;
	}
}

const generateRegularlyTerrain = {
	'normal': () => {
		return Array(fieldWidth).fill(TetriminoEnum.Empty);
	},
	'practiceFor4ren': () => {
		let terrain = generateRegularlyTerrain['normal']();
		terrain[0] = TetriminoEnum.I;
		terrain[1] = TetriminoEnum.I;
		terrain[2] = TetriminoEnum.I;
		terrain[7] = TetriminoEnum.I;
		terrain[8] = TetriminoEnum.I;
		terrain[9] = TetriminoEnum.I;
	}
}

function hasGameRuleType(rule,type) {
	return gameRuleConfigs[rule].includes(type);
}

function resetField() {
	console.log(currentGameRule);
	if (hasGameRuleType(currentGameRule, GameRuleType.FirstTerrain.string)) {
		fieldArray = generateTerrain[currentGameRule]();
	} else {
		fieldArray = generateTerrain['normal']();
	}
}

function getRegularlyTerrain() {
	if (hasGameRuleType(currentGameRule, GameRuleType.FirstTerrain.string)) {
		return getRegularlyTerrain[currentGameRule]()
	} else {
		return getRegularlyTerrain['normal']()
	}
}
