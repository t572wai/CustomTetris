const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin"); //installed via npm

module.exports = {
	mode: 'development',

	entry: {
		main:`./src/index.js`,
		sound: './src/sounds.ts',
	},
	plugins: [new HtmlWebpackPlugin({ template: "./src/index.html" })],

	output: {
		filename: "[name].js",
		path: path.join(__dirname, 'dist')
	},

	module: {
		rules: [
			{
				test: /(\.s[ac]ss)$/,
				use: [
					"style-loader",
					"css-loader",
					"postcss-loader",
					"sass-loader",
				]
			},
			{
				test: /\.ts$/,
				use: [
					"ts-loader",
				]
			}
		]
	},
};
