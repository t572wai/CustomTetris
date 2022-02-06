export class InvertibleMap<K, V> extends Map<K, V> {
	constructor() {
		super();
	}

	getKeysFromValue(value: V) {
		let keys: K[] = [];
		for (const key of this.keys()) {
			if (this.get(key)==value) {
				keys.push(key);
			}
		}
		return keys;
	}
}