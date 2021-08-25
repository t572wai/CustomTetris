import { CssProperty as CssProperties } from "./general";
import { normalBufferHeight, normalBufferWidth, normalFieldHeight, normalFieldWidth, normalMatrixHeight, normalMatrixWidth, Tetrimino } from "./global";

export class GameRule {
	private _name: string;
	private _title: string;
	private _generateTerrain: ()=>Tetrimino[][];
	private _generateRegularlyTerrain: ()=>Tetrimino[];
	private _matrixHeight: number;
	private _matrixWidth: number;
	private _bufferHeight: number;
	private _bufferWidth: number;
	private _fieldHeight: number;
	private _fieldWidth: number;
	private _iStyle: CssProperties;
	private _oStyle: CssProperties;
	private _jStyle: CssProperties;
	private _lStyle: CssProperties;
	private _sStyle: CssProperties;
	private _zStyle: CssProperties;
	private _tStyle: CssProperties;
	private _emptyStyle: CssProperties;
	private _wallStyle: CssProperties;
	private _iStyleFalling: CssProperties;
	private _oStyleFalling: CssProperties;
	private _jStyleFalling: CssProperties;
	private _lStyleFalling: CssProperties;
	private _sStyleFalling: CssProperties;
	private _zStyleFalling: CssProperties;
	private _tStyleFalling: CssProperties;
	private _emptyStyleFalling: CssProperties;
	private _wallStyleFalling: CssProperties;

	constructor(
		name: string,
		title: string,
		generateTerrain: ()=>Tetrimino[][] = GameRule.Normal._generateTerrain,
		generateRegularlyTerrain: ()=>Tetrimino[] = GameRule.Normal._generateRegularlyTerrain,
		matrixHeight: number = normalMatrixHeight,
		matrixWidth: number = normalMatrixWidth,
		bufferHeight: number = normalBufferHeight,
		iStyle: CssProperties = GameRule.Normal._iStyle,
		oStyle: CssProperties = GameRule.Normal._oStyle,
		jStyle: CssProperties = GameRule.Normal._jStyle,
		lStyle: CssProperties = GameRule.Normal._lStyle,
		sStyle: CssProperties = GameRule.Normal._sStyle,
		zStyle: CssProperties = GameRule.Normal._zStyle,
		tStyle: CssProperties = GameRule.Normal._tStyle,
		emptyStyle: CssProperties = GameRule.Normal._emptyStyle,
		wallStyle: CssProperties = GameRule.Normal._wallStyle,
		iStyleFalling: CssProperties = GameRule.Normal._iStyle,
		oStyleFalling: CssProperties = GameRule.Normal._oStyle,
		jStyleFalling: CssProperties = GameRule.Normal._jStyle,
		lStyleFalling: CssProperties = GameRule.Normal._lStyle,
		sStyleFalling: CssProperties = GameRule.Normal._sStyle,
		zStyleFalling: CssProperties = GameRule.Normal._zStyle,
		tStyleFalling: CssProperties = GameRule.Normal._tStyle,
		emptyStyleFalling: CssProperties = GameRule.Normal._emptyStyle,
		wallStyleFalling: CssProperties = GameRule.Normal._wallStyle,
		) {
			this._name = name;
			this._title = title;

			this._generateTerrain = generateTerrain;
			this._generateRegularlyTerrain = generateRegularlyTerrain;

			this._matrixHeight = matrixHeight;
			this._matrixWidth = matrixWidth;
			this._bufferHeight = bufferHeight;
			this._bufferWidth = this._matrixWidth;
			this._fieldHeight = this._matrixHeight + this._bufferHeight;
			this._fieldWidth = this._matrixWidth;

			this._iStyle = iStyle;
			this._oStyle = oStyle;
			this._jStyle = jStyle;
			this._lStyle = lStyle;
			this._sStyle = sStyle;
			this._zStyle = zStyle;
			this._tStyle = tStyle;
		this._emptyStyle = emptyStyle;
		this._wallStyle = wallStyle;

		this._iStyleFalling = iStyleFalling;
		this._oStyleFalling = oStyleFalling;
		this._jStyleFalling = jStyleFalling;
		this._lStyleFalling = lStyleFalling;
		this._sStyleFalling = sStyleFalling;
		this._zStyleFalling = zStyleFalling;
		this._tStyleFalling = tStyleFalling;
		this._emptyStyleFalling = emptyStyleFalling;
		this._wallStyleFalling = wallStyleFalling;

	}

	static Normal = new GameRule(
		'normal',
		'Normal',
		()=>{
			let terrainArray:Tetrimino[][] = [];
			for (let i = 0; i < normalFieldHeight; i++) {
				terrainArray.push(new Array(normalFieldWidth).fill('empty'))
			}
			return terrainArray;
		},
		()=>{
			return Array(normalFieldWidth).fill('empty');
		},
		normalMatrixHeight,
		normalMatrixWidth,
		normalBufferHeight,
		{'background-color': '#348fca;'},
		{'background-color': '#e7bd22;'},
		{'background-color': '#246eab;'},
		{'background-color': '#dc7a23;'},
		{'background-color': '#2aa55d;'},
		{'background-color': '#da4b3c;'},
		{'background-color': '#824597;'},
		{'background-color': '#0b1013;'},
		{'background-color': 'gray;'},
		{'background-color': '#348fca;'},
		{'background-color': '#e7bd22;'},
		{'background-color': '#246eab;'},
		{'background-color': '#dc7a23;'},
		{'background-color': '#2aa55d;'},
		{'background-color': '#da4b3c;'},
		{'background-color': '#824597;'},
		{'background-color': '#0b1013;'},
		{'background-color': 'gray;'},
		)

		get generateTerrain() {
			return this._generateTerrain;
		}
	get generateRegularlyTerrain() {
		return this._generateRegularlyTerrain;
	}

	get matrixHeight() {
		return this._matrixHeight;
	}
	get matrixWidth() {
		return this._matrixWidth;
	}
	get bufferHeight() {
		return this._bufferHeight;
	}
	get bufferWidth() {
		return this._bufferWidth;
	}
	get fieldHeight() {
		return this._fieldHeight;
	}
	get fieldWidth() {
		return this._fieldWidth;
	}

	getStyle(mino: Tetrimino) {
		switch (mino) {
			case 'i':
				return this._iStyle;
				case 'o':
					return this._oStyle;
					case 'j':
						return this._jStyle;
						case 'l':
							return this._lStyle;
							case 's':
								return this._sStyle;
								case 'z':
									return this._zStyle;
									case 't':
										return this._tStyle;
										case 'empty':
											return this._emptyStyle;
											case 'wall':
												return this._wallStyle;
											}
										}
										getStyleFalling(mino: Tetrimino) {
											switch (mino) {
												case 'i':
													return this._iStyleFalling;
													case 'o':
														return this._oStyleFalling;
														case 'j':
															return this._jStyleFalling;
															case 'l':
				return this._lStyleFalling;
			case 's':
				return this._sStyleFalling;
				case 'z':
				return this._zStyleFalling;
				case 't':
					return this._tStyleFalling;
					case 'empty':
						return this._emptyStyleFalling;
						case 'wall':
							return this._wallStyleFalling;
						}
					}

					static toString(rule: GameRule): string{
						return rule._name;
	}

	static getTitle(rule: GameRule): string{
		return rule._title;
	}
}

export class ChangeSizeOfMatrix extends GameRule {
	constructor(
		name: string,
		title: string,
		matrixHeight: number = normalMatrixHeight,
		matrixWidth: number = normalMatrixWidth,
		bufferHeight: number = normalBufferHeight,
		) {
			super(name,title,
				()=>{
					let terrainArray:Tetrimino[][] = [];
					for (let i = 0; i < matrixHeight + bufferHeight; i++) {
						terrainArray.push(new Array(matrixWidth).fill('empty'))
					}
				console.log(terrainArray);
				return terrainArray;
			},
			()=>{
				return Array(matrixWidth).fill('empty');
			},matrixHeight,matrixWidth,bufferHeight);
		}
	}

	export class ChangeStyle extends GameRule {
		constructor(
			name: string,
			title: string,
			iStyle: CssProperties,
			oStyle: CssProperties,
			jStyle: CssProperties,
			lStyle: CssProperties,
			sStyle: CssProperties,
			zStyle: CssProperties,
			tStyle: CssProperties,
			emptyStyle: CssProperties,
			wallStyle: CssProperties,
			iStyleFalling: CssProperties,
			oStyleFalling: CssProperties,
			jStyleFalling: CssProperties,
			lStyleFalling: CssProperties,
			sStyleFalling: CssProperties,
			zStyleFalling: CssProperties,
			tStyleFalling: CssProperties,
			emptyStyleFalling: CssProperties,
			wallStyleFalling: CssProperties,
		) {
			super(
				name,
				title,
				GameRule.Normal.generateTerrain,
				GameRule.Normal.generateRegularlyTerrain,
				GameRule.Normal.matrixHeight,
				GameRule.Normal.matrixWidth,
				GameRule.Normal.bufferHeight,
				iStyle,
				oStyle,
				jStyle,
				lStyle,
				sStyle,
				zStyle,
				tStyle,
				emptyStyle,
				wallStyle,
				iStyleFalling,
				oStyleFalling,
				jStyleFalling,
				lStyleFalling,
				sStyleFalling,
				zStyleFalling,
				tStyleFalling,
				emptyStyleFalling,
				wallStyleFalling,
			)
		}
	}
