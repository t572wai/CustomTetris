import { CssProperty as CssProperties, shuffle } from "./general";
import { normalBufferHeight, normalBufferWidth, normalFieldHeight, normalFieldWidth, normalMatrixHeight, normalMatrixWidth, Tetrimino, TetriminoEnum } from "./global";

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
	private _cssClass: string;
	private _followingMinos: Tetrimino[];
	private _nextNum: number;
	private _shouldGenerateTetriminos: ()=>void;
	private _generateNextTetriminos: ()=>Tetrimino[];
	private _arrangeFirstSituation: (data?: any)=>void;
	private _arrangeSituation: (data?:any)=>void;

	constructor(
		{
			name,
			title,
			generateTerrain = GameRule.Normal.generateTerrain,
			generateRegularlyTerrain = GameRule.Normal.generateRegularlyTerrain,
			matrixHeight = normalMatrixHeight,
			matrixWidth = normalMatrixWidth,
			bufferHeight = normalBufferHeight,
			cssClass = GameRule.Normal._cssClass,
			nextNum = 6,
			shouldGenerateTetriminos = GameRule.Normal._shouldGenerateTetriminos,
			generateNextTetriminos = GameRule.Normal._generateNextTetriminos,
			arrangeFirstSituation = GameRule.Normal._arrangeFirstSituation,
			arrangeTerrain = GameRule.Normal._arrangeSituation,
		}:
		{
			name: string,
			title: string,
			generateTerrain?: ()=>Tetrimino[][],
			generateRegularlyTerrain?: ()=>Tetrimino[],
			matrixHeight?: number,
			matrixWidth?: number,
			bufferHeight?: number,
			cssClass?: string,
			nextNum?: number,
			shouldGenerateTetriminos?: ()=>void,
			generateNextTetriminos?: ()=>Tetrimino[],
			arrangeFirstSituation?: (data?: any)=>void,
			arrangeTerrain?: (data?: any)=>void,
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

			this._cssClass = cssClass;

			this._followingMinos = [];
			this._nextNum = nextNum;
			this._shouldGenerateTetriminos = shouldGenerateTetriminos;
			this._generateNextTetriminos = generateNextTetriminos;

			this._arrangeSituation = arrangeTerrain;

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
		cssClass: 'normal',
		nextNum: 6,
		shouldGenerateTetriminos: () => {
			if (GameRule.Normal._followingMinos.length < GameRule.Normal._nextNum+1) {
				GameRule.Normal._generateNextTetriminos()
			}
		},
		generateNextTetriminos: () => {
			//ミノをランダムにソート
			const nextMinos = shuffle(['i','o','s','z','j','l','t'] as Tetrimino[]);
			return nextMinos;
		},
		arrangeFirstSituation: ()=>{},
		arrangeTerrain: ()=>{},
	})

	get generateTerrain() {
		return this._generateTerrain;
	}
	get generateRegularlyTerrain() {
		return this._generateRegularlyTerrain;
	}
	get shouldGenerateTetriminos() {
		return this._shouldGenerateTetriminos;
	}
	get arrangeSituation() {
		return this._arrangeSituation;
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
	get cssClass() {
		return this._cssClass;
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
			},
			matrixHeight: matrixHeight,
			matrixWidth: matrixWidth,
			bufferHeight: bufferHeight,
		});
	}
}
