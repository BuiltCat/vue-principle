import { ReactiveEffect } from '../reactive/effect'
import { queuePreFlushCbs } from './scheduler'

export function watchEffect(effect) {
    return doWatch(effect)
}

function doWatch(source) {
    const job = () => {
        effect.run()
    }

    const scheduler = () => queuePreFlushCbs(job)

    let cleanup

    const onCleanup = (fn) => {
        cleanup = effect.onStop = () => {
            fn()
        }
    }

    const getter = () => {
        if (cleanup) {
            cleanup()
        }

        source(onCleanup)
    }

    const effect = new ReactiveEffect(getter, scheduler)

    effect.run()

    return () => {
        effect.stop()
    }
}
