import { cloneArray, CssProperty as CssProperties, shuffle } from "./general";
import { normalBufferHeight, normalBufferWidth, normalFieldHeight, normalFieldWidth, normalMatrixHeight, normalMatrixWidth, Pos, Tetrimino, TetriminoEnum } from "./global";

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
	private _shouldGenerateTetriminos: (array: Tetrimino[])=>boolean;
	private _generateNextTetriminos: (array: Tetrimino[])=>Tetrimino[];
	private _arrangeFirstSituation: (data?: any)=>void;
	private _arrangeSituation: (data?:any)=>void;
	private _isAllowedOperation: (numberOfMoved?: number)=>boolean;
	private _data: any;
	private _getterOfData: (data:any)=>any;
	private _setterOfData: (data:any)=>any;
	private _spinRule: Map<Tetrimino, Pos[][][]>;
	private _getRotatedTetriminoShape: (type:Tetrimino, d:number)=>Pos[];
	

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
			arrangeSituation: arrangeTerrain = GameRule.Normal._arrangeSituation,
			isAllowedOperation = GameRule.Normal._isAllowedOperation,
			getterOfData = GameRule.Normal._getterOfData,
			setterOfData = GameRule.Normal._setterOfData,
			spinRule = GameRule.Normal._spinRule,
			getRotatedTetriminoShape = GameRule.Normal._getRotatedTetriminoShape,
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
			shouldGenerateTetriminos?: (array: Tetrimino[])=>boolean,
			generateNextTetriminos?: (array: Tetrimino[])=>Tetrimino[],
			arrangeFirstSituation?: (data?: any)=>void,
			arrangeSituation?: (data?: any)=>void,
			isAllowedOperation?: (numOfMoved?: number)=>boolean,
			getterOfData?: (data:any)=>any,
			setterOfData?: (data:any)=>any,
			spinRule?: Map<Tetrimino, Pos[][][]>,
			getRotatedTetriminoShape?: (type:Tetrimino, d:number)=>Pos[],
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

			this._arrangeFirstSituation = arrangeFirstSituation;
			this._arrangeSituation = arrangeTerrain;

			this._isAllowedOperation = isAllowedOperation;

			this._getterOfData = getterOfData;
			this._setterOfData = setterOfData;

			this._spinRule = spinRule;
			this._getRotatedTetriminoShape = getRotatedTetriminoShape;
	}

	public static Normal: GameRule = new GameRule({
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
		shouldGenerateTetriminos: (followingMinos: Tetrimino[]) => {
			return followingMinos.length < GameRule.Normal.nextNum + 1
		},
		generateNextTetriminos: (array: Tetrimino[]) => {
			//ミノをランダムにソート
			const nextMinos = shuffle(['i','o','s','z','j','l','t'] as Tetrimino[]);
			return array.concat(nextMinos);
		},
		arrangeFirstSituation: ()=>{},
		arrangeSituation: ()=>{},
		isAllowedOperation: (numOfMoved?: number)=>{return numOfMoved!<15},
		getterOfData: (data: any)=>{return null},
		setterOfData: (data: any)=>{return null},
		spinRule: setRegulatedSpinRule(
		{
			i: [
					[
						[
							{x:-2,y:0},
							{x:1,y:0},
							{x:-2,y:1},
							{x:1,y:-2}
						],[
							{x:-1,y:0},
							{x:2,y:0},
							{x:-1,y:-2},
							{x:2,y:1}
						]
					],[
						[
							{x:-1,y:0},
							{x:2,y:0},
							{x:-1,y:-2},
							{x:2,y:1}
						],[
							{x:2,y:0},
							{x:-1,y:0},
							{x:2,y:-1},
							{x:-1,y:2}
						]
					],[
						[
							{x:2,y:0},
							{x:-1,y:0},
							{x:2,y:-1},
							{x:-1,y:2}
						],[
							{x:1,y:0},
							{x:-2,y:0},
							{x:1,y:2},
							{x:-2,y:-1}
						]
					],[
						[
							{x:-2,y:0},
							{x:1,y:0},
							{x:1,y:2},
							{x:-2,y:-1}
						],[
							{x:1,y:0},
							{x:-2,y:0},
							{x:-2,y:1},
							{x:1,y:-2}
						]
					]
				],
			o: [[[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]]],
			l: [[[{x:-1,y:0},{x:-1,y:-1},{x:0,y:2},{x:-1,y:2}]]],
			j: [[[{x:-1,y:0},{x:-1,y:-1},{x:0,y:2},{x:-1,y:2}]]],
			s: [[[{x:-1,y:0},{x:-1,y:-1},{x:0,y:2},{x:-1,y:2}]]],
			z: [[[{x:-1,y:0},{x:-1,y:-1},{x:0,y:2},{x:-1,y:2}]]],
			t: [[[{x:-1,y:0},{x:-1,y:-1},{x:0,y:2},{x:-1,y:2}]]],
		}),
		getRotatedTetriminoShape: (type: Tetrimino,d: number): Pos[] => {
			const shape_pos: Pos[] = getTetriminoShape(type)!;
			if (type=='o') {
				return shape_pos;
			} else if (type=='i') {
				const differ = [
					[0,0],
					[1,0],
					[1,1],
					[0,1]
				]
				return getMovedMinos(changeFacing(shape_pos,d), differ[d][0], differ[d][1]);
			} else {
				return changeFacing(shape_pos,d);
			}
		}
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
	get arrangeFirstSituation() {
		return this._arrangeFirstSituation;
	}
	get arrangeSituation() {
		return this._arrangeSituation;
	}

	get nextNum() {
		return this._nextNum;
	}
	get generateNextTetriminos() {
		return this._generateNextTetriminos;
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
	get isAllowedOperation() {
		return this._isAllowedOperation;
	}
	get data() {
		return this._getterOfData(this._data);
	}
	set data(data: any) {
		this._data = this._setterOfData(data);
	}
	get spinRule() {
		return this._spinRule;
	}
	get getRotatedTetriminoShape() {
		return this._getRotatedTetriminoShape;
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
				// console.log(terrainArray);
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

export const ShapesOfTetrimino = new Map<Tetrimino,number[][]>();
ShapesOfTetrimino.set("i", [[1,0,1,1]]);
ShapesOfTetrimino.set("o", [[1,1],[0,1]])
ShapesOfTetrimino.set("s", [[-1,1,1],[1,0,-1]])
ShapesOfTetrimino.set("z", [[1,1,-1],[-1,0,1]])
ShapesOfTetrimino.set("j", [[1,-1,-1],[1,0,1]])
ShapesOfTetrimino.set("l", [[-1,-1,1],[1,0,1]])
ShapesOfTetrimino.set("t", [[-1,1,-1],[1,0,1]])

export function getMovedMinos(tiles: Pos[], dx: number, dy: number): Pos[] {
	return tiles.map((tile) => ({x:tile.x+dx,y:tile.y+dy}))
}

export function spinRuleRegulator(basicRule: Map<Tetrimino, Pos[][][]>): Map<Tetrimino, Pos[][][]> {
	let regulatedSpinRule = basicRule;
	TetriminoEnum.defArray.forEach((type) => {
		if (type!='i' && type!='o' && type!='empty' && type!='wall') {
			const basicOne = basicRule.get(type)![0][0];
			regulatedSpinRule.set(type, [
				[
					basicOne,
					basicOne.map((p) => ({x:-p.x, y:p.y})),
				],
				[
					basicOne.map((p) => ({x:-p.x, y:-p.y})),
					basicOne.map((p) => ({x:-p.x, y:-p.y})),
				],
				[
					basicOne.map((p) => ({x:-p.x, y:p.y})),
					basicOne,
				],
				[
					basicOne.map((p) => ({x:p.x, y:-p.y})),
					basicOne.map((p) => ({x:p.x, y:-p.y})),
				],
			])
		}
	})
	return basicRule;
}

function setRegulatedSpinRule
	(
		{i,o,l,j,s,z,t}:
		{
			i:Pos[][][],
			o:Pos[][][],
			l:Pos[][][],
			j:Pos[][][],
			s:Pos[][][],
			z:Pos[][][],
			t:Pos[][][]
		}
	): Map<Tetrimino, Pos[][][]> {
		let preSpinRule = new Map<Tetrimino, Pos[][][]>();
		preSpinRule.set("i", i);
		preSpinRule.set("o", o);
		preSpinRule.set("l", l);
		preSpinRule.set("j", j);
		preSpinRule.set("s", s);
		preSpinRule.set("z", z);
		preSpinRule.set("t", t);
		return spinRuleRegulator(preSpinRule);
	}

	export function getTetriminoShape(type: Tetrimino): Pos[] | null {
	let minoArray:Pos[] = [];
	const shape: number[][] | undefined = ShapesOfTetrimino.get(type);
	let originPos:Pos = {x:0,y:0};
	if (typeof shape != 'undefined') {
		for (var i = 0; i < shape.length; i++) {
			for (var j = 0; j < shape[i].length; j++) {
				if (shape[i][j]!=-1){
					minoArray.push({x:j,y:i});
				}
				if (shape[i][j]==0) {
					originPos = {x:j,y:i}
				}
			}
		}
		return getMovedMinos(minoArray,-originPos.x,-originPos.y);
	} else {
		return null;
	}
}

// function getRotatedTetriminoShape(type: Tetrimino,d: number): Pos[] {
// 	const shape: Pos[] | null = getTetriminoShape(type);
// 	if (typeof shape !== null) {
// 		const shape_pos: Pos[] = shape as Pos[];
// 		if (type=='o') {
// 			return shape_pos;
// 		} else if (type=='i') {
// 			const differ = [
// 				[0,0],
// 				[1,0],
// 				[1,1],
// 				[0,1]
// 			]
// 			return getMovedMinos(changeFacing(shape_pos,d), differ[d][0], differ[d][1]);
// 		} else {
// 			console.log(type, shape, shape_pos);
// 			return changeFacing(shape_pos,d);
// 		}
// 	} else {
// 		return []
// 	}
// }

/**
 * [changeDirection description]
 * @param  {Array<number>} tiles               [x,y]
 * @param  {number} sgn                 [0-3]
 * @return {Array<number>}       [0-3]
 */
export function changeFacing(tiles: Pos[], sgn: number): Pos[] {
	//console.log(tiles);
	let newTiles:Pos[] = cloneArray<Pos>(tiles)
	//console.log(newTiles);
	if (sgn==0) {
		return newTiles;
	} else if(sgn==1) {
		newTiles = newTiles.map((tile) => ({x: -tile.y, y: tile.x}))
		return newTiles;
	} else if(sgn==2) {
		newTiles = newTiles.map((tile) => ({x:-tile.x, y:-tile.y}))
		return newTiles;
	} else {
		newTiles = newTiles.map((tile) => ({x: tile.y, y: -tile.x}))
		return newTiles;
	}
}