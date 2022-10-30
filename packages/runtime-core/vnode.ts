import { ShapeFlag } from '../shared/shapeFlag'

export function createVNode(
    type: any,
    props?: any,
    children?: string | Array<any>
) {
    const vnode = {
        el: null,
        component: null,
        key: props?.key,
        type,
        props: props || {},
        children,
        shapeFlag: getShapeFlag(type),
    }

    // 根据Children再次设置shapeFlag
    if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlag.ARRAY_CHILDREN
    } else if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlag.TEXT_CHILDREN
    }

    normalizeChildren(vnode, children)

    return vnode
}

function normalizeChildren(vnode, children) {
    if (typeof children === 'object') {
        if (vnode.shapeFlag & ShapeFlag.ELEMENT) {
        } else {
            vnode.shapeFlag |= ShapeFlag.SLOTS_CHILDREN
        }
    }
}

export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')

export function normalizeVNode(child) {
    if (typeof child === 'string' || typeof child === 'number') {
        return createVNode(Text, null, String(child))
    }
    return child
}

function getShapeFlag(type) {
    return typeof type === 'string'
        ? ShapeFlag.ELEMENT
        : ShapeFlag.STATEFUL_COMPONENT
}
