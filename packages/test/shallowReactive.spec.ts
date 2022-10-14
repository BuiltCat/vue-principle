import {
    isReactive,
    isReadonly,
    reactive,
    readonly,
    shallowReactive,
    shallowReadonly,
} from '../reactive/reactive'

describe('shallow', () => {
    test('should not make non-reactive properties reactive', () => {
        const props = shallowReactive({ n: { foo: 1 } })
        const readonlyProps = shallowReadonly({ n: { foo: 1 } })
        expect(isReactive(props.n)).toBe(false)
        expect(isReactive(readonlyProps.n)).toBe(false)
    })

    test('should allow shallow and normal reactive for same target', () => {
        const original = { foo: {} }
        const shallowProxy = shallowReactive(original)
        const reactiveProxy = reactive(original)
        expect(shallowProxy).not.toBe(reactiveProxy)
        expect(isReactive(shallowProxy.foo)).toBe(false)
        expect(isReactive(reactiveProxy.foo)).toBe(true)
    })

    test('should differentiate from normal readonly calls', async () => {
        const original = { foo: {} }
        const shallowProxy = shallowReadonly(original)
        const reactiveProxy = readonly(original)
        expect(shallowProxy).not.toBe(reactiveProxy)
        expect(isReadonly(shallowProxy.foo)).toBe(false)
        expect(isReadonly(reactiveProxy.foo)).toBe(true)
    })
})
