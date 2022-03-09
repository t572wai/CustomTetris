import { GameRule } from "./gameRule";
import { cloneArray, Enum, hasTouchScreen, setCssVar, shuffle } from "./general";
import { Action, BlockType, getMovedMinos, getMovedShape, getRotatedMinos, Mino, Pos, Tetrimino, TetriminoAttrs, TetriminoNormal, TileAttrs } from "./global";
import { InvertibleMap } from "./InversiveMap";
import { TetriminoClass } from "./tetrimino";
import { TimerAbleToEsc } from "./timerOfAbilityToEsc";
import { when } from "./when";

const PhaseTypeUnion = ['notStart', 'pause', 'gen', 'fall', 'lock', 'pattern', 'iterate', 'animate', 'eliminate', 'completion'] as const;
type PhaseType = typeof PhaseTypeUnion[number];

const PatternsUnion = ['line'] as const;
type Patterns = typeof PatternsUnion[number];

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
	private _ghostMinos: Mino[] = [];
	private _ghostPos: Pos = {x:-1,y:-1};
	private _currentFacing: 0|1|2|3 = 0;

	// private _followingMinos: Tetrimino[];
	
	private _gameRule: GameRule;
	
	// private _minoEnum: Enum<TetriminoClass>;

	private _totalFallenTetrimino: number = 0;
	private _totalClearedLine: number = 0;
	
	private _score: Map<Action, number> = new Map();

	private _patterns: Map<Patterns, Pos[]> = new Map();
	
	private _timerToFall: TimerAbleToEsc
	= new TimerAbleToEsc(()=>{
		this.move(0,1);
	}, this.getFallingSpeed(this._currentLevel));
	private _lockDownTimer: TimerAbleToEsc = new TimerAbleToEsc(()=>{}, 500);
	
	private _rejectPhase: (reason?: any) => void;

	private _isPausing: boolean = false;
	private _isSoftDrop: boolean;

	private _hardDropFunc: ()=>void = ()=>{};
	private _onPressedSoftDropFunc: ()=>void = ()=>{};

	private _numOfOperationsInLockDownPhase: number = 0;
	private _lowerPos: number = -1;
	private _onOperationFunc: (value: any) => void = ()=>{};

	private _holdMinoType: Tetrimino;
	private _canHold: boolean = true;
	
	constructor(gameRule: GameRule) {
		this._gameRule = gameRule;
		this._holdMinoType = this._gameRule.tetriminoClass.attrMap.getKeysFromValue("empty")[0];
	}

	start(): void {
		this.arrangeToTetris();
		this._gameRule.arrangeFirstSituation();
		console.log(this._bag,this._fieldArray);
		
		this.genPhase(true);
	}
	end(): void {
		this.clearHoldQueue();
		this.clearNextQueue();
	}

	arrangeToTetris(): void {
		this.displayMatrix();
		this.reset();
		this._gameRule.tetriminoClass.setDisplayersCSS();
		console.log(this._fieldArray);
	}

	async genPhase(canHold: boolean): Promise<void> {
		console.log('genPhase');
		
		await new Promise<void>((resolve, reject) => {

			this._currentPhase = 'gen';
			this._rejectPhase = reject;
			this.arrangeBag();
			this.placeToStartPos();
			this.relocateGhost();
			this.resetPatterns();
			this._canHold = canHold;
			this._numOfOperationsInLockDownPhase = 0;
			this._lowerPos = 0;
			resolve();
		});
		this.fallPhase();
	}
	async fallPhase(): Promise<void> {
		console.log('fallPhase');
		
		const doHardDrop = await new Promise<boolean>(async (resolve, reject) => {
			this._currentPhase = 'fall';
			this._rejectPhase = reject;
			this._timerToFall.clearTimeout();
			if (this.canFall()) {
				resolve(await this.fallingPromise());
			} else {
				resolve(false);
			}
		});
		(doHardDrop) ? this.patternPhase() : this.lockPhase();
	}
	async lockPhase(): Promise<void> {
		console.log('lockPhase');
		
		// const { isMoved, isThereSpaceToFall, didResetLockDownTimer } = 
		await new Promise<
			{ isMoved: boolean; isThereSpaceToFall: boolean; didResetLockDownTimer: boolean; }
		>((resolve, reject) => {
			this._currentPhase = 'lock';
			this._rejectPhase = reject;
			this._timerToFall.clearTimeout();
			this._lockDownTimer.clearTimeout();
			if (!this._gameRule.shouldResetLockDownTimer(this._numOfOperationsInLockDownPhase)) {
				resolve({isMoved: false, isThereSpaceToFall: false, didResetLockDownTimer: false});
			}
			this._onOperationFunc = resolve;
			this._lockDownTimer.endCb = () => {
				resolve({isMoved: false, isThereSpaceToFall: false, didResetLockDownTimer: false});
			}
			this._lockDownTimer.setTimeout();
		}).then(async ({isMoved, isThereSpaceToFall, didResetLockDownTimer}) => {
			if (isMoved) {
				if (isThereSpaceToFall) {
					this._timerToFall.clearTimeout();
					this._lockDownTimer.clearTimeout();
					this.fallPhase();
					return;
				} else {
					if (didResetLockDownTimer) {
						this._timerToFall.clearTimeout();
						this._lockDownTimer.clearTimeout();
						this.lockPhase();
						return;
					}
				}
			}
			this._timerToFall.clearTimeout();
			this._lockDownTimer.clearTimeout();
			const shouldLockDown = this._gameRule.justBeforeLockDown(null);
			if (shouldLockDown) {
				this.patternPhase();
			}
		})
		
	}
	async patternPhase(): Promise<void> {
		console.log('patternPhase');
		
		const patternMatchArray = await new Promise<Pos[]>((resolve, reject) => {
			this._currentPhase = 'pattern';
			this._rejectPhase = reject;
			this._onOperationFunc = ()=>{};
			this.removeGhostMinos();
			this._totalFallenTetrimino++;
			this._gameRule.arrangeSituation();
			resolve(this.getLinePatterns());
		});
		if (patternMatchArray.length != 0) {
			this.markBlockForDestruction(patternMatchArray);
		} else {
			this.iteratePhase();
		}
	}
	async markBlockForDestruction(patterns: Pos[]): Promise<void> {
		console.log('markBlockForDestruction');
		
		await new Promise<void>((resolve, reject) => {
			this._rejectPhase = reject;
			this._patterns.set('line', patterns);
			resolve();
		});
		return await this.iteratePhase();
	}
	async iteratePhase(): Promise<void> {
		console.log('iteratePhase');
		
		await new Promise<void>((resolve, reject) => {
			this._currentPhase = 'iterate';
			this._rejectPhase = reject;
			resolve();
		});
		return await this.animatePhase();
	}
	async animatePhase(): Promise<void> {
		console.log('animatePhase');
		
		await new Promise<void>((resolve, reject) => {
			this._currentPhase = 'animate';
			this._rejectPhase = reject;
			resolve();
		});
		return await this.eliminatePhase();
	}
	async eliminatePhase(): Promise<void> {
		console.log('eliminatePhase');
		
		await new Promise<void>((resolve, reject) => {
			this._currentPhase = 'eliminate';
			this._rejectPhase = reject;
			for (const pos of this._patterns.get("line")!) {
				this.clearLine(pos.y);
			}
			this.displayAllMinos();
			resolve();
		});
		return await this.completionPhase();
	}
	async completionPhase(): Promise<void> {
		console.log('completionPhase');
		
		await new Promise<void>((resolve, reject) => {
			this._currentPhase = 'completion';
			this._rejectPhase = reject;
			resolve();
		});
		return await this.genPhase(true);
	}

	// 
	// genPhase
	// 

	
	placeToStartPos(): void {
		this.arrangeBag();
		this.initTetrimino({'type':this._bag[0]});
		this._bag.shift();
		this._currentFacing = 0;
		this.displayNext();
		this.displayHold();
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

	resetPatterns(): void {
		this._patterns = new Map<Patterns, Pos[]>();
		this._patterns.set('line', []);
	}
	
	//
	// fallPhase
	//
	async fallingPromise(): Promise<boolean> {
		return await new Promise<boolean>(async (resolve, reject) => {
			console.log("falling");
			
			this._hardDropFunc = ()=>{resolve(true)};
			this._onPressedSoftDropFunc = ()=>{resolve(false)};
			this._onOperationFunc = resolve;
			await this.fall();
			resolve(false);
		}).then(async (bool) => {
			if (bool) {
				return true;
			} else {
				return new Promise<boolean>(async (resolve, reject) => {
					if (this.canFall()) {
						resolve(await this.fallingPromise());
					}
					resolve(false);
				})
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
	// patternPhase
	//
	getLinePatterns(): Pos[] {
		let patterns = [] as Pos[];
		this._fieldArray.forEach((line, y) => {
			if (!line.some((mino)=>this._gameRule.tetriminoClass.attrMap.get(mino)=='empty')) {
				patterns.push({x:-1,y:y});
			}
		})
		
		return patterns;
	}

	//
	// eliminatePhase
	//
	clearLine(y: number) {
		for (var j = y-1; j >= 0; j--) {
			this._fieldArray[j+1] = cloneArray(this._fieldArray[j]);
		}
		this._fieldArray[0] = this._gameRule.generateRegularlyTerrain();
		this._totalClearedLine++;
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
	get currentMinoShape() {
		return this._currentMinoShape;
	}
	set currentMinoShape(shape: string) {
		if (this._gameRule.tetriminoClass.isTetrimino(shape)) {
			this._currentMinoShape = shape;
		}
	}
	set currentFacing(facing: 0|1|2|3) {
		this._currentFacing = facing;
	}
	get currentFacing() {
		return this._currentFacing;
	}

	set currentPos(pos: Pos) {
		this._currentPos = pos;
		this.setShaftClass(this.getShaft());
	}
	get currentPos() {
		return this._currentPos;
	}
	get bag() {
		return this._bag;
	}
	set bag(tetriminos: Tetrimino[]) {
		this._bag = tetriminos;
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

	get rejectPhase() {
		return this._rejectPhase;
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

	get numOfOperationsInLockDownPhase() {
		return this._numOfOperationsInLockDownPhase;
	}
	set numOfOperationsInLockDownPhase(num: number) {
		this._numOfOperationsInLockDownPhase = num;
	}

	currentMinos(): Mino[] {
		const minoBase = Tetris.replaceMinoType(this._gameRule.tetriminoClass.getTetriminoShape(this._currentMinoShape)!,this._currentMinoType)
		const dif = this._gameRule.getDifOfShaft(this._currentMinoShape, this._currentFacing);
		return getMovedMinos(getRotatedMinos(getMovedMinos(minoBase, this._currentPos.x, this._currentPos.y), this._currentPos, this._currentFacing), dif.x, dif.y);
	}

	getShaft(): Pos {
		const dif = this._gameRule.getDifOfShaft(this._currentMinoShape, this._currentFacing);
		return {x:this._currentPos.x+dif.x, y:this._currentPos.y+dif.y};
	}
	
	
	isOtherTiles(tile: Mino | Pos): boolean {
		if (this._gameRule.tetriminoClass.attrMap.get(this._fieldArray[tile.y][tile.x]) != 'empty') {
			if ( !this.isTetriminoVisible() ) return true;
			if ( !this.currentMinos().some((element) => {return element.x==tile.x && element.y==tile.y }) ) {
				return true;
			}
		}
		return false;
	}
	isOutOfField(x: number, y: number): boolean {
		return (x<0 || x>=this._gameRule.fieldWidth || y<0 || y>=this._gameRule.fieldHeight);
	}

	isTetriminoVisible(): boolean {
		return this._currentPhase=='gen'||this._currentPhase=='fall'||this._currentPhase=='lock';
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

	static setColor(csses: string[],colors: string[]): void {
		let style = "<style type='text/css'>";
		csses.forEach((css, i) => {
			let indOfColors = (colors.length>i)?i:(i%colors.length);
			style += `${css} + {background-color: ${colors[i]};}`;
		});
		style += "</style>";
		$('head').append(style);
	}

	static getRegularRotationRule(width: number, height: number): Pos[][][] {
		return [[[{x:0,y:0}]]]
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

	setShaftClass(pos: Pos|Mino): void {
		$('.shaft').removeClass('shaft');
		$(`.minos[data-x="${pos.x}"][data-y="${pos.y}"]`).addClass('shaft');
		console.log(`.minos[data-x="${pos.x}"][data-y="${pos.y}"]`);
	}

	displayNext(): void {
		$('#nextArea').html(this.textOfNext())
	}
	textOfNext(): string {
		let text = "<p id='nextHead'>Next</p>";
		for (let i = 0; i < this._gameRule.nextNum; i++) {
			console.log(this._bag[i]);
			if(typeof this._bag[i] !== 'undefined') {
				text += this._gameRule.tetriminoClass.getStandaloneTetriminoText(this._bag[i] as Tetrimino);
			}
		}
		return text;
	}

	displayHold(): void {
		$('#holdArea').html(this.textOfHold())
	}

	textOfHold(): string {
		let text = "<p id='holdHead'>hold</p>"+this._gameRule.tetriminoClass.getStandaloneTetriminoText(this._holdMinoType);
		return text;
	}

	//
	// various
	//

	initTetrimino({type,shape=type}:{type:Tetrimino,shape?:Tetrimino}): void {
		this._currentMinoType = type;
		this._currentMinoShape = shape;
		this._currentPos = {x:Math.floor((this._gameRule.matrixWidth-1)/2),y:this._gameRule.bufferHeight-1};
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
				return false;
			}
			if (this.isOtherTiles(tile)) {
				return false;
			}
		}
		return true;
	}

	move(dx: number, dy: number): boolean {
		const following = getMovedMinos(this.currentMinos(),dx,dy);
		if (this.canMove(following)) {
			this.relocate(following);
			this.currentPos = {x:this.currentPos.x+dx,y:this.currentPos.y+dy};
			if (this._lowerPos < this._currentPos.y) {
				this._numOfOperationsInLockDownPhase = 0;
				this._lowerPos = this._currentPos.y;
			}
			this.relocateGhost();
			return true;
		} else {
			return false;
		}
	}
	rotate(direction: 1|3): number {
		const formerFacing = this._currentFacing;
		const followingFacing = (this._currentFacing+direction)%4 as 0|1|2|3;
		const formerDif = this._gameRule.getDifOfShaft(this._currentMinoShape, formerFacing);
		const followingDif = this._gameRule.getDifOfShaft(this._currentMinoShape, followingFacing);
		const dif = {x:followingDif.x-formerDif.x, y:followingDif.y-formerDif.y};
		const rotatedMinos = getMovedMinos(getRotatedMinos(this.currentMinos(), this.getShaft(), direction), dif.x, dif.y);
		let n = 0;
		while(true) {
			let [dx,dy] = [0,0];
			let following = cloneArray(rotatedMinos);
			if (n>0 && this._gameRule.rotationRule.get(this._currentMinoShape)![n-1].length==0) {
				return -1;
			} else if (n>0) {
				const ind: 0|1 = (()=>{
					if (direction==1) {
						return 0;
					} else {
						return 1;
					}
				})();
				({x:dx, y:dy} = this._gameRule.rotationRule.get(this._currentMinoShape)![this._currentFacing][ind][n-1]);
				following = getMovedMinos(following, dx, dy);
			}
			// console.log(dx,dy,following,n);
			
			if (this.canMove(following)) {
				this.relocate(following);
				this._currentFacing = followingFacing;
				this.currentPos = {x:this.currentPos.x+dx, y:this.currentPos.y+dy};
				this.relocateGhost();
				return n;
			}
			n++;
		}
	}

	relocate(following: Mino[]): void {
		this.hideCurrentMino();
		this.updateDiffOfField(following, 'falling');
		// this.setShaftClass(this.getShaft());
	}

	hideCurrentMino() {
		const emptyMino = this._gameRule.tetriminoClass.attrMap.getKeysFromValue('empty')[0];
		const anti = Tetris.replaceMinoType(this.currentMinos(), emptyMino);
		
		this.updateDiffOfField(anti, 'placed');
	}

	updateFieldArray(mino: Mino) {
		this._fieldArray[mino.y][mino.x] = mino.mino;
	}

	updateDiffOfField(diff: Mino[], blockType: BlockType) {
		for (const mino of diff) {
			this.displayMino(mino, blockType);
			if (blockType != 'ghost') {
				this.updateFieldArray(mino);
			}
		}
	}

	updateGhost(): number {
		let hightOfAbleToDrop = 0;
		while (true) {
			if (this.canMove(getMovedMinos(this.currentMinos(),0,hightOfAbleToDrop+1))) {
				hightOfAbleToDrop++;
			} else {
				break;
			}
		}
		if (hightOfAbleToDrop == 0) {
			this._ghostMinos = []
			this._ghostPos = {x:-1, y:-1}
		} else {
			this._ghostMinos = getMovedMinos(this.currentMinos(),0, hightOfAbleToDrop);
			this._ghostPos = {x:this._currentPos.x,y:this._currentPos.y+hightOfAbleToDrop}
		}
		return hightOfAbleToDrop;
	}
	relocateGhost(): void {
		this.removeGhostMinos();
		this.updateGhost();
		this.displayGhostMinos();
	}

	setSizeOfMatrix() {
		//$(':root').style.setProperty()
		setCssVar('--heightOfMatrix', this._gameRule.matrixHeight.toString());
		setCssVar('--widthOfMatrix', this._gameRule.matrixWidth.toString());
		if (hasTouchScreen()){
			const sizeOfMino = 15 * 10 / this._gameRule.matrixWidth;
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
		this._holdMinoType = this._gameRule.tetriminoClass.attrMap.getKeysFromValue("empty")[0];
	}
	clearNextQueue() {
		this._bag = [];
	}

	//
	// operations
	//
	left(): void {
		if (this.canOperate()) {
			const didMove = this.move(-1,0);
			if (didMove) this.onOperating();
		}
	}
	right():void {
		if (this.canOperate()) {
			const didMove = this.move(1,0);
			if (didMove) this.onOperating();
		}
	}

	leftRotation(): void {
		if (this.canOperate()) {
			const didMove = this.rotate(3);
			if (didMove > -1) {
				this.onOperating()
			}
		}
	}
	rightRotation(): void {
		if (this.canOperate()) {
			const didMove = this.rotate(1);
			if (didMove > -1) {
				this.onOperating()
			}
		}
	}

	hardDrop(): void {
		if (this.canOperate()) {
			this._timerToFall.clearTimeout();
			this.move(this._ghostPos.x-this._currentPos.x, this._ghostPos.y-this._currentPos.y);
			this._hardDropFunc();
		}
	}
	softDrop(b:boolean):void {
		if (b && this.canOperate()) {
			if(this._isSoftDrop) {
				this._isSoftDrop = true;
			} else {
				this._isSoftDrop = true;
				this._onPressedSoftDropFunc();
			}
		} else {
			this._isSoftDrop = false;
		}
	}

	hold(): void {
		if (this.canOperate() && this._canHold) {
			this._canHold = false;
			if (this._gameRule.tetriminoClass.attrMap.get(this._holdMinoType)=='block') {
				this._bag.unshift(this._holdMinoType);
			}
			this._holdMinoType = this._currentMinoType;
			this.hideCurrentMino();

			this._rejectPhase("hold");
			this.genPhase(false);
		}
	}

	canOperate(): boolean {
		return (this._currentPhase=="fall" || this._currentPhase=="lock") && !this._isPausing;
	}
	onOperating(): void {
		if(this._currentPhase=="lock")this._numOfOperationsInLockDownPhase++;
		
		if (this._currentPhase=="fall") {
			if(!this.canFall()) this._onOperationFunc(false);
		} else if (this._currentPhase=="lock") {
			this._onOperationFunc({isMoved: true, isThereSpaceToFall: this.canFall(), didResetLockDownTimer: this._gameRule.shouldResetLockDownTimer(this._numOfOperationsInLockDownPhase)});
		}
	}

	// shouldResetLockDownTimer(): boolean {
	// 	return this._numOfOperationsInLockDownPhase < 14;
	// }
}