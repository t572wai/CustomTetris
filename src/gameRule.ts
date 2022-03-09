import { Enum, shuffle } from "./general";
import { changeFacing, getMovedMinos, TileAttrs, normalBufferHeight, normalFieldHeight, normalFieldWidth, normalMatrixHeight, normalMatrixWidth, Pos, TetriminoNormal, getMovedShape, Tetrimino, Mino, TetriminoAttrs } from "./global";
import { InvertibleMap } from "./InversiveMap";
import { TetriminoClass } from "./tetrimino";
import { Tetris } from "./tetris";

export class GameRule {
	private _name: string;
	private _title: string;
	private _tetriminoClass: TetriminoClass;
	private _generateTerrain: ()=>Tetrimino[][];
	private _generateRegularlyTerrain: ()=>Tetrimino[];
	private _matrixHeight: number;
	private _matrixWidth: number;
	private _bufferHeight: number;
	private _bufferWidth: number;
	private _fieldHeight: number;
	private _fieldWidth: number;
	private _cssClass: string;
	private _nextNum: number;
	private _shouldGenerateTetriminos: (array: Tetrimino[])=>boolean;
	private _generateNextTetriminos: (array: Tetrimino[])=>Tetrimino[];
	private _arrangeFirstSituation: (data?: any)=>void;
	private _arrangeSituation: (data?:any)=>void;
	private _shouldResetLockDownTimer: (numberOfMoved?: number)=>boolean;
	private _data: any;
	private _getterOfData: (data:any)=>any;
	private _setterOfData: (data:any)=>any;
	private _rotationRule: Map<Tetrimino, Pos[][][]>;
	private _getDifOfShaft: (shape: string, facing: 0|1|2|3)=>Pos;
	private _justBeforeLockDown: (data:any)=>boolean;

	constructor(
		{
			name,
			title,
			tetriminoClass,
			generateTerrain = ()=>{
				let terrainArray:Tetrimino[][] = [];
				for (let i = 0; i < normalFieldHeight; i++) {
					terrainArray.push(new Array(normalFieldWidth).fill(tetriminoClass.attrMap.getKeysFromValue('empty')![0]));
				}
				return terrainArray;
			},
			generateRegularlyTerrain = ()=>{
				return Array(normalFieldWidth).fill(tetriminoClass.attrMap.getKeysFromValue("empty")[0]);
			},
			matrixHeight = normalMatrixHeight,
			matrixWidth = normalMatrixWidth,
			bufferHeight = normalBufferHeight,
			cssClass = "",
			nextNum = tetriminoClass.tetriminos.length-1,
			shouldGenerateTetriminos = (followingMinos: Tetrimino[]) => {
				return followingMinos.length < nextNum + 1
			},
			generateNextTetriminos = (array: Tetrimino[]) => {
				//ミノをランダムにソート
				const nextMinos = shuffle(tetriminoClass.tetriminos as Tetrimino[]);
				return array.concat(nextMinos);
			},
			arrangeFirstSituation = ()=>{},
			arrangeSituation = () => {},
			shouldResetLockDownTimer = (numOfMoved?: number)=>{return numOfMoved!<15},
			getterOfData = (data: any)=>{return null},
			setterOfData = (data: any)=>{return null},
			rotationRule,
			getDifOfShaft = (shape: string, facing: 0|1|2|3): Pos => {
				if (tetriminoClass.getTetriminoWidth(shape)%2==0) {
					if (tetriminoClass.getTetriminoHeight(shape)%2==0) {
						switch (facing) {
							case 0:
								return {x:0,y:0};
							case 1:
								return {x:0,y:-1};
							case 2:
								return {x:1,y:-1};
							case 3:
								return {x:1,y:0};
						}
					} else {
						switch (facing) {
							case 0:
								return {x:0,y:0};
							case 1:
								return {x:1,y:0};
							case 2:
								return {x:1,y:1};
							case 3:
								return {x:0,y:1};
						}
					}
				} else {
					return {x:0,y:0};
				}
			},
			justBeforeLockDown = ()=>{return true;},
		}:
		{
			name: string,
			title: string,
			tetriminoClass:  TetriminoClass,
			generateTerrain?: ()=>Tetrimino[][],
			generateRegularlyTerrain?: ()=>Tetrimino[],
			matrixHeight?: number,
			matrixWidth?: number,
			bufferHeight?: number,
			cssClass?: string,
			nextNum?: number,
			shouldGenerateTetriminos?: (array: Tetrimino[])=>boolean,
			generateNextTetriminos: (array: Tetrimino[])=>Tetrimino[],
			arrangeFirstSituation?: (data?: any)=>void,
			arrangeSituation?: (data?: any)=>void,
			shouldResetLockDownTimer?: (numOfMoved?: number)=>boolean,
			getterOfData?: (data:any)=>any,
			setterOfData?: (data:any)=>any,
			rotationRule: Map<Tetrimino, Pos[][][]>,
			getDifOfShaft?: (shape: string, facing: 0|1|2|3) => Pos,
			justBeforeLockDown?: (data: any)=>boolean,
		}
		) {
			this._name = name;
			this._title = title;

			this._tetriminoClass = tetriminoClass;

			this._generateTerrain = generateTerrain;
			this._generateRegularlyTerrain = generateRegularlyTerrain;

			this._matrixHeight = matrixHeight;
			this._matrixWidth = matrixWidth;
			this._bufferHeight = bufferHeight;
			this._bufferWidth = this._matrixWidth;
			this._fieldHeight = this._matrixHeight + this._bufferHeight;
			this._fieldWidth = this._matrixWidth;

			this._cssClass = cssClass;

			this._nextNum = nextNum;
			this._shouldGenerateTetriminos = shouldGenerateTetriminos;
			this._generateNextTetriminos = generateNextTetriminos;

			this._arrangeFirstSituation = arrangeFirstSituation;
			this._arrangeSituation = arrangeSituation;

			this._shouldResetLockDownTimer = shouldResetLockDownTimer;

			this._getterOfData = getterOfData;
			this._setterOfData = setterOfData;

			this._rotationRule = rotationRule;
			this._getDifOfShaft = getDifOfShaft;

			this._justBeforeLockDown = justBeforeLockDown;
	}

	public static Normal: GameRule = new GameRule({
		name:'normal',
		title:'Normal',
		tetriminoClass: TetriminoNormal,
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
		shouldResetLockDownTimer: (numOfMoved?: number)=>{return numOfMoved!<15},
		getterOfData: (data: any)=>{return null},
		setterOfData: (data: any)=>{return null},
		rotationRule: setRegulatedSpinRule(
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
		justBeforeLockDown: ()=>{return true},
	})

	get tetriminoClass() {
		return this._tetriminoClass;
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
	get shouldResetLockDownTimer() {
		return this._shouldResetLockDownTimer;
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
	get rotationRule() {
		return this._rotationRule;
	}
	get getDifOfShaft() {
		return this._getDifOfShaft;
	}

	get justBeforeLockDown() {
		return this._justBeforeLockDown;
	}

	static toString(rule: GameRule): string{
		return rule._name;
	}

	static getTitle(rule: GameRule): string{
		return rule._title;
	}

	static generateGameRule(name: string, title: string, tetriminoBases: Map<string, (-1|1)[][]>): GameRule {
		const tetriminos = Array.from(tetriminoBases.keys()).concat(["empty","wall"]);
		let tetriminoAttrMap = new InvertibleMap<Tetrimino, TetriminoAttrs>();
		for (const tetrimino of tetriminoBases.keys()) {
			tetriminoAttrMap.set(tetrimino, "block");
		}
		tetriminoAttrMap.set("empty", "empty");
		tetriminoAttrMap.set("wall", "wall");

		let tetriminoSkeletonMap = new Map<Tetrimino, (-1|0|1)[][]>();
		let maxBreadth = -1;
		let maxHeight = -1;
		for (const tetriminoBase of tetriminoBases) {
			const shape = tetriminoBase[1];
			const width = shape[0].length;
			const height = shape.length;
			if (maxBreadth < width) {
				maxBreadth = width;
			}
			if (maxBreadth < height) {
				maxBreadth = height;
			}
			if (maxHeight < height) {
				maxHeight = height;
			}
			let skeleton = shape as (-1|0|1)[][];
			skeleton[Math.floor((height-1)/2)][Math.floor((width-1)/2)] = 0;
			tetriminoSkeletonMap.set(tetriminoBase[0], skeleton);
		}

		const tetriminoClass = new TetriminoClass(tetriminos, tetriminoAttrMap, tetriminoSkeletonMap);

		const matrixWidth = 2 * ( maxBreadth + 1 );
		const matrixHeight = 2 * matrixWidth;
		const bufferHeight = maxHeight;
		const cssClass = title;

		const csses = Array.from(tetriminoBases.keys()).map(key => `.${key}Minos.${cssClass}`);
		const colors = ["#348fca", "#e7bd22", "#2aa55d", "#da4b3c", "#246eab", "#dc7a23", "#824597"];
		GameRule.setColor(csses, colors);

		const generateNextTetriminos = (array: Tetrimino[]) => {
			//ミノをランダムにソート
			const nextMinos = shuffle(Array.from(tetriminoBases.keys()) as Tetrimino[]);
			return array.concat(nextMinos);
		}

		let rotationRule = new Map<Tetrimino, Pos[][][]>();

		const generatedGameRule = new GameRule({
			name: name,
			title: title,
			tetriminoClass: tetriminoClass,
			matrixHeight: matrixHeight,
			matrixWidth: matrixWidth,
			bufferHeight: bufferHeight,
			cssClass: cssClass,
			generateNextTetriminos: generateNextTetriminos,
			rotationRule: rotationRule,
		})

		return generatedGameRule;
	}

	static setColor(csses: string[],colors: string[]): void {
		let style = "<style type='text/css'>";
		csses.forEach((css, i) => {
			let indOfColors = (colors.length>i)?i:(i%colors.length);
			style += `${css} {background-color: ${colors[i]};}`;
		});
		style += "</style>";
		$('head').append(style);
	}

	static getRegularRotationRule(width: number, height: number): Pos[][][] {
		return [[[{x:0,y:0}]]]
	}
}

export class GameRuleNormal extends GameRule {
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
			shouldResetLockDownTimer = GameRule.Normal.shouldResetLockDownTimer,
			getterOfData = GameRule.Normal.getterOfData,
			setterOfData = GameRule.Normal.setterOfData,
			rotationRule = GameRule.Normal.rotationRule,
			getDifOfShaft = GameRule.Normal.getDifOfShaft,
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
			shouldResetLockDownTimer?: (numOfMoved?: number)=>boolean,
			getterOfData?: (data:any)=>any,
			setterOfData?: (data:any)=>any,
			rotationRule?: Map<Tetrimino, Pos[][][]>,
			getDifOfShaft?: (shape: string, facing: 0|1|2|3)=>Pos,
			justBeforeLockDown?: (data: any)=>boolean,
		}) {
		super({
			name: name,
			title: title,
			tetriminoClass: TetriminoNormal,
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
			shouldResetLockDownTimer: shouldResetLockDownTimer,
			getterOfData: getterOfData,
			setterOfData: setterOfData,
			rotationRule: rotationRule,
			getDifOfShaft: getDifOfShaft,
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
	TetriminoNormal.tetriminos.forEach((type) => {
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

