const gameRuleConfigs = {
	'normal': [GameRuleType.Normal.string],
	'practiceFor4ren': [GameRuleType.FirstTerrain.string],
}

const generateTerrain = {
	'normal': () => {
		return Array(22).fill().map(() => Array(10).fill(TetriminoEnum.Empty));
	},
	'practiceFor4ren': () => {
		let terrainArray = generateTerrain['normal'];
	}
}

function hasGameRuleType(rule,type) {
	return gameRuleConfigs[rule].includes(type);
}

function resetField() {
	if (hasGameRuleType(currentGameRule, GameRuleType.FirstTerrain)) {
		fieldArray = generateTerrain[currentGameRule];
	} else {
		fieldArray = generateTerrain['normal']
	}
}
