const TetriminoUnion = ['i','o','s','z','j','l','t','empty','wall'] as const;
export type Tetrimino = typeof TetriminoUnion[number];

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
