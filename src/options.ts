//let currentMethodOfOperationForTouch = 'swipe';

const options = ['GameRule']

class GameOption<T> {
	private _optionName: string;
	private _currentOption: T;
	private _enumOfT: Enum<T>;

	constructor(name:string, indOfDefault: number=0, enumOfT: Enum<T>) {
		this._optionName = name;
		this._enumOfT = enumOfT;
		this._currentOption = this._enumOfT.defArray[indOfDefault];

		$(document).on('change', 'input[name="'+this._optionName+'"]', (e) => {
			const value = $('input[name="'+this._optionName+'"]:checked').val();
			const value_T = this._enumOfT.toEnum(value);
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
		for (const option of this._enumOfT.defArray) {
			htmlText += `
				<div class='radio'>
					<input type='radio' name='${this._optionName}' value='${option}' id='${this._optionName}-${option}'>
					<label class='radio-label' for='${this._optionName}-${option}'>${this._enumOfT.getTitle(option)}</label>
				</div>
			`
		}
		$(obj).html(htmlText);
		$(obj+' input[name="'+this._optionName+'"]').val([this._enumOfT.toString(this._currentOption)]);
	}
}
