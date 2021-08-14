const path = require('path');

module.exportsx = {
	mode: 'development',

	entry: `./src/index.js`,

	output: {
		filename: "main.js",
		path: path.join(__dirname, 'dist')
	}
};
