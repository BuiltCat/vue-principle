export const isObject = (val: unknown): val is Record<any, any> => {
    return val !== null && typeof val === 'object'
}

export const extend = Object.assign

export const hasChange = (value: unknown, oldValue: unknown) => {
    return !Object.is(value, oldValue)
}
