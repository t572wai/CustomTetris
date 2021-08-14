const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin"); //installed via npm

module.exports = {
	mode: 'development',

	entry: {
		main:`./src/index.js`,
		//const:'./src/const.ts',
		//dialogs:'./src/dialogs.ts',
		//display:'./src/display.ts',
		//enum:'./src/enum.ts',
		//general:'./src/general.ts',
		//global:'./src/global.ts',
		//init: './src/init.ts',
		//keyinput:'./src/keyinput.ts',
		//sounds:'./src/sounds.ts',
		//SwiperClass:'./src/SwiperClass.ts',
		//systems:'./src/systems.ts',
		//tetriminos:'./src/tetriminos.ts',
		//tetrisGameType:'./src/tetrisGameType.ts',
		//tetrisKeyinput:'./src/tetrisKeyinput.ts',
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
			//{
			//	test: /\.(js|ts|tsx)?$/,
			//	use: "ts-loader",
			//	exclude: /node_modules/,
			//}
		]
	},

	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	},
	devtool: "source-map"
};
