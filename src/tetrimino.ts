import { Tetrimino, TetriminoAttrs } from "./global";
import { InvertibleMap } from "./InversiveMap";

export class TetriminoClass {
	private _tetriminos: string[];
	private _attrMap: InvertibleMap<Tetrimino, TetriminoAttrs>;

	constructor(tetriminos: string[]) {
		this._tetriminos = tetriminos;
	}

	isTetrimino(str: string): str is Tetrimino {
		return this._tetriminos.includes(str);
	}

	get tetriminos() {
		return this._tetriminos;
	}

	get attrMap() {
		return this._attrMap;
	}
}