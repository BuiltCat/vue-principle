import { isObject } from '../shared'
import { track, trigger } from './effect'
import {
    reactive,
    reactiveFlags,
    reactiveMap,
    readonly,
    readonlyMap,
    shallowReactiveMap,
    shallowReadonlyMap,
    Target,
} from './reactive'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowGet = createGetter(false, true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, isShallow = false) {
    return function get(
        target: object,
        key: string | symbol,
        receiver: object
    ) {
        if (key === reactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === reactiveFlags.IS_READONLY) {
            return isReadonly
        } else if (
            key === reactiveFlags.RAW &&
            receiver ===
                (isReadonly
                    ? isShallow
                        ? shallowReadonlyMap
                        : readonlyMap
                    : isShallow
                    ? shallowReactiveMap
                    : reactiveMap
                ).get(target)
        ) {
            return target
        }

        const result = Reflect.get(target, key, receiver)

        if (!isReadonly) {
            track(target, 'get', key)
        }

        if (isShallow) {
            return result
        }

        if (isObject(result)) {
            return isReadonly ? readonly(result) : reactive(result)
        }
        return result
    }
}

function createSetter() {
    return function set(
        target: object,
        key: string | symbol,
        value: unknown,
        receiver: object
    ) {
        const result = Reflect.set(target, key, value, receiver)
        // todo: 出发依赖
        trigger(target, 1, key)
        return result
    }
}

export const mutableHandlers = {
    get,
    set,
}

export const readonlyHandlers = {
    get: readonlyGet,
    set(target: Target, key: string | symbol) {
        console.warn(
            `Set operation on key "${String(key)} failed: target is readonly.`,
            target
        )
        return true
    },
}

export const shallowHandlers = {
    get: shallowGet,
    set,
}

export const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set(target: Target, key: string | symbol) {
        console.warn(
            `Set operation on key "${String(key)} failed: target is readonly.`,
            target
        )
        return true
    },
}
