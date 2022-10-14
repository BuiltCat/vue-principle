import { extend } from '../shared'
import { createDep } from './dep'

let activeEffect: ReactiveEffect | undefined
let shouldTrack = false
const targetMap = new WeakMap()

interface ReactiveEffectRunner<T = any> {
    (): T
    effect: ReactiveEffect
}

export class ReactiveEffect {
    private _fn
    public deps: Set<ReactiveEffect>[] = []
    private active = true
    constructor(fn: () => void, public scheduler?, public onStop?) {
        this._fn = fn
        this.scheduler = scheduler
    }
    run() {
        if (!this.active) {
            return this._fn()
        }

        shouldTrack = true
        activeEffect = this
        const result = this._fn()
        shouldTrack = false
        activeEffect = undefined
        return result
    }

    stop() {
        if (this.active) {
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

function cleanupEffect(effect: ReactiveEffect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect)
    })
    effect.deps.length = 0
}

export function effect(
    fn: () => void,
    options?: { scheduler?: () => void; onStop?: () => void }
): ReactiveEffectRunner {
    const _effect = new ReactiveEffect(fn)
    if (options) {
        extend(_effect, options)
    }

    _effect.run()

    const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
    runner.effect = _effect
    return runner
}

export function track(target: object, type: any, key: string | symbol) {
    if (!isTracking()) return

    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    let dep = depsMap.get(key)

    if (!dep) {
        dep = createDep()
        depsMap.set(key, dep)
    }

    trackEffects(dep)
}

export function trackEffects(dep: Set<ReactiveEffect>) {
    if (!dep.has(activeEffect!)) {
        dep.add(activeEffect!)
        ;(activeEffect as ReactiveEffect).deps.push(dep)
    }
}

export function trigger(target: object, type: any, key: string | symbol) {
    const depsMap = targetMap.get(target)
    if (!depsMap) return
    const dep = depsMap.get(key)
    if (!dep) return
    triggerEffects(dep)
}

export function triggerEffects(dep: ReactiveEffect[] | Set<ReactiveEffect>) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}

export function stop(runner: ReactiveEffectRunner) {
    runner.effect.stop()
}

export function isTracking() {
    return shouldTrack && activeEffect !== undefined
}
