import { Tetrimino } from "./global";

export class TetriminoClass {
	private _tetriminos: string[];

	constructor(tetriminos: string[]) {
		this._tetriminos = tetriminos;
	}

	isTetrimino(str: string): str is Tetrimino {
		return this._tetriminos.includes(str);
	}

	get tetriminos() {
		return this._tetriminos;
	}
}