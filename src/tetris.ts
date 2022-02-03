import { GameRule } from "./gameRule";
import { cloneArray, Enum, setCssVar, TouchScreenQuery } from "./general";
import { Action, BlockType, getMinosByAttr, getMovedMinos, getMovedShape, isTetrimino, Mino, MinoAttrsMap, Pos, Tetrimino, TileAttrs } from "./global";
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

	private _currentLevel: number = 1;
	
	private _currentMinos: Mino<TetriminoClass>[] = [];
	private _currentPos: Pos = {x:-1,y:-1};
	private _ghostMinos: Mino<TetriminoClass>[];

	private _followingMinos: TetriminoClass[];
	
	private _gameRule: GameRule<TetriminoClass>;
	
	private _minoEnum: Enum<TetriminoClass>;

	private _totalFallenTetrimino: number = 0;
	
	private _score: Map<Action, number>;
	
	private _fallTimer: TimerAbleToEsc
	= new TimerAbleToEsc(()=>{
		this.move(0,1);
	}, this.getFallingSpeed(this._currentLevel));
	private _lockDownTimer: TimerAbleToEsc = new TimerAbleToEsc(()=>{}, 500);
	
	private _isPausing: boolean = false;
	private _isSoftDrop: boolean;

	private _holdMinoType: TetriminoClass;
	
	constructor(gameRule: GameRule<TetriminoClass>) {
		this._gameRule = gameRule;
	}

	start(): void {
		this.arrangeToTetris();
		this.genPhase();
	}
	end(): void {
		this.clearHoldQueue();
		this.clearNextQueue();
	}

	arrangeToTetris(): void {
		this.displayMatrix();
		this.reset();
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
		return this._gameRule.matrixHeight;
	}
	get matrixWidth() {
		return this._gameRule.matrixWidth;
	}

	set currentPos(pos: Pos) {
		this._currentPos = pos;
	}

	get followingMinos() {
		return this._followingMinos;
	}
	set followingMinos(minos: TetriminoClass[]) {
		this._followingMinos = minos;
	}

	get isPausing(): boolean {
		return this._isPausing;
	}
	set isPausing(bool: boolean) {
		this._isPausing = bool;
	}

	get fallTimer() {
		return this._fallTimer;
	}
	get lockDownTimer() {
		return this._lockDownTimer;
	}

	get holdMinoType() {
		return this._holdMinoType;
	}
	set holdMinoType(type: TetriminoClass) {
		this._holdMinoType = type;
	}

	get fieldArray() {
		return this._fieldArray;
	}
	set fieldArray(array: TetriminoClass[][]) {
		this._fieldArray = array;
	}

	get totalFallenTetrimino() {
		return this._totalFallenTetrimino;
	}
	set totalFallenTetrimino(num: number) {
		this._totalFallenTetrimino = num;
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
		return (x>=0 && x<=this._gameRule.fieldWidth && y>=0 && y<=this._gameRule.fieldHeight);
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
	// display
	//

	displayMatrix(): void {
		let matrixText = "";
		this.setSizeOfMatrix()

		this.forEachMinoOnMatrix((pos) => {
				matrixText += "<div class='minos' data-x='"+pos.x+"' data-y='"+pos.y+"'></div>"
		})

		$('#field').html(matrixText);
	}

	displayAllMinos(): void {
		this.forEachMinoOnMatrix((pos) => {
				$('.minos[data-x="'+pos.x+'"][data-y="'+pos.y+'"]').attr('class','minos '+this._fieldArray[pos.y][pos.x]+"Minos placedMinos "+this._gameRule.cssClass);
		})
	}

	displayMino(mino: Mino<TetriminoClass>, blockType: BlockType): void;
	displayMino(mino: Mino<TetriminoClass>[], blockType: BlockType): void;
	displayMino(mino: Mino<TetriminoClass>|Mino<TetriminoClass>[], blockType: BlockType) {
		if (Array.isArray(mino)) {
			for (const amino of mino) {
				this.displayMino(amino, blockType);
			}
		} else {
			if (blockType === 'ghost') {
				if (mino.y< this._gameRule.bufferHeight) {
					return ;
				}
				const ghostText = "<div class='ghostMinos "+mino.mino+"GhostMinos "+this._gameRule.cssClass+"'></div>"
				$('.minos[data-x="'+mino.x+'"][data-y="'+mino.y+'"]').html(ghostText);
			} else {
				const classes: string = when(blockType)
										.on(v => v=='falling', () => 'minos '+mino.mino+"Minos fallingMinos "+this._gameRule.cssClass)
										.on(v => v=='placed', () => 'minos '+mino.mino+"Minos placedMinos "+this._gameRule.cssClass)
										.otherwise(() => 'undefinedBlock')
				$('.minos[data-x="'+mino.x+'"][data-y="'+mino.y+'"]').attr('class',classes);
				this.updateFieldArray(mino)
			}
		}
	}

	displayGhostMinos(): void {
		this.displayMino(this._ghostMinos, "ghost");
	}

	removeGhostMinos(): void {
		const formerGhost = cloneArray<Mino<TetriminoClass>>(this._ghostMinos)
		for (let tile of formerGhost) {
			this.removeGhostMino(tile)
		}
	}

	removeGhostMino(mino: Mino<TetriminoClass> | Pos): void {
		$('.minos[data-x="'+mino.x+'"][data-y="'+mino.y+'"]').html("");
	}

	//
	// various
	//

	reset() {
		this.clearHoldQueue();
		this.clearNextQueue();

		this.clearField();
	}

	/**
	 *
	 * @param {function} fn [fn(x,y)]
	 */
	forEachMinoOnMatrix(fn: (p:Pos)=>void) {
		for (let i = this._gameRule.bufferHeight-1; i < this._gameRule.fieldHeight; i++) {
			for (let j = 0; j < this._gameRule.fieldWidth; j++) {
				fn({x:j,y:i})
			}
		}
	}

	/**
	 *
	 * @param {function} fn [fn(x,y)]
	 */
	forEachMinoOnField(fn: (p:Pos)=>void) {
		for (let i = 0; i < this._gameRule.fieldHeight; i++) {
			for (let j = 0; j < this._gameRule.fieldWidth; j++) {
				fn({x:j,y:i})
			}
		}
	}

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
	updateDiffOfField(diff: Mino<TetriminoClass>[], blockType: BlockType) {
		for (const mino of diff) {
			this.displayMino(mino, blockType);
			if (blockType != 'ghost') {
				this.updateFieldArray(mino);
			}
		}
	}

	intoTetriMino(value: string): TetriminoClass
	intoTetriMino(value: string[]): TetriminoClass[]

	intoTetriMino(value: string | string[]): TetriminoClass | TetriminoClass[] | undefined {
		if (typeof value === 'string') {
			console.log(this._minoEnum);
			
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

	setSizeOfMatrix() {
		//$(':root').style.setProperty()
		setCssVar('--heightOfMatrix', this._gameRule.matrixHeight.toString());
		setCssVar('--widthOfMatrix', this._gameRule.matrixWidth.toString());
		if (TouchScreenQuery.matches){
			const sizeOfMino = 15 * 10 / this._gameRule.matrixWidth;
			//console.log(gameRuleOption.currentOption.matrixWidth,`sizeOfMino is ${sizeOfMino}`);
			setCssVar('--sizeOfMino', sizeOfMino + 'px');
	}
}

	resetField(): void {
		this._fieldArray = this._gameRule.generateTerrain();
	}
	clearField(): void {
		console.log(this);
		console.log(this);
		
		this.resetField();
		this.displayAllMinos();
	}

	clearHoldQueue() {
		// this._holdMinoType = this.intoTetriMino( getMinosByAttr("empty")[0]);
	}
	clearNextQueue() {
		this._followingMinos = [];
	}


}

let currentTetris: Tetris<Tetrimino>;