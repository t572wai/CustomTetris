import { cloneArray, Enum, toUpperFirstLetter } from "./general";

const TetriminoUnion = ['i','o','s','z','j','l','t','empty','wall'] as const;
export type Tetrimino = typeof TetriminoUnion[number];

export const TetriminoEnum:Enum<Tetrimino> = {
	defArray: TetriminoUnion,
	toEnum: (arg: any)=> {return arg as Tetrimino},
	toString: (arg: Tetrimino) => {return arg as string},
	getTitle: (arg: Tetrimino) => {return toUpperFirstLetter(arg as string)},
}

export type Pos = {
	x: number,
	y: number,
}

export type Mino = {
	x: number,
	y: number,
	mino: Tetrimino,
}

export const normalMatrixHeight: number = 20;
export const normalMatrixWidth: number = 10;

export const normalBufferHeight: number = 2;
export const normalBufferWidth:number = normalMatrixWidth;

export const normalFieldHeight: number = normalMatrixHeight + normalBufferHeight;
export const normalFieldWidth:number = normalMatrixWidth;

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

export function getMovedMinos(tiles: Pos[], dx: number, dy: number): Pos[] {
	return tiles.map((tile) => ({x:tile.x+dx,y:tile.y+dy}))
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