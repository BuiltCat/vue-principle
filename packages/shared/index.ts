export const isObject = (val: unknown): val is Record<any, any> => {
    return val !== null && typeof val === 'object'
}

export const extend = Object.assign

export const hasChange = (value: unknown, oldValue: unknown) => {
    return !Object.is(value, oldValue)
}

export function hasOwn(val, key) {
    return Object.prototype.hasOwnProperty.call(val, key)
}

export const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1)

export const toHandlerkey = (str: string) => (str ? `on${capitalize(str)}` : ``)

const camlizeRE = /-(\w)/g

export const camlize = (str: string): string => {
    return str.replace(camlizeRE, (_, c) => (c ? c.toUpperCase() : ''))
}

const hyphenateRE = /\B([A-Z])/g

export const hyphenate = (str: string): string =>
    str.replace(hyphenateRE, '-$1').toLowerCase()
