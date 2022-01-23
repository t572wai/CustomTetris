import { GameRule } from "./gameRule";
import { Enum } from "./general";
import { BlockType, getMinosByAttr, getMovedMinos, getMovedShape, isTetrimino, Mino, MinoAttrsMap, Pos, Tetrimino, TileAttrs } from "./global";
import { TimerAbleToEsc } from "./timerOfAbilityToEsc";
import { when } from "./when";

const PhaseTypeUnion = ['notStart', 'pause', 'gen', 'fall', 'lock', 'pattern', 'iterate', 'animate', 'eliminate', 'completion'] as const;
type PhaseType = typeof PhaseTypeUnion[number];

function isEmpty<TetrisminoClass>(mino: TetrisminoClass): boolean {
	if (isTetrimino(mino)) {
		if (mino == 'empty') return true;
	}
	return false;
}

//
// Tetris
//

export class Tetris<TetriminoClass extends string> {
	private _bag: TetriminoClass[];
	private _currentPhase: PhaseType = 'notStart';

	/**
	 *  TetriminoClassEnum[y][x] = Tetrimino
	 */
	private _fieldArray: TetriminoClass[][] = [];
	private _fieldAttrArray: TileAttrs[][] = [];

	private _matrixHeight: number = 20;
	private _matrixWidth: number = 10;
	private _bufferHeight: number= 5;
	private _bufferWidth: number = this._matrixWidth;
	private _fieldHeight: number = this._matrixHeight + this._bufferHeight;
	private _fieldWidth: number = this._matrixWidth;

	private _currentLevel: number = 1;

	private _isSoftDrop: boolean;

	private _currentMinos: Mino<TetriminoClass>[] = [];
	private _currentPos: Pos = {x:-1,y:-1};

	private _gameRule: GameRule<TetriminoClass>;

	private _minoEnum: Enum<TetriminoClass>;

	private _score: Map<ScoreOfAction, number>;

	private _fallTimer: TimerAbleToEsc
	= new TimerAbleToEsc(()=>{
		this.move(0,1);
	}, this.getFallingSpeed(this._currentLevel));
	private _lockDownTimer: TimerAbleToEsc = new TimerAbleToEsc(()=>{}, 500);

	constructor(gameRule: GameRule<TetriminoClass>) {
		this._gameRule = gameRule;
	}

	start(): void {
		this.arrangeToTetris();
		this.genPhase();
	}

	arrangeToTetris(): void {

	}

	genPhase(): Promise<any> {
		return new Promise((resolve, reject) => {
			this._currentPhase = 'gen';
			this.arrangeBag();
			this.placeToStartPos();
		})
		.then(() => {this.fallPhase()});
	}
	fallPhase(): Promise<void> {
		return new Promise<boolean>((resolve, reject) => {
			this._currentPhase = 'fall';
			this.fall();
		})
		.then((doHardDrop) => {(doHardDrop)?this.patternPhase():this.lockPhase()});
	}
	lockPhase(): Promise<void> {
		return new Promise<
			{isMoved:boolean,isThereSpaceToFall:boolean,didResetLockDownTimer:boolean}
		>((resolve, reject) => {
			this._currentPhase = 'lock';
		})
		.then(({isMoved,isThereSpaceToFall,didResetLockDownTimer}) => {
			if (isMoved) {
				if (isThereSpaceToFall) {
					this.fallPhase();
				} else {
					if (didResetLockDownTimer) {
						this.lockPhase();
					} else {
						this.patternPhase();
					}
				}
			} else {
				this.patternPhase();
			}
		});
	}
	patternPhase(): Promise<void> {
		return new Promise<boolean>((resolve, reject) => {
			this._currentPhase = 'pattern';
		})
		.then((didPatternMatch) => {
			if(didPatternMatch) {
				this.markBlockForDestruction()
			} else {
				this.iteratePhase()
			}
		});
	}
	markBlockForDestruction(): Promise<void> {
		return new Promise<void>((resolve, reject) => {})
					.then(() => this.iteratePhase());
	}
	iteratePhase(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this._currentPhase = 'iterate';
		})
					.then(() => this.animatePhase());
	}
	animatePhase(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this._currentPhase = 'animate';
		})
					.then(() => this.eliminatePhase());
	}
	eliminatePhase(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this._currentPhase = 'eliminate';
		})
					.then(() => this.completionPhase());
	}
	completionPhase(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this._currentPhase = 'completion';
		})
					.then(() => this.genPhase());
	}

	// 
	// genPhase
	// 

	arrangeBag(): void {

	}

	placeToStartPos(): void {

	}
	
	//
	// fallPhase
	//
	
	fall(): void {
		this._fallTimer.setTimeout()
	}

	canFall(): boolean {
		return this.canMove(getMovedMinos(this._currentMinos, 0, 1));
	}

	//
	// static
	//
	static FallingSpeed(level: number): number {
		return 1000*(0.8 - ((level-1) * 0.007))**(level-1);
	}
	
	//
	// attr
	//
	
	
	get matrixHeight() {
		return this._matrixHeight;
	}
	get matrixWidth() {
		return this._matrixWidth;
	}

	set currentPos(pos: Pos) {
		this._currentPos = pos;
	}
	
	isOtherTiles(tile: Mino<TetriminoClass> | Pos): boolean {
		if (this._fieldAttrArray[tile.y][tile.x] == 'empty') {
			if ( !this.isTetriminoVisible() ) return true;
			if ( !this._currentMinos.find((element) => {return element.x==tile.x && element.y==tile.y }) ) {
				return true;
			}
		}
		return false;
	}
	isOutOfField(x: number, y: number): boolean {
		return (x>=0 && x<=this._fieldWidth && y>=0 && y<=this._fieldHeight);
	}

	isTetriminoVisible(): boolean {
		return this._currentPhase=='fall'||this._currentPhase=='lock';
	}

	getReplacedMino(minos: Mino<TetriminoClass>[], type: TetriminoClass) {
		return minos.map(mino => ({x:mino.x, y:mino.y, mino: type}));
	}

	getFallingSpeed(level: number): number {
		const speedRate = (this._isSoftDrop)?0.05:1;
		return Tetris.FallingSpeed(level)*speedRate;
	}

	//
	// various
	//

	canMove(minos: Mino<TetriminoClass>[] | Pos[]): boolean {
		for (let tile of minos) {
			if (this.isOutOfField(tile.x,tile.y)) {
				return false;
			}
			if (this.isOtherTiles(tile)) {
				// console.log(tile);
				return false;
			}
		}
		return true;
	}

	move(dx: number, dy: number): boolean {
		const following = getMovedMinos(this._currentMinos,dx,dy);
		if (this.canMove(following)) {
			this.currentPos = {x:this._currentPos.x+dx,y:this._currentPos.y};
			this.relocate(following);
			return true;
		} else {
			return false;
		}
	}
	relocate(following: Mino<TetriminoClass>[]): void {
		this.hideCurrentMino();
		this.updateDiffOfField(following, 'falling')
	}

	hideCurrentMino() {
		const emptyMino = this.intoTetriMino(getMinosByAttr('empty'))[0]
		const anti = this.replaceMinoType(this._currentMinos, emptyMino);
		this.updateDiffOfField(anti, 'placed');
	}

	updateDiffOfField(diff: Mino<TetriminoClass>[], blockType: BlockType) {
		for (const mino of diff) {
			this.displayMino(mino, blockType);
			if (blockType != 'ghost') {
				this.updateFieldArray(mino);
			}
		}
	}

	displayMino(mino: Mino<TetriminoClass>, blockType: BlockType) {
		if (blockType === 'ghost') {
			
		} else {
			const classes: string = when(blockType)
									.on(v => v=='falling', () => 'minos '+mino.mino+"Minos fallingMinos "+this._gameRule.cssClass)
									.on(v => v=='placed', () => 'minos '+mino.mino+"Minos placedMinos "+this._gameRule.cssClass)
									.otherwise(() => 'undefinedBlock')
			$('.minos[data-x="'+mino.x+'"][data-y="'+mino.y+'"]').attr('class',classes);
		}
	}

	updateFieldArray(mino: Mino<TetriminoClass>) {
		this._fieldArray[mino.y][mino.x] = mino.mino;
		const minoAttr = MinoAttrsMap.get(mino.mino as string);
		if ( minoAttr == 'wall' || minoAttr == 'block') {
			this._fieldAttrArray[mino.y][mino.x] = 'filled';
		}
	}

	replaceMinoType(minos: Mino<TetriminoClass>[] | Pos[], type: TetriminoClass): Mino<TetriminoClass>[] {
		return minos.map((mino)=>({x: mino.x, y: mino.y, mino: type}));
	}

	intoTetriMino(value: string): TetriminoClass
	intoTetriMino(value: string[]): TetriminoClass[]

	intoTetriMino(value: string | string[]): TetriminoClass | TetriminoClass[] | undefined {
		if (typeof value === 'string') {
			if (this._minoEnum.isEnum(value)) {
				return value
			} else {
				return;
			}
		} else {
			let res: TetriminoClass[] = [];
			for (const str of value) {
				if (this._minoEnum.isEnum(str)) {
					res.push(str);
				}
			}
			return res;
		}
	}

	resetField(): void {
		this._fieldArray = this._gameRule.generateTerrain();
	}


}

let currentTetris: Tetris<Tetrimino>;