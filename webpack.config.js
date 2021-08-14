const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin"); //installed via npm
module.exports = {
  //
  plugins: [new HtmlWebpackPlugin({ template: "./src/index.html" })]
  //
};

module.exports = {
	mode: 'development',

	entry: `./src/index.js`,

	output: {
		filename: "main.js",
		path: path.join(__dirname, 'dist')
	}
};
