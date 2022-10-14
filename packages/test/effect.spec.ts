import { effect, stop } from '../reactive/effect'
import { reactive } from '../reactive/reactive'

describe('effect', () => {
    it('should observe basic properties', () => {
        let dummy
        const counter = reactive({ num: 0 })
        effect(() => (dummy = counter.num))
        expect(dummy).toBe(0)
        counter.num = 7
        expect(dummy).toBe(7)
    })

    it('should handle multiple effects', () => {
        let dummy1, dummy2
        const counter = reactive({ num: 0 })
        effect(() => (dummy1 = counter.num))
        effect(() => (dummy2 = counter.num))

        expect(dummy1).toBe(0)
        expect(dummy2).toBe(0)

        counter.num++

        expect(dummy1).toBe(1)
        expect(dummy2).toBe(1)
    })

    it('should observe nested properties', () => {
        let dummy
        const counter = reactive({ nested: { num: 0 } })
        effect(() => {
            dummy = counter.nested.num
        })
        expect(dummy).toBe(0)
        counter.nested.num = 8
        expect(dummy).toBe(8)
    })

    it('should observe function call chains', () => {
        let dummy
        const counter = reactive({ num: 0 })
        effect(() => (dummy = getNum()))
        function getNum() {
            return counter.num
        }
        expect(dummy).toBe(0)
        counter.num = 2
        expect(dummy).toBe(2)
    })

    it('scheduler', () => {
        let dummy
        let run: any
        const scheduler = jest.fn(() => {
            run = runner
        })
        const obj = reactive({ foo: 1 })
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            {
                scheduler,
            }
        )

        expect(scheduler).not.toHaveBeenCalled()

        expect(dummy).toBe(1)

        obj.foo++

        expect(scheduler).toHaveBeenCalledTimes(1)

        expect(dummy).toBe(1)

        run()

        expect(dummy).toBe(2)
    })

    it('stop', () => {
        let dummy
        const obj = reactive({ prop: 1 })
        const runner = effect(() => {
            dummy = obj.prop
        })
        obj.prop = 2
        expect(dummy).toBe(2)
        stop(runner)
        obj.prop++
        expect(dummy).toBe(2)

        runner()
        expect(dummy).toBe(3)
    })

    it('events: onStop', () => {
        const onStop = jest.fn(() => {})
        const runner = effect(() => {}, {
            onStop,
        })
        stop(runner)
        expect(onStop).toHaveBeenCalled()
    })
})
