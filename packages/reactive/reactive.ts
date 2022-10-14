import {
    mutableHandlers,
    readonlyHandlers,
    shallowHandlers,
    shallowReadonlyHandlers,
} from './baseHandlers'

export const reactiveMap = new WeakMap()
export const readonlyMap = new WeakMap()
export const shallowReactiveMap = new WeakMap()
export const shallowReadonlyMap = new WeakMap()

export const enum reactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly',
    RAW = '__v_raw',
}

export interface Target {
    [reactiveFlags.IS_REACTIVE]?: boolean
    [reactiveFlags.IS_READONLY]?: boolean
    [reactiveFlags.RAW]?: any
}

export function reactive<T extends object>(target: T): T {
    return createReactiveObject(target, reactiveMap, mutableHandlers)
}

export function readonly<T extends object>(target: T): T {
    return createReactiveObject(target, readonlyMap, readonlyHandlers)
}

export function shallowReactive<T extends object>(target: T): T {
    return createReactiveObject(target, shallowReactiveMap, shallowHandlers)
}

export function shallowReadonly<T extends object>(target: T): T {
    return createReactiveObject(
        target,
        shallowReadonlyMap,
        shallowReadonlyHandlers
    )
}

function createReactiveObject(
    target: Target,
    proxyMap: WeakMap<Target, any>,
    baseHandlers: any
) {
    if (proxyMap.has(target)) {
        return proxyMap.get(target)
    }
    const proxy = new Proxy(target, baseHandlers)
    proxyMap.set(target, proxy)
    return proxy
}

export function isProxy(value: unknown) {
    return isReactive(value) || isReadonly(value)
}

export function isReactive(value: unknown) {
    return value && !!(value as Target)[reactiveFlags.IS_REACTIVE]
}

export function isReadonly(value: unknown) {
    return value && !!(value as Target)[reactiveFlags.IS_READONLY]
}

export function toRaw<T>(observed: T): T {
    const raw = observed && (observed as Target)[reactiveFlags.RAW]
    return raw ? toRaw(raw) : observed
}
