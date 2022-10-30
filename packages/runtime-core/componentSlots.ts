import { ShapeFlag } from '../shared/shapeFlag'

export function initSlots(instance, children) {
    const { vnode } = instance

    if (vnode.shapeFlag & ShapeFlag.SLOTS_CHILDREN) {
        normalizeObjectSlots(children, (instance.slots = {}))
    }
}

const normalizeObjectSlots = (rawSlots, slots) => {
    for (const key of rawSlots) {
        const value = rawSlots[key]
        if (typeof value === 'function') {
            slots[key] = (props) => normalizeSlotValue(value(props))
        }
    }
}

const normalizeSlotValue = (value) => {
    return Array.isArray(value) ? value : [value]
}
