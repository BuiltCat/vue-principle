import { NodeTypes } from './nodeOps'

export function serialize(node) {
    if (node.type === NodeTypes.ELEMENT) {
        return serializeElement(node)
    }
    return serializeText(node)
}

function serializeText(node) {
    return node.text
}

export function serializeInner(node) {
    return node.children.map((c) => serialize(c)).join('')
}

function serializeElement(node) {
    const props = Object.keys(node.props)
        .map((key) => {
            const value = node.props[key]
            return value == null
                ? ''
                : value === ''
                ? key
                : `${key}=${JSON.stringify(value)}`
        })
        .filter(Boolean)
        .join(' ')

    return `<${node.tag}${props ? ` ${props}` : ''}>${serializeInner(node)}</${
        node.tag
    }>`
}
