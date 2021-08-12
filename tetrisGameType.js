const gameRuleConfigs = {
	'normal': [GameRuleType.Normal.string],
	'practiceFor4ren': [GameRuleType.FirstTerrain.string],
}

const generateTerrain = {
	'normal': () => {
		return Array(fieldHeight).fill().map(() => Array(fieldWidth).fill(TetriminoEnum.Empty));
	},
	'practiceFor4ren': () => {
		let normalTerrainArray = generateTerrain['normal']();
		forEachMinoOnMatrix((x,y) => {
			if (x<3 || x>6) {
				normalTerrainArray[y][x] = TetriminoEnum.I;
			}
		})

		return terrainArray;
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
