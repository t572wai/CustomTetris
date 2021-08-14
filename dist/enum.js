/**
 * Enumの実装クラス
 */
const Enum = function () {
    this._enums = [];
    this._lookups = {};
};
/**
 * enumを取得する
 * @return {array} enumオブジェクト
 */
Enum.prototype.getEnums = function () {
    return this._enums;
};
/**
 * 繰り返し処理する
 * @param {array} callback コールバック
 */
Enum.prototype.forEach = function (callback) {
    let length = this._enums.length;
    for (let i = 0; i < length; ++i) {
        callback(this._enums[i]);
    }
};
/**
 * enumを追加する
 * @param {object} e enumの追加情報
 */
Enum.prototype.addEnum = function (e) {
    this._enums.push(e);
};
/**
 * 名前を取得する
 * @param {string} name 名前
 * @return {string} 名前文字列
 */
Enum.prototype.getByName = function (name) {
    return this[name];
};
/**
 * 値を取得する
 * @param  {string} field フィールド
 * @param  {object} value 値
 * @return {object} 設定した値
 */
Enum.prototype.getByValue = function (field, value) {
    let lookup = this._lookups[field];
    if (lookup) {
        return lookup[value];
    }
    else {
        this._lookups[field] = (lookup = {});
        let k = this._enums.length - 1;
        let res;
        for (; k >= 0; --k) {
            let m = this._enums[k];
            let j = m[field];
            lookup[j] = m;
            if (j == value) {
                res = m;
            }
        }
        return res;
    }
    return null;
};
/**
 * Enumを定義する
 * @param  {object} definition 定義内容
 * @return {object} enum
 */
function defineEnum(definition) {
    let k;
    let e = new Enum();
    for (k in definition) {
        let j = definition[k];
        e[k] = j;
        e.addEnum(j);
    }
    return e;
}
