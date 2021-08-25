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
	private _iStyleGhost: CssProperties;
	private _oStyleGhost: CssProperties;
	private _jStyleGhost: CssProperties;
	private _lStyleGhost: CssProperties;
	private _sStyleGhost: CssProperties;
	private _zStyleGhost: CssProperties;
	private _tStyleGhost: CssProperties;
	private _emptyStyleGhost: CssProperties;
	private _wallStyleGhost: CssProperties;

	constructor(
		{
			name,
			title,
			generateTerrain = GameRule.Normal.generateTerrain,
			generateRegularlyTerrain = GameRule.Normal.generateRegularlyTerrain,
			matrixHeight = normalMatrixHeight,
			matrixWidth = normalMatrixWidth,
			bufferHeight = normalBufferHeight,
			iStyle = GameRule.Normal._iStyle,
			oStyle = GameRule.Normal._oStyle,
			jStyle = GameRule.Normal._jStyle,
			lStyle = GameRule.Normal._lStyle,
			sStyle = GameRule.Normal._sStyle,
			zStyle = GameRule.Normal._zStyle,
			tStyle = GameRule.Normal._tStyle,
			emptyStyle = GameRule.Normal._emptyStyle,
			wallStyle = GameRule.Normal._wallStyle,
			iStyleFalling = GameRule.Normal._iStyle,
			oStyleFalling = GameRule.Normal._oStyle,
			jStyleFalling = GameRule.Normal._jStyle,
			lStyleFalling = GameRule.Normal._lStyle,
			sStyleFalling = GameRule.Normal._sStyle,
			zStyleFalling = GameRule.Normal._zStyle,
			tStyleFalling = GameRule.Normal._tStyle,
			emptyStyleFalling = GameRule.Normal._emptyStyle,
			wallStyleFalling = GameRule.Normal._wallStyle,
			iStyleGhost = GameRule.Normal._iStyleGhost,
			oStyleGhost = GameRule.Normal._oStyleGhost,
			jStyleGhost = GameRule.Normal._jStyleGhost,
			lStyleGhost = GameRule.Normal._lStyleGhost,
			sStyleGhost = GameRule.Normal._sStyleGhost,
			zStyleGhost = GameRule.Normal._zStyleGhost,
			tStyleGhost = GameRule.Normal._tStyleGhost,
			emptyStyleGhost = GameRule.Normal._emptyStyleGhost,
			wallStyleGhost = GameRule.Normal._wallStyleGhost,
		}:
		{
			name: string,
			title: string,
			generateTerrain?: ()=>Tetrimino[][],
			generateRegularlyTerrain?: ()=>Tetrimino[],
			matrixHeight?: number,
			matrixWidth?: number,
			bufferHeight?: number,
			iStyle?: CssProperties,
			oStyle?: CssProperties,
			jStyle?: CssProperties,
			lStyle?: CssProperties,
			sStyle?: CssProperties,
			zStyle?: CssProperties,
			tStyle?: CssProperties,
			emptyStyle?: CssProperties,
			wallStyle?: CssProperties
			iStyleFalling?: CssProperties,
			oStyleFalling?: CssProperties,
			jStyleFalling?: CssProperties,
			lStyleFalling?: CssProperties,
			sStyleFalling?: CssProperties,
			zStyleFalling?: CssProperties,
			tStyleFalling?: CssProperties,
			emptyStyleFalling?: CssProperties,
			wallStyleFalling?: CssProperties,
			iStyleGhost?: CssProperties,
			oStyleGhost?: CssProperties,
			jStyleGhost?: CssProperties,
			lStyleGhost?: CssProperties,
			sStyleGhost?: CssProperties,
			zStyleGhost?: CssProperties,
			tStyleGhost?: CssProperties,
			emptyStyleGhost?: CssProperties,
			wallStyleGhost?: CssProperties
		}
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

			this._iStyleGhost = iStyleGhost;
			this._oStyleGhost = oStyleGhost;
			this._jStyleGhost = jStyleGhost;
			this._lStyleGhost = lStyleGhost;
			this._sStyleGhost = sStyleGhost;
			this._zStyleGhost = zStyleGhost;
			this._tStyleGhost = tStyleGhost;
			this._emptyStyleGhost = emptyStyleGhost;
			this._wallStyleGhost = wallStyleGhost;
	}

	public static Normal = new GameRule({
		name:'normal',
		title:'Normal',
		generateTerrain:()=>{
			let terrainArray:Tetrimino[][] = [];
			for (let i = 0; i < normalFieldHeight; i++) {
				terrainArray.push(new Array(normalFieldWidth).fill('empty'))
			}
			return terrainArray;
		},
		generateRegularlyTerrain:()=>{
			return Array(normalFieldWidth).fill('empty');
		},
		matrixHeight:normalMatrixHeight,
		matrixWidth:normalMatrixWidth,
		bufferHeight:normalBufferHeight,
		iStyle:{'background-color': '#348fca;'},
		oStyle:{'background-color': '#e7bd22;'},
		jStyle:{'background-color': '#246eab;'},
		lStyle:{'background-color': '#dc7a23;'},
		sStyle:{'background-color': '#2aa55d;'},
		zStyle:{'background-color': '#da4b3c;'},
		tStyle:{'background-color': '#824597;'},
		emptyStyle:{'background-color': '#0b1013;'},
		wallStyle:{'background-color': 'gray;'},
		iStyleFalling:{'background-color': '#348fca;'},
		oStyleFalling:{'background-color': '#e7bd22;'},
		jStyleFalling:{'background-color': '#246eab;'},
		lStyleFalling:{'background-color': '#dc7a23;'},
		sStyleFalling:{'background-color': '#2aa55d;'},
		zStyleFalling:{'background-color': '#da4b3c;'},
		tStyleFalling:{'background-color': '#824597;'},
		emptyStyleFalling:{'background-color': '#0b1013;'},
		wallStyleFalling:{'background-color': 'gray;'},
		iStyleGhost:{'background-color': '#348fca;'},
		oStyleGhost:{'background-color': '#e7bd22;'},
		jStyleGhost:{'background-color': '#246eab;'},
		lStyleGhost:{'background-color': '#dc7a23;'},
		sStyleGhost:{'background-color': '#2aa55d;'},
		zStyleGhost:{'background-color': '#da4b3c;'},
		tStyleGhost:{'background-color': '#824597;'},
		emptyStyleGhost:{'background-color': '#0b1013;'},
		wallStyleGhost:{'background-color': 'gray;'},
	})

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
	getStyleGhost(mino: Tetrimino) {
		switch (mino) {
			case 'i':
				return this._iStyleGhost;
			case 'o':
				return this._oStyleGhost;
			case 'j':
				return this._jStyleGhost;
			case 'l':
				return this._lStyleGhost;
			case 's':
				return this._sStyleGhost;
			case 'z':
				return this._zStyleGhost;
			case 't':
				return this._tStyleGhost;
			case 'empty':
				return this._emptyStyleGhost;
			case 'wall':
				return this._wallStyleGhost;
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
		super({
			name:name,
			title:title,
			generateTerrain:()=>{
				let terrainArray:Tetrimino[][] = [];
				for (let i = 0; i < matrixHeight + bufferHeight; i++) {
					terrainArray.push(new Array(matrixWidth).fill('empty'))
				}
				console.log(terrainArray);
				return terrainArray;
			},
			generateRegularlyTerrain:()=>{
				return Array(matrixWidth).fill('empty');
			}
		});
	}
}

	export class ChangeStyle extends GameRule {
		constructor(
			{
				name,
				title,
				iStyle = GameRule.Normal.getStyle('i'),
				oStyle = GameRule.Normal.getStyle('o'),
				jStyle = GameRule.Normal.getStyle('j'),
				lStyle = GameRule.Normal.getStyle('l'),
				sStyle = GameRule.Normal.getStyle('s'),
				zStyle = GameRule.Normal.getStyle('z'),
				tStyle = GameRule.Normal.getStyle('t'),
				emptyStyle = GameRule.Normal.getStyle('empty'),
				wallStyle = GameRule.Normal.getStyle('wall'),
				iStyleFalling = GameRule.Normal.getStyleFalling('i'),
				oStyleFalling = GameRule.Normal.getStyleFalling('o'),
				jStyleFalling = GameRule.Normal.getStyleFalling('j'),
				lStyleFalling = GameRule.Normal.getStyleFalling('l'),
				sStyleFalling = GameRule.Normal.getStyleFalling('s'),
				zStyleFalling = GameRule.Normal.getStyleFalling('z'),
				tStyleFalling = GameRule.Normal.getStyleFalling('t'),
				emptyStyleFalling = GameRule.Normal.getStyleFalling('empty'),
				wallStyleFalling = GameRule.Normal.getStyleFalling('wall'),
				iStyleGhost = GameRule.Normal.getStyleGhost('i'),
				oStyleGhost = GameRule.Normal.getStyleGhost('o'),
				jStyleGhost = GameRule.Normal.getStyleGhost('j'),
				lStyleGhost = GameRule.Normal.getStyleGhost('l'),
				sStyleGhost = GameRule.Normal.getStyleGhost('s'),
				zStyleGhost = GameRule.Normal.getStyleGhost('z'),
				tStyleGhost = GameRule.Normal.getStyleGhost('t'),
				emptyStyleGhost = GameRule.Normal.getStyleGhost('empty'),
				wallStyleGhost = GameRule.Normal.getStyleGhost('wall'),
			}:
			{
				name: string,
				title: string,
				iStyle?: CssProperties,
				oStyle?: CssProperties,
				jStyle?: CssProperties,
				lStyle?: CssProperties,
				sStyle?: CssProperties,
				zStyle?: CssProperties,
				tStyle?: CssProperties,
				emptyStyle?: CssProperties,
				wallStyle?: CssProperties,
				iStyleFalling?: CssProperties,
				oStyleFalling?: CssProperties,
				jStyleFalling?: CssProperties,
				lStyleFalling?: CssProperties,
				sStyleFalling?: CssProperties,
				zStyleFalling?: CssProperties,
				tStyleFalling?: CssProperties,
				emptyStyleFalling?: CssProperties,
				wallStyleFalling?: CssProperties,
				iStyleGhost?: CssProperties,
				oStyleGhost?: CssProperties,
				jStyleGhost?: CssProperties,
				lStyleGhost?: CssProperties,
				sStyleGhost?: CssProperties,
				zStyleGhost?: CssProperties,
				tStyleGhost?: CssProperties,
				emptyStyleGhost?: CssProperties,
				wallStyleGhost?: CssProperties,
			}
		) {
			super({
				name:name,
				title:title,
				iStyle: iStyle,
				oStyle: oStyle,
				jStyle: jStyle,
				lStyle: lStyle,
				sStyle: sStyle,
				zStyle: zStyle,
				tStyle: tStyle,
				emptyStyle: emptyStyle,
				wallStyle: wallStyle,
				iStyleFalling: iStyleFalling,
				oStyleFalling: oStyleFalling,
				jStyleFalling: jStyleFalling,
				lStyleFalling: lStyleFalling,
				sStyleFalling: sStyleFalling,
				zStyleFalling: zStyleFalling,
				tStyleFalling: tStyleFalling,
				emptyStyleFalling: emptyStyleFalling,
				wallStyleFalling: wallStyleFalling,
				iStyleGhost: iStyleGhost,
				oStyleGhost: oStyleGhost,
				jStyleGhost: jStyleGhost,
				lStyleGhost: lStyleGhost,
				sStyleGhost: sStyleGhost,
				zStyleGhost: zStyleGhost,
				tStyleGhost: tStyleGhost,
				emptyStyleGhost: emptyStyleGhost,
				wallStyleGhost: wallStyleGhost,
			})
		}
	}
