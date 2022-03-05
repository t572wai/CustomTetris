import { cloneArray, Enum, toUpperFirstLetter } from "./general";
import { InvertibleMap } from "./InversiveMap";
import { TetriminoClass } from "./tetrimino";

const TetriminoNormals = ['i','o','s','z','j','l','t','empty','wall'];
const TetriminoNormalAttrMap = new InvertibleMap<Tetrimino, TetriminoAttrs>();
TetriminoNormals.forEach((mino) => {
	if (mino=="empty") {
		TetriminoNormalAttrMap.set(mino, 'empty');
	} else if (mino=="wall") {
		TetriminoNormalAttrMap.set(mino, 'wall');
	} else {
		TetriminoNormalAttrMap.set(mino, 'block');
	}
})
const SkeletonsOfTetriminoNormal = new Map<Tetrimino,(-1|0|1)[][]>();
SkeletonsOfTetriminoNormal.set("i", [[1,0,1,1]]);
SkeletonsOfTetriminoNormal.set("o", [[1,1],[0,1]])
SkeletonsOfTetriminoNormal.set("s", [[-1,1,1],[1,0,-1]])
SkeletonsOfTetriminoNormal.set("z", [[1,1,-1],[-1,0,1]])
SkeletonsOfTetriminoNormal.set("j", [[1,-1,-1],[1,0,1]])
SkeletonsOfTetriminoNormal.set("l", [[-1,-1,1],[1,0,1]])
SkeletonsOfTetriminoNormal.set("t", [[-1,1,-1],[1,0,1]])
export const TetriminoNormal = new TetriminoClass(TetriminoNormals,TetriminoNormalAttrMap,SkeletonsOfTetriminoNormal);


export type Tetrimino = string;

const TileAttrsUnion = ['empty','filled', 'undefined'] as const;
export type TileAttrs = typeof TileAttrsUnion[number];

const TetriminoAttrsUnion = ['empty', 'block', 'wall', 'undefined'] as const;
export type TetriminoAttrs = typeof TetriminoAttrsUnion[number];

// export const MinoAttrsMap = new Map<string, MinoAttrs>();
// TetriminoNormalEnum.defArray.forEach((mino) => {
// 	if (mino=="empty") {
// 		MinoAttrsMap.set(mino, 'empty');
// 	} else if (mino=="wall") {
// 		MinoAttrsMap.set(mino, 'wall');
// 	} else {
// 		MinoAttrsMap.set(mino, 'block');
// 	}
// })
// export function getMinosByAttr(attr: MinoAttrs): string[] {
// 	let minos: string[] = [];
// 	for (const entry of MinoAttrsMap.entries()) {
// 		if (entry[1] == attr) {
// 			minos.push(entry[0]);
// 		}
// 	}
// 	return minos;
// }


export type Pos = {
	x: number,
	y: number,
}

export type Mino = {
	x: number,
	y: number,
	mino: Tetrimino,
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

// export const ShapesOfTetrimino = new Map<Tetrimino,number[][]>();
// ShapesOfTetrimino.set("i", [[1,0,1,1]]);
// ShapesOfTetrimino.set("o", [[1,1],[0,1]])
// ShapesOfTetrimino.set("s", [[-1,1,1],[1,0,-1]])
// ShapesOfTetrimino.set("z", [[1,1,-1],[-1,0,1]])
// ShapesOfTetrimino.set("j", [[1,-1,-1],[1,0,1]])
// ShapesOfTetrimino.set("l", [[-1,-1,1],[1,0,1]])
// ShapesOfTetrimino.set("t", [[-1,1,-1],[1,0,1]])

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

export function getMovedMinos(minos: Mino[], dx: number, dy: number): Mino[] {
	return minos.map((mino) => ({x:mino.x+dx,y:mino.y+dy,mino:mino.mino}));
}
export function getMovedShape(poses: Pos[], dx: number, dy: number): Pos[] {
	return poses.map((pos) => ({x:pos.x+dx,y:pos.y+dy}));
}
export function getRotatedMinos(minos: Mino[], shaft: Pos, direction: 0|1|2|3): Mino[] {
	if (direction==0) {
		return minos;
	} else if (direction==1) {
		return minos.map((mino) => ({x:shaft.x+shaft.y-mino.y,y:shaft.y-shaft.x+mino.x, mino: mino.mino}));
	} else if (direction==2) {
		return minos.map((mino) => ({x:2*shaft.x-mino.x, y:2*shaft.y-mino.y, mino:mino.mino}));
	} else {
		return minos.map((mino) => ({x:shaft.x-shaft.y+mino.y,y:shaft.y+shaft.x-mino.x, mino: mino.mino}));
	}
}
export function getRotatedShape(poses: Pos[], shaft: Pos, direction: 0|1|2|3): Pos[] {
	if (direction==0) {
		return poses;
	} else if (direction==1) {
		return poses.map((pos) => ({x:shaft.x+shaft.y-pos.y,y:shaft.y-shaft.x+pos.x}));
	} else if (direction==2) {
		return poses.map((pos) => ({x:2*shaft.x-pos.x, y:2*shaft.y-pos.y}));
	} else {
		return poses.map((pos) => ({x:shaft.x-shaft.y+pos.y,y:shaft.y+shaft.x-pos.x}));
	}
}
