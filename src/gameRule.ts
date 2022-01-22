import { Enum, shuffle } from "./general";
import { changeFacing, getMovedMinos, getTetriminoShape, isTetrimino, TileAttrs, normalBufferHeight, normalFieldHeight, normalFieldWidth, normalMatrixHeight, normalMatrixWidth, Pos, Tetrimino, TetriminoEnum, getMovedShape } from "./global";
import { Tetris } from "./tetris";

export class GameRule<TetriminoClass extends string> {
	private _name: string;
	private _title: string;
	private _TetriminoClassEnum: Enum<TetriminoClass> | undefined;
	private _generateTerrain: ()=>TetriminoClass[][];
	private _generateRegularlyTerrain: ()=>TetriminoClass[];
	private _matrixHeight: number;
	private _matrixWidth: number;
	private _bufferHeight: number;
	private _bufferWidth: number;
	private _fieldHeight: number;
	private _fieldWidth: number;
	private _cssClass: string;
	private _followingMinos: TetriminoClass[];
	private _nextNum: number;
	private _shouldGenerateTetriminos: (array: TetriminoClass[])=>boolean;
	private _generateNextTetriminos: (array: TetriminoClass[])=>TetriminoClass[];
	private _arrangeFirstSituation: (data?: any)=>void;
	private _arrangeSituation: (data?:any)=>void;
	private _isAllowedOperation: (numberOfMoved?: number)=>boolean;
	private _data: any;
	private _getterOfData: (data:any)=>any;
	private _setterOfData: (data:any)=>any;
	private _spinRule: Map<TetriminoClass, Pos[][][]>;
	private _getRotatedTetriminoShape: (type:TetriminoClass, d:number)=>Pos[];
	private _justBeforeLockDown: (data:any)=>boolean;

	constructor(
		{
			name,
			title,
			generateTerrain,
			generateRegularlyTerrain,
			matrixHeight = normalMatrixHeight,
			matrixWidth = normalMatrixWidth,
			bufferHeight = normalBufferHeight,
			cssClass,
			nextNum,
			shouldGenerateTetriminos,
			generateNextTetriminos,
			arrangeFirstSituation,
			arrangeSituation,
			isAllowedOperation,
			getterOfData,
			setterOfData,
			spinRule,
			getRotatedTetriminoShape,
			justBeforeLockDown,
		}:
		{
			name: string,
			title: string,
			generateTerrain: ()=>TetriminoClass[][],
			generateRegularlyTerrain: ()=>TetriminoClass[],
			matrixHeight: number,
			matrixWidth: number,
			bufferHeight: number,
			cssClass: string,
			nextNum: number,
			shouldGenerateTetriminos: (array: TetriminoClass[])=>boolean,
			generateNextTetriminos: (array: TetriminoClass[])=>TetriminoClass[],
			arrangeFirstSituation: (data?: any)=>void,
			arrangeSituation: (data?: any)=>void,
			isAllowedOperation: (numOfMoved?: number)=>boolean,
			getterOfData: (data:any)=>any,
			setterOfData: (data:any)=>any,
			spinRule: Map<TetriminoClass, Pos[][][]>,
			getRotatedTetriminoShape: (type:TetriminoClass, d:number)=>Pos[],
			justBeforeLockDown: (data: any)=>boolean,
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
			this._arrangeSituation = arrangeSituation;

			this._isAllowedOperation = isAllowedOperation;

			this._getterOfData = getterOfData;
			this._setterOfData = setterOfData;

			this._spinRule = spinRule;
			this._getRotatedTetriminoShape = getRotatedTetriminoShape;

			this._justBeforeLockDown = justBeforeLockDown;
	}

	public static Normal: GameRule<Tetrimino> = new GameRule<Tetrimino>({
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
				return getMovedShape(changeFacing(shape_pos,d), differ[d][0], differ[d][1]);
			} else {
				return changeFacing(shape_pos,d);
			}
		},
		justBeforeLockDown: ()=>{return true},
	})

	createTetris(): Tetris<TetriminoClass> {
		return new Tetris<TetriminoClass>(this);
	}

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
	set cssClass(cssClass: string) {
		this._cssClass = cssClass;
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
	get getterOfData() {
		return this._getterOfData;
	}
	get setterOfData() {
		return this._setterOfData;
	}
	get spinRule() {
		return this._spinRule;
	}
	get getRotatedTetriminoShape() {
		return this._getRotatedTetriminoShape;
	}

	get justBeforeLockDown() {
		return this._justBeforeLockDown;
	}

	static toString<T extends string>(rule: GameRule<T>): string{
		return rule._name;
	}

	static getTitle<T extends string>(rule: GameRule<T>): string{
		return rule._title;
	}
}

export class GameRuleNormal extends GameRule<Tetrimino> {
	constructor({
			name,
			title,
			generateTerrain = GameRule.Normal.generateTerrain,
			generateRegularlyTerrain = GameRule.Normal.generateRegularlyTerrain,
			matrixHeight = normalMatrixHeight,
			matrixWidth = normalMatrixWidth,
			bufferHeight = normalBufferHeight,
			cssClass = GameRule.Normal.cssClass,
			nextNum = 6,
			shouldGenerateTetriminos = GameRule.Normal.shouldGenerateTetriminos,
			generateNextTetriminos = GameRule.Normal.generateNextTetriminos,
			arrangeFirstSituation = GameRule.Normal.arrangeFirstSituation,
			arrangeSituation = GameRule.Normal.arrangeSituation,
			isAllowedOperation = GameRule.Normal.isAllowedOperation,
			getterOfData = GameRule.Normal.getterOfData,
			setterOfData = GameRule.Normal.setterOfData,
			spinRule = GameRule.Normal.spinRule,
			getRotatedTetriminoShape = GameRule.Normal.getRotatedTetriminoShape,
			justBeforeLockDown = GameRule.Normal.justBeforeLockDown,
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
			justBeforeLockDown?: (data: any)=>boolean,
		}) {
		super({
			name: name,
			title: title,
			generateTerrain: generateTerrain,
			generateRegularlyTerrain: generateRegularlyTerrain,
			matrixHeight: matrixHeight,
			matrixWidth: matrixWidth,
			bufferHeight: bufferHeight,
			cssClass: cssClass,
			nextNum: nextNum,
			shouldGenerateTetriminos: shouldGenerateTetriminos,
			generateNextTetriminos: generateNextTetriminos,
			arrangeFirstSituation: arrangeFirstSituation,
			arrangeSituation: arrangeSituation,
			isAllowedOperation: isAllowedOperation,
			getterOfData: getterOfData,
			setterOfData: setterOfData,
			spinRule: spinRule,
			getRotatedTetriminoShape: getRotatedTetriminoShape,
			justBeforeLockDown: justBeforeLockDown,
		})
	}
}
export class ChangeSizeOfMatrix extends GameRuleNormal {
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
			generateTerrain:(): Tetrimino[][]=>{
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

