import { hasChange, isObject } from '../shared'
import { ComputedRefImpl } from './computed'
import { createDep } from './dep'
import { isTracking, trackEffects, triggerEffects } from './effect'
import { reactive, Target } from './reactive'

class RefImpl {
    private _rawValue: any
    private _value: any
    public dep
    public __v_isRef = true

    constructor(value: unknown) {
        this._rawValue = value
        this._value = convert(value)
        this.dep = createDep()
    }

    get value() {
        trackRefValue(this)
        return this._value
    }

    set value(newValue) {
        if (hasChange(newValue, this._rawValue)) {
            this._value = convert(newValue)
            this._rawValue = newValue
            triggerRefValue(this)
        }
    }
}

export function triggerRefValue(ref: RefImpl | ComputedRefImpl) {
    triggerEffects(ref.dep)
}

export function trackRefValue(ref: RefImpl | ComputedRefImpl) {
    if (isTracking()) {
        trackEffects(ref.dep)
    }
}

export function ref(value: unknown) {
    return createRef(value)
}

export function createRef(value: unknown) {
    const refImpl = new RefImpl(value)

    return refImpl
}

function convert(value: unknown) {
    return isObject(value) ? reactive(value) : value
}

export function isRef(ref: unknown) {
    return ref && !!(ref as RefImpl).__v_isRef
}

export function unref(value: unknown) {
    return isRef(value) ? (value as RefImpl).value : value
}

const shallowUnwrapHandlers = {
    get(target, key, receiver) {
        return unref(Reflect.get(target, key, receiver))
    },
    set(target, key, value, receiver) {
        const oldValue = target[key]
        if (isRef(oldValue) && !isRef(value)) {
            return (target[key].value = value)
        }
        return Reflect.set(target, key, value, receiver)
    },
}

export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, shallowUnwrapHandlers)
}
