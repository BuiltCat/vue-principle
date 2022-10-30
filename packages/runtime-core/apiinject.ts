import { getCurrentInstance } from './component'

export function provide(key, value) {
    const currentInstance = getCurrentInstance() as any
    if (currentInstance) {
        let { provides } = currentInstance

        const parentProvides = currentInstance.parent?.provides

        if (parentProvides === provides) {
            provides = currentInstance.provides = Object.create(parentProvides)
        }
        provides[key] = value
    }
}

export function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance() as any

    if (currentInstance) {
        const provides = currentInstance.parent?.provides
        if (key in provides) {
            return provides[key]
        } else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue()
            }
            return defaultValue
        }
    }
}
