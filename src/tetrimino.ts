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
			hasOrigin = false;
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
			if (!hasOrigin) {
				throw new Error("A tetrimino doesn't have any origin.");
			}
		}
		this._skeltonMap = skeltonMap;
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

	getTetriminoHeight(type: Tetrimino):number {
		const shape = this._skeltonMap.get(type);
		return (shape)?shape.length:0;
	}
	getTetriminoWidth(type: Tetrimino): number {
		const shape = this._skeltonMap.get(type);
		if (shape) {
			if (shape[0]) {
				return shape[0].length;
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	}

	getMaxTetriminoHeight():number {
		let maxHeight = 0;
		for (const tetrimino of this._tetriminos) {
			const height = this.getTetriminoHeight(tetrimino);
			if (maxHeight < height)maxHeight = height;
		}
		return maxHeight;
	}
	getMaxTetriminoWidth():number {
		let maxWidth = 0;
		for (const tetrimino of this._tetriminos) {
			const width = this.getTetriminoWidth(tetrimino);
			if (maxWidth < width)maxWidth = width;
		}
		return maxWidth;
	}

	getStandaloneTetriminoText(type: Tetrimino):string {
		let text = "<div class='displayers'>";
		for (const rows of this.getStandaloneTetriminoArray(type)) {
			for (const num of rows) {
				if (num==-1) {
					text += '<div class="minos emptyMinos"></div>';
				} else {
					text += '<div class="minos '+type+'Minos"></div>';
				}
			}
		}
		text += "</div>";
		return text;
	}
	getStandaloneTetriminoArray(type: Tetrimino):(-1|0|1)[][] {
		let res = [] as (-1|0|1)[][];
		const maxHeight = this.getMaxTetriminoHeight();
		const maxWidth = this.getMaxTetriminoWidth();
		for (const rows of this._skeltonMap.get(type)!) {
			if (rows.length < maxWidth) {
				res.push(rows.concat(new Array(maxWidth-rows.length).fill(-1)));
			} else {
				res.push(rows);
			}
		}
		if (res.length < maxHeight) {
			res = res.concat(new Array(maxHeight-res.length).fill(new Array(maxWidth).fill(-1)));
		}
		return res;
	}
}