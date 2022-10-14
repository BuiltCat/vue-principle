import { createDep } from './dep'
import { ReactiveEffect, trackEffects } from './effect'
import { trackRefValue, triggerRefValue } from './ref'

export class ComputedRefImpl {
    public dep
    public effect
    private _dirty
    private _value

    constructor(getter) {
        this._dirty = true
        this.dep = createDep()
        this.effect = new ReactiveEffect(getter, () => {
            console.log('run sc')
            if (this._dirty) return
            this._dirty = true
            triggerRefValue(this)
        })
    }

    get value() {
        trackRefValue(this)
        if (this._dirty) {
            this._dirty = false
            this._value = this.effect.run()
        }
        return this._value
    }
}

export function computed(getter) {
    return new ComputedRefImpl(getter)
}
