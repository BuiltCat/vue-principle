import { camlize, hyphenate, toHandlerkey } from '../shared'

export function emit(instance, event: string, ...rawArgs) {
    const props = instance.props

    let handler = props[toHandlerkey(camlize(event))]

    if (!handler) {
        handler = props[toHandlerkey(hyphenate(event))]
    }

    if (handler) {
        handler(...rawArgs)
    }
}
