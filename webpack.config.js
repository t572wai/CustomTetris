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
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/
			}
		]
	},

	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	}
};
