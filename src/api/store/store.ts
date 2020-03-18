

type callback = (val: any) => void;
type cond_fn = (val: any) => boolean;
export default class Store<State extends object, Key extends keyof State> {
    private vals: State;
    private initial: State;
    private subscribers: {[key in keyof State]: callback[]};
    private binds: {[key in keyof State]: HTMLInputElement};
    private conditions: {[key in keyof State]: cond_fn[]};


    constructor (target: State) {
        this.initial = Object.assign({}, target);
        this.vals = Object.assign({}, target);
        this.binds = {} as {[key in keyof State]: HTMLInputElement};
        this.subscribers = {} as {[key in keyof State]: callback[]};
        this.conditions = {} as {[key in keyof State]: cond_fn[]};
        for(const key of Object.keys(target)) {
            this.subscribers[key as keyof State] = [] as callback[];
            this.conditions[key as keyof State] = [] as cond_fn[];
        }
    }

    bindTo(key: Key, elm: HTMLInputElement) {
        this.binds[key] = elm;
        elm.addEventListener('change', () => {
            let val: any = elm.value;
            if(elm.type === 'number') {
                val = Number.parseFloat(val);
            } else if(elm.type === 'checkbox') {
                val = elm.checked;
            }
            this._set(key, val);
        });
        this.set(key, this.get(key))
    }

    addCondition(key: Key, condition: (val: any) => boolean) {
        // this.conditions[key].push(condition());
    }

    set(key: Key, val: any) {
        if(this.binds[key]) {
            this.binds[key].value = val;
        } else {
            this._set(key, val);
        }
    }

    private _set(key: keyof State, val: any) {
        this.vals[key] = val;
        for (const cb of this.subscribers[key]) {
            cb(val);
        }
    }

    get(key: Key): State[Key]{
        return this.vals[key];
    }

    subscribe(key: keyof State, callback: callback) {
        this.subscribers[key].push(callback);
    }
}
