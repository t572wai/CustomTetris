const gameRuleConfigs = {
	'normal': [GameRuleType.Normal.string],
	'practiceFor4ren': [GameRuleType.FirstTerrain.string],
}

const generateTerrain = {
	'normal': () => {
		return Array(fieldHeight).fill().map(() => Array(fieldWidth).fill(TetriminoEnum.Empty));
	},
	'practiceFor4ren': () => {
		const terrainArray = generateTerrain['normal'];

		return terrainArray;
	}
}

function hasGameRuleType(rule,type) {
	return gameRuleConfigs[rule].includes(type);
}

function resetField() {
	if (hasGameRuleType(currentGameRule, GameRuleType.FirstTerrain)) {
		fieldArray = generateTerrain[currentGameRule]();
	} else {
		fieldArray = generateTerrain['normal']();
	}
}
