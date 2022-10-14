import { effect } from '../reactive/effect'
import {
    isReactive,
    isReadonly,
    reactive,
    readonly,
    shallowReactive,
    toRaw,
} from '../reactive/reactive'

describe('reactive', () => {
    test('Object', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        expect(observed).not.toBe(original)
        expect(isReactive(observed)).toBe(true)
        expect(isReactive(original)).toBe(false)
        expect(observed.foo).toBe(1)
        expect('foo' in observed).toBe(true)
        expect(Object.keys(observed)).toEqual(['foo'])
    })

    test('nested reactives', () => {
        const original = {
            nested: {
                foo: 1,
            },
            array: [{ bar: 2 }],
        }
        const observed = reactive(original)
        expect(isReactive(observed.nested)).toBe(true)
        expect(isReactive(observed.array)).toBe(true)
        expect(isReactive(observed.array[0])).toBe(true)
    })

    test('readonly', () => {
        const original = { num: 1 }
        const observed = readonly(original)
        observed.num = 2
        expect(observed.num).toBe(1)

        expect(isReadonly(observed)).toBe(true)
        expect(isReadonly(original)).toBe(false)
    })

    test('shallow', () => {
        let dummy1, dummy2
        const original = {
            nested: {
                num: 1,
            },
        }
        const observed = shallowReactive(original)
        effect(() => {
            dummy1 = observed.nested
        })
        effect(() => {
            dummy2 = observed.nested.num
        })
        expect(dummy1).toEqual({
            num: 1,
        })
        expect(dummy2).toBe(1)

        observed.nested = { num: 2 }

        expect(dummy1).toEqual({
            num: 2,
        })

        expect(dummy2).toBe(2)

        observed.nested.num = 3

        expect(dummy1).toEqual({
            num: 3,
        })

        expect(dummy2).toBe(2)
    })

    test('toRaw', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        expect(toRaw(observed)).toBe(original)
        expect(toRaw(original)).toBe(original)
    })
})
