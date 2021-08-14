const gameRuleConfigs = {
	'normal': [GameRuleType.Normal.string],
	'practiceFor4ren': [GameRuleType.FirstTerrain.string],
}

const generateTerrain = {
	'normal': () => {
		let terrainArray = [];
		for (let i = 0; i < fieldHeight; i++) {
			terrainArray.push(new Array(fieldWidth).fill('empty'))
		}
		return terrainArray;
	},
	'practiceFor4ren': () => {
		let terrainArray = generateTerrain['normal']();
		forEachMinoOnField((x,y) => {
			if (x<3 || x>6) {
				terrainArray[y][x] = 'wall';
			}
		})
		terrainArray[21][3] = 'wall';
		terrainArray[21][4] = 'wall';
		terrainArray[21][5] = 'wall';

		return terrainArray;
	}
}

const generateRegularlyTerrain = {
	'normal': () => {
		return Array(fieldWidth).fill('empty');
	},
	'practiceFor4ren': () => {
		let terrain = generateRegularlyTerrain['normal']();
		terrain[0] = 'wall';
		terrain[1] = 'wall';
		terrain[2] = 'wall';
		terrain[7] = 'wall';
		terrain[8] = 'wall';
		terrain[9] = 'wall';

		return terrain;
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
