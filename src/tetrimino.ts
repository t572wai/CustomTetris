import { getMovedShape, Mino, Pos, Tetrimino, TetriminoAttrs } from "./global";
import { InvertibleMap } from "./InversiveMap";

export class TetriminoClass {
	private _tetriminos: Tetrimino[];
	private _attrMap: InvertibleMap<Tetrimino, TetriminoAttrs>;
	private _skeltonMap: Map<Tetrimino, (0|1|-1)[][]>;

	constructor(
		tetriminos: string[],
		attrMap: InvertibleMap<Tetrimino, TetriminoAttrs>,
		skeltonMap: Map<Tetrimino, (-1|0|1)[][]>
		) {
		this._tetriminos = tetriminos;
		this._attrMap = attrMap;
		let hasOrigin = false;
		for (const value of skeltonMap.values()) {
			for (const skelton of value) {
				for (const num of skelton) {
					if (num==0) {
						if (hasOrigin) {
							throw new Error("A tetrimino has too many origins.");
						} else {
							hasOrigin = true;
						}
					}
				}
			}
		}
		if (hasOrigin) {
			this._skeltonMap = skeltonMap;
		} else {
			throw new Error("A tetrimino doesn't have any origin.");
			
		}
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

	get skeltonMap() {
		return this._skeltonMap;
	}

	getTetriminoShape(type: Tetrimino): Pos[] | null {
		let minoArray:Pos[] = [];
		const shape: (-1|0|1)[][] | undefined = this._skeltonMap.get(type);
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
}