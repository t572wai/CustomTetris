import { GameRule } from "./gameRule";
import { cloneArray, Enum, setCssVar, shuffle, TouchScreenQuery } from "./general";
import { Action, BlockType, getMovedMinos, getMovedShape, Mino, Pos, Tetrimino, TetriminoNormal, TileAttrs } from "./global";
import { TetriminoClass } from "./tetrimino";
import { TimerAbleToEsc } from "./timerOfAbilityToEsc";
import { when } from "./when";

const PhaseTypeUnion = ['notStart', 'pause', 'gen', 'fall', 'lock', 'pattern', 'iterate', 'animate', 'eliminate', 'completion'] as const;
type PhaseType = typeof PhaseTypeUnion[number];

// function isEmpty(mino: Tetrimino): boolean {
// 	if (isTetriminoNormal(mino)) {
// 		if (mino == 'empty') return true;
// 	}
// 	return false;
// }

//
// Tetris
//

export class Tetris {
	private _bag: Tetrimino[] = [];
	private _currentPhase: PhaseType = 'notStart';

	/**
	 *  TetriminoClassEnum[y][x] = Tetrimino
	 */
	private _fieldArray: Tetrimino[][] = [];
	// private _fieldAttrArray: TileAttrs[][] = [];

	private _currentLevel: number = 1;
	
	// private _currentSkeleton: (-1|0|1)[] = [];
	private _currentMinoType: Tetrimino;
	private _currentMinoShape: Tetrimino;
	private _currentPos: Pos = {x:-1,y:-1};
	private _ghostMinos: Mino[];

	private _followingMinos: Tetrimino[];
	
	private _gameRule: GameRule;
	
	// private _minoEnum: Enum<TetriminoClass>;

	private _totalFallenTetrimino: number = 0;
	
	private _score: Map<Action, number>;
	
	private _timerToFall: TimerAbleToEsc
	= new TimerAbleToEsc(()=>{
		this.move(0,1);
	}, this.getFallingSpeed(this._currentLevel));
	private _lockDownTimer: TimerAbleToEsc = new TimerAbleToEsc(()=>{}, 500);
	
	private _isPausing: boolean = false;
	private _isSoftDrop: boolean;

	private _holdMinoType: Tetrimino;
	
	constructor(gameRule: GameRule) {
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
		console.log(this._fieldArray);
		
	}

	async genPhase(): Promise<void> {
		console.log('genPhase');
		
		await new Promise<void>((resolve, reject) => {

			this._currentPhase = 'gen';
			this.arrangeBag();
			this.placeToStartPos();
			resolve();
		});
		this.fallPhase();
	}
	async fallPhase(): Promise<void> {
		console.log('fallPhase');
		
		const doHardDrop = await new Promise<boolean>(async (resolve, reject) => {
			this._currentPhase = 'fall';
			await this.fallingPromise();
			resolve(false);
		});
		(doHardDrop) ? this.patternPhase() : this.lockPhase();
	}
	async lockPhase(): Promise<void> {
		console.log('lockPhase');
		
		const { isMoved, isThereSpaceToFall, didResetLockDownTimer } = await new Promise<
			{ isMoved: boolean; isThereSpaceToFall: boolean; didResetLockDownTimer: boolean; }
		>((resolve, reject) => {
			this._currentPhase = 'lock';
			resolve({ isMoved: false, isThereSpaceToFall: true, didResetLockDownTimer: false });
		});
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
	}
	async patternPhase(): Promise<void> {
		console.log('patternPhase');
		
		const didPatternMatch = await new Promise<boolean>((resolve, reject) => {
			this._currentPhase = 'pattern';
			resolve(false);
		});
		if (didPatternMatch) {
			this.markBlockForDestruction();
		} else {
			this.iteratePhase();
		}
	}
	async markBlockForDestruction(): Promise<void> {
		console.log('markBlockForDestruction');
		
		await new Promise<void>((resolve, reject) => { resolve(); });
		return await this.iteratePhase();
	}
	async iteratePhase(): Promise<void> {
		console.log('iteratePhase');
		
		await new Promise<void>((resolve, reject) => {
			this._currentPhase = 'iterate';
		});
		return await this.animatePhase();
	}
	async animatePhase(): Promise<void> {
		console.log('animatePhase');
		
		await new Promise<void>((resolve, reject) => {
			this._currentPhase = 'animate';
		});
		return await this.eliminatePhase();
	}
	async eliminatePhase(): Promise<void> {
		console.log('eliminatePhase');
		
		await new Promise<void>((resolve, reject) => {
			this._currentPhase = 'eliminate';
		});
		return await this.completionPhase();
	}
	async completionPhase(): Promise<void> {
		console.log('completionPhase');
		
		await new Promise<void>((resolve, reject) => {
			this._currentPhase = 'completion';
		});
		return await this.genPhase();
	}

	// 
	// genPhase
	// 

	
	placeToStartPos(): void {
		this.arrangeBag();
		this.initTetrimino({'type':this._bag[0]});
		this.displayMino(this.currentMinos(),'falling');
	}
	
	shouldArrangeBag(): boolean {
		return this._bag.length < this._gameRule.nextNum;
	}
	arrangeBag(): void {
		if (this.shouldArrangeBag()) {
			console.log('arrange bag');
			const nextMinos = shuffle(this._gameRule.tetriminoClass.attrMap.getKeysFromValue("block"));
			this._bag = this._bag.concat(nextMinos);
		}
	}
	
	//
	// fallPhase
	//
	async fallingPromise(): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			console.log("falling");
			resolve(this.fall());
		}).then(async () => {
			console.log("can fall", this.canFall());
			if (this.canFall()) {
				await this.fallingPromise();
			}
		})
	}
	
	fall(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this._timerToFall = new TimerAbleToEsc(()=>{
									this.move(0,1);
									resolve();
								}, this.getFallingSpeed(this._currentLevel));
			this._timerToFall.setTimeout();
		})
	}

	canFall(): boolean {
		return this.canMove(getMovedMinos(this.currentMinos(), 0, 1));
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
	set currentPos(pos: Pos) {
		this._currentPos = pos;
	}

	get followingMinos() {
		return this._followingMinos;
	}
	set followingMinos(minos: Tetrimino[]) {
		this._followingMinos = minos;
	}

	get isPausing(): boolean {
		return this._isPausing;
	}
	set isPausing(bool: boolean) {
		this._isPausing = bool;
	}

	get fallTimer() {
		return this._timerToFall;
	}
	get lockDownTimer() {
		return this._lockDownTimer;
	}

	get holdMinoType() {
		return this._holdMinoType;
	}
	set holdMinoType(type: Tetrimino) {
		this._holdMinoType = type;
	}

	get fieldArray() {
		return this._fieldArray;
	}
	set fieldArray(array: Tetrimino[][]) {
		this._fieldArray = array;
	}

	get totalFallenTetrimino() {
		return this._totalFallenTetrimino;
	}
	set totalFallenTetrimino(num: number) {
		this._totalFallenTetrimino = num;
	}

	currentMinos(): Mino[] {
		const minoBase = Tetris.replaceMinoType(this._gameRule.tetriminoClass.getTetriminoShape(this._currentMinoShape)!,this._currentMinoType)
		return getMovedMinos(minoBase, this._currentPos.x, this._currentPos.y);
	}
	
	isOtherTiles(tile: Mino | Pos): boolean {
		if (this._gameRule.tetriminoClass.attrMap.get(this._fieldArray[tile.y][tile.x]) != 'empty') {
			if ( !this.isTetriminoVisible() ) return true;
			if ( !this.currentMinos().some((element) => {return element.x==tile.x && element.y==tile.y }) ) {
				console.log(this.currentMinos());
				
				return true;
			}
		}
		return false;
	}
	isOutOfField(x: number, y: number): boolean {
		return (x<0 || x>=this._gameRule.fieldWidth || y<0 || y>=this._gameRule.fieldHeight);
	}

	isTetriminoVisible(): boolean {
		console.log("is visible",this._currentPhase=='fall'||this._currentPhase=='lock');
		
		return this._currentPhase=='fall'||this._currentPhase=='lock';
	}

	getReplacedMino(minos: Mino[], type: Tetrimino) {
		return minos.map(mino => ({x:mino.x, y:mino.y, mino: type}));
	}

	getFallingSpeed(level: number): number {
		const speedRate = (this._isSoftDrop)?0.05:1;
		return Tetris.FallingSpeed(level)*speedRate;
	}

	//
	// static
	//
	static getMirrorField(field: readonly Tetrimino[][]) {
		let mirrorArray = [] as Tetrimino[][];

		for (const line of field) {
			mirrorArray.push(line.reverse())
		}

		return mirrorArray;
	}

	static getMirrorFieldAtRnd(field: Tetrimino[][]): Tetrimino[][] {
		const rnd = Math.floor(Math.random() * 2);

		if (rnd == 0) {
			return field;
		} else {
			return Tetris.getMirrorField(field);
		}
	}

	static replaceMinoType(minos: Mino[] | Pos[], type: Tetrimino): Mino[] {
		return minos.map((mino)=>({x: mino.x, y: mino.y, mino: type}));
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

	displayMino(mino: Mino, blockType: BlockType): void;
	displayMino(mino: Mino[], blockType: BlockType): void;
	displayMino(mino: Mino|Mino[], blockType: BlockType) {
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
		const formerGhost = cloneArray<Mino>(this._ghostMinos)
		for (let tile of formerGhost) {
			this.removeGhostMino(tile)
		}
	}

	removeGhostMino(mino: Mino | Pos): void {
		$('.minos[data-x="'+mino.x+'"][data-y="'+mino.y+'"]').html("");
	}

	//
	// various
	//

	initTetrimino({type,shape=type}:{type:Tetrimino,shape?:Tetrimino}): void {
		this._currentMinoType = type;
		this._currentMinoShape = shape;
		this._currentPos = {x:Math.floor(this._gameRule.matrixWidth/2),y:this._gameRule.bufferHeight-1};
		// this._currentSkeleton = this._gameRule.tetriminoClass.getTetriminoShape(shape)!;
		// console.log(type,shape,this._currentTiles,this._gameRule.tetriminoClass);
	}

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

	canMove(minos: Mino[] | Pos[]): boolean {
		for (let tile of minos) {
			if (this.isOutOfField(tile.x,tile.y)) {
				console.log("out of field", tile.x, tile.y);
				
				return false;
			}
			if (this.isOtherTiles(tile)) {
				console.log("other tile", tile.x, tile.y);
				// console.log(tile);
				return false;
			}
		}
		return true;
	}

	move(dx: number, dy: number): boolean {
		const following = getMovedMinos(this.currentMinos(),dx,dy);
		if (this.canMove(following)) {
			this.currentPos = {x:this._currentPos.x+dx,y:this._currentPos.y+dy};
			this.relocate(following);
			return true;
		} else {
			return false;
		}
	}
	relocate(following: Mino[]): void {
		this.hideCurrentMino();
		this.updateDiffOfField(following, 'falling')
	}

	hideCurrentMino() {
		const emptyMino = this._gameRule.tetriminoClass.attrMap.getKeysFromValue('empty')[0];
		const anti = Tetris.replaceMinoType(this.currentMinos(), emptyMino);
		console.log(anti);
		
		this.updateDiffOfField(anti, 'placed');
	}

	updateFieldArray(mino: Mino) {
		this._fieldArray[mino.y][mino.x] = mino.mino;
		const minoAttr = this._gameRule.tetriminoClass.attrMap.get(mino.mino as string);
		// if ( minoAttr == 'wall' || minoAttr == 'block') {
		// 	this._fieldAttrArray[mino.y][mino.x] = 'filled';
		// }
	}

	updateDiffOfField(diff: Mino[], blockType: BlockType) {
		for (const mino of diff) {
			this.displayMino(mino, blockType);
			if (blockType != 'ghost') {
				this.updateFieldArray(mino);
			}
		}
	}

	// intoTetriMino(value: string): Tetrimino
	// intoTetriMino(value: string[]): Tetrimino[]

	// intoTetriMino(value: string | string[]): Tetrimino | Tetrimino[] | undefined {
	// 	if (typeof value === 'string') {
	// 		console.log(this._gameRule.TetriminoEnum);
			
	// 		if (this._gameRule.TetriminoEnum.isEnum(value)) {
	// 			return value
	// 		} else {
	// 			return;
	// 		}
	// 	} else {
	// 		let res: Tetrimino[] = [];
	// 		for (const str of value) {
	// 			if (this._gameRule.TetriminoEnum.isEnum(str)) {
	// 				res.push(str);
	// 			}
	// 		}
	// 		return res;
	// 	}
	// }

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