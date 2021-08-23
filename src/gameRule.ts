import { normalBufferHeight, normalFieldHeight, normalFieldWidth, normalMatrixHeight, normalMatrixWidth, Tetrimino } from "./global";

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

	constructor(
		name: string,
		title: string,
		generateTerrain: ()=>Tetrimino[][] = GameRule.Normal._generateTerrain,
		generateRegularlyTerrain: ()=>Tetrimino[] = GameRule.Normal._generateRegularlyTerrain,
		matrixHeight: number = normalMatrixHeight,
		matrixWidth: number = normalMatrixWidth,
		bufferHeight: number = normalBufferHeight,
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
		}
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
		super(name,title,GameRule.Normal.generateTerrain,GameRule.Normal.generateRegularlyTerrain,matrixHeight,matrixWidth,bufferHeight);
	}
}
