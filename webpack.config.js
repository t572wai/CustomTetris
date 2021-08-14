const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin"); //installed via npm

module.exports = {
	mode: 'development',

	entry: `./src/index.js`,
	plugins: [new HtmlWebpackPlugin({ template: "./src/index.html" })],

	output: {
		filename: "main.js",
		path: path.join(__dirname, 'dist')
	},

	rules: [
		{
			test: /(\.s[ac]ss)$/,
			use: [
				"style-loader",
				"css-loader",
				"sass-loader",
			]
		}
	]
};
