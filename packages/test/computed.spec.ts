import { computed } from '../reactive/computed'
import { reactive } from '../reactive/reactive'

describe('computed', () => {
    it('happy path', () => {
        const value = reactive({
            foo: 1,
        })

        const getter = computed(() => {
            return value.foo
        })
        value.foo = 2
        expect(getter.value).toBe(2)
    })

    it('should compute lazily', () => {
        const value = reactive({
            foo: 1,
        })

        const getter = jest.fn(() => {
            return value.foo
        })

        const cValue = computed(getter)

        expect(getter).not.toHaveBeenCalled()

        expect(cValue.value).toBe(1)
        expect(getter).toHaveBeenCalledTimes(1)

        cValue.value
        expect(getter).toHaveBeenCalledTimes(1)

        value.foo = 2

        expect(cValue.value).toBe(2)
        expect(getter).toHaveBeenCalledTimes(2)

        cValue.value
        expect(getter).toHaveBeenCalledTimes(2)
    })
})
