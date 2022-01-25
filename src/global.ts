import { cloneArray, Enum, toUpperFirstLetter } from "./general";

export const TetriminoUnion = ['i','o','s','z','j','l','t','empty','wall'] as const;
export type Tetrimino = typeof TetriminoUnion[number];

export function isTetrimino(value: any): value is Tetrimino{
	if (typeof value === "string") {
		return TetriminoUnion.includes(value as Tetrimino);
	}
	return false;
}

export const TetriminoEnum:Enum<Tetrimino> = {
	defArray: TetriminoUnion,
	isEnum: isTetrimino,
	toString: (arg: Tetrimino) => {return arg as string},
	getTitle: (arg: Tetrimino) => {return toUpperFirstLetter(arg as string)},
}

const TileAttrsUnion = ['empty','filled', 'undefined'] as const;
export type TileAttrs = typeof TileAttrsUnion[number];

const MinoAttrsUnion = ['empty', 'block', 'wall', 'undefined'] as const;
export type MinoAttrs = typeof MinoAttrsUnion[number];

export const MinoAttrsMap = new Map<string, MinoAttrs>();
TetriminoEnum.defArray.forEach((mino) => {
	if (mino=="empty") {
		MinoAttrsMap.set(mino, 'empty');
	} else if (mino=="wall") {
		MinoAttrsMap.set(mino, 'wall');
	} else {
		MinoAttrsMap.set(mino, 'block');
	}
})
export function getMinosByAttr(attr: MinoAttrs): string[] {
	let minos: string[] = [];
	for (const entry of MinoAttrsMap.entries()) {
		if (entry[1] == attr) {
			minos.push(entry[0]);
		}
	}
	return minos;
}


export type Pos = {
	x: number,
	y: number,
}

export type Mino<TetriminoClass> = {
	x: number,
	y: number,
	mino: TetriminoClass,
}

const BlockTypeUnion = ["falling","placed","ghost"] as const;
export type BlockType = typeof BlockTypeUnion[number];

export const normalMatrixHeight: number = 20;
export const normalMatrixWidth: number = 10;

export const normalBufferHeight: number = 2;
export const normalBufferWidth:number = normalMatrixWidth;

export const normalFieldHeight: number = normalMatrixHeight + normalBufferHeight;
export const normalFieldWidth:number = normalMatrixWidth;

const Actions = ['none','single','double','triple','tetris','mini_tspin','mini_tspin_single','tspin','tspin_single','tspin_double','tspin_triple','back_to_back','softDrop','hardDrop','ren','singlePerfectClear','doublePerfectClear','triplePerfectClear','tetrisPerfectClear','tetrisBtoBPerfectClear'] as const;
export type Action = typeof Actions[number];
export const Operations = ['left','right','hardDrop','softDrop','leftRotation','rightRotation','hold'] as const;
export type Operate = typeof Operations[number];

export function getMirrorField(field: readonly Tetrimino[][]) {
	let mirrorArray = [] as Tetrimino[][];

	for (const line of field) {
		mirrorArray.push(line.reverse())
	}

	return mirrorArray;
}

export function getMirrorFieldAtRnd(field: Tetrimino[][]): Tetrimino[][] {
	const rnd = Math.floor(Math.random() * 2);

	if (rnd == 0) {
		return field;
	} else {
		return getMirrorField(field);
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

export function getMovedMinos<T>(minos: Mino<T>[], dx: number, dy: number): Mino<T>[] {
	return minos.map((mino) => ({x:mino.x+dx,y:mino.y+dy,mino:mino.mino}))
}
export function getMovedShape(poses: Pos[], dx: number, dy: number): Pos[] {
	return poses.map((pos) => ({x:pos.x+dx,y:pos.y+dy}));
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
		return getMovedShape(minoArray,-originPos.x,-originPos.y);
	} else {
		return null;
	}
}