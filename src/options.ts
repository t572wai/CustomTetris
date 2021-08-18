let currentMethodOfOperationForTouch = 'swipe';

const options = ['GameRule']

class GameOption<T> {
	private _optionName: string;
	private _currentOption: T;
	private _options: T[];
	private _getTitle: (arg: T) => string;
	private _toString: (arg: T) => string;

	constructor(name:string, array: T[], indOfDefault: number=0, toTypeFn: (arg:any)=>T|undefined, toString: (arg: T)=>string, getTitle: (arg: T)=> string) {
		this._optionName = name;
		this._options = array;
		this._currentOption = this._options[indOfDefault];
		this._getTitle = getTitle;
		this._toString = toString;

		$(document).on('change', 'input[name="'+this._optionName+'"]', (e) => {
			const value = $('input[name="'+this._optionName+'"]:checked').val();
			const value_T = toTypeFn(value);
			console.log(value);
			if (typeof value_T !== 'undefined') {
				this._currentOption = value_T;
			}
		})
	}

	get currentOption(): T {
		return this._currentOption;
	}

	displayRadioOption(obj: string): void {
		let htmlText = "<div id='"+this._optionName+"RadioContainer'>";
		for (const option of this._options) {
			htmlText += `
				<div class='radio'>
					<input type='radio' name='${this._optionName}' value='${option}' id='${this._optionName}-${option}'>
					<label class='radio-label' for='${this._optionName}-${option}'>${this._getTitle(option)}</label>
				</div>
			`
		}
		$(obj).html(htmlText);
		$(obj+' input[name="'+this._optionName+'"]').val([this._toString(this._currentOption)]);
	}
}
