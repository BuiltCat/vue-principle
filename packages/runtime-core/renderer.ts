import { effect } from '../reactive/effect'
import { ShapeFlag } from '../shared/shapeFlag'
import { createComponentInstance, setupComponent } from './component'
import { shouldUpdateComponent } from './componentRenderUtils'
import { createAppAPI } from './createApp'
import { queueJob } from './scheduler'
import { Text, Fragment, normalizeVNode } from './vnode'

export function createRenderer(options) {
    const {
        createElement: hostCreateElement,
        setElementText: hostSetElementText,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setText: hostSetText,
        createText: hostCreateText,
    } = options

    const render = (vnode, container) => {
        patch(null, vnode, container)
    }

    function patch(
        n1,
        n2,
        container = null,
        anchor = null,
        parentComponent = null
    ) {
        const { type, shapeFlag } = n2

        switch (type) {
            case Text:
                processText(n1, n2, container)
                break
            case Fragment:
                processFragment(n1, n2, container)
                break
            default:
                if (shapeFlag & ShapeFlag.ELEMENT) {
                    processElement(n1, n2, container, anchor, parentComponent)
                } else if (shapeFlag & ShapeFlag.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent)
                }
        }
    }

    function processFragment(n1, n2, container) {
        if (!n1) {
            mountChildren(n2.children, container)
        }
    }

    function mountChildren(children, container) {
        children.forEach((VNodeChild) => {
            patch(null, VNodeChild, container)
        })
    }

    function processText(n1, n2, container) {
        if (n1 === null) {
            n2.el = hostCreateText(n2.children)
            hostInsert(n2.el, container)
        } else {
            const el = (n2.el = n1.el!)
            if (n2.children !== n1.children) {
                hostSetText(el, n2.children)
            }
        }
    }

    function processElement(n1, n2, container, anchor, parentComponent) {
        if (!n1) {
            mountElement(n2, container, anchor)
        } else {
            updateElement(n1, n2, container, anchor, parentComponent)
        }
    }

    function mountElement(vnode, container, anchor) {
        const { shapeFlag, props } = vnode

        const el = (vnode.el = hostCreateElement(vnode.type))

        if (shapeFlag & ShapeFlag.TEXT_CHILDREN) {
            hostSetElementText(el, vnode.children)
        } else if (shapeFlag & ShapeFlag.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el)
        }

        if (props) {
            for (const key in props) {
                const nextVal = props[key]
                hostPatchProp(el, key, null, nextVal)
            }
        }

        hostInsert(el, container, anchor)
    }

    function updateElement(n1, n2, container, anchor, parentComponent) {
        const oldProps = (n1 && n1.props) || {}
        const newProps = n2.props || {}

        const el = (n2.el = n1.el)

        patchProps(el, oldProps, newProps)

        patchChildren(n1, n2, el, anchor, parentComponent)
    }

    function patchProps(el, oldProps, newProps) {
        for (const key in newProps) {
            const prevProp = oldProps[key]
            const nextProp = newProps[key]
            if (prevProp !== nextProp) {
                hostPatchProp(el, key, prevProp, nextProp)
            }
        }
        for (const key in oldProps) {
            const prevProp = oldProps[key]
            const nextProp = newProps[key]
            if (!(key in newProps)) {
                hostPatchProp(el, key, prevProp, nextProp)
            }
        }
    }

    function processComponent(n1, n2, container, parentComponent) {
        if (!n1) {
            mountComponent(n2, container, parentComponent)
        } else {
            updateComponent(n1, n2, container)
        }
    }

    function patchChildren(n1, n2, container, anchor, parentComponent) {
        const { shapeFlag: prevShapeFlag, children: c1 } = n1
        const { shapeFlag, children: c2 } = n2

        if (shapeFlag & ShapeFlag.TEXT_CHILDREN) {
            if (c2 !== c1) {
                hostSetElementText(container, c2)
            }
        } else {
            if (prevShapeFlag & ShapeFlag.ARRAY_CHILDREN) {
                if (shapeFlag & ShapeFlag.ARRAY_CHILDREN) {
                    patchKeyedChildren(
                        c1,
                        c2,
                        container,
                        anchor,
                        parentComponent
                    )
                }
            }
        }
    }

    // diff
    function patchKeyedChildren(
        c1,
        c2,
        container,
        parentAnchor,
        parentComponent
    ) {
        let i = 0
        const l2 = c2.length
        let e1 = c1.length - 1
        let e2 = l2 - 1

        const isSameVNodeType = (n1, n2) => {
            return n1.type === n2.type && n1.key === n2.key
        }

        while (i <= e1 && i <= e2) {
            const prevChild = c1[i]
            const nextChild = c2[i]

            if (!isSameVNodeType(prevChild, nextChild)) {
                break
            }

            patch(
                prevChild,
                nextChild,
                container,
                parentAnchor,
                parentComponent
            )
            i++
        }

        while (i <= e1 && i <= e2) {
            const prevChild = c1[e1]
            const nextChild = c2[e2]
            if (!isSameVNodeType(prevChild, nextChild)) {
                break
            }
            patch(
                prevChild,
                nextChild,
                container,
                parentAnchor,
                parentComponent
            )
            e1--
            e2--
        }

        if (i > e1 && i <= e2) {
            const nextPos = e2 + 1
            const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
            while (i <= e2) {
                patch(null, c2[i], container, anchor, parentComponent)
                i++
            }
        } else if (i > e2 && i <= e1) {
            while (i <= e1) {
                hostRemove(c1[i].el)
                i++
            }
        } else {
            let s1 = i
            let s2 = i
            const keyToNewIndexMap = new Map()
            let moved = false
            let maxNewIndexSoFar = 0

            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i]
                keyToNewIndexMap.set(nextChild.key, i)
            }

            const toBePatched = e2 - s2 + 1

            let patched = 0

            const newIndextoOldIndexMap = new Array(toBePatched)

            for (let i = 0; i < toBePatched; i++) newIndextoOldIndexMap[i] = 0

            for (i = s1; i <= e1; i++) {
                const prevChild = c1[i]

                if (patched >= toBePatched) {
                    hostRemove(prevChild.el)
                    continue
                }

                let newIndex
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key)
                } else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j
                            break
                        }
                    }
                }

                if (newIndex === undefined) {
                    hostRemove(prevChild.el)
                } else {
                    newIndextoOldIndexMap[newIndex - s2] = i + 1

                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex
                    } else {
                        moved = true
                    }

                    patch(
                        prevChild,
                        c2[newIndex],
                        container,
                        null,
                        parentComponent
                    )
                    patched++
                }
            }

            const increasingNewIndexSequence = moved
                ? getSequence(newIndextoOldIndexMap)
                : []

            let j = increasingNewIndexSequence.length - 1

            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = s2 + i
                const nextChild = c2[nextIndex]
                const anchor =
                    nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor
                if (newIndextoOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, anchor, parentComponent)
                } else if (moved) {
                    if (j < 0 || increasingNewIndexSequence[j] !== i) {
                        hostInsert(nextChild.el, container, anchor)
                    } else {
                        j--
                    }
                }
            }
        }
    }

    function mountComponent(initialVNode, container, parentComponent) {
        const instance = (initialVNode.component = createComponentInstance(
            initialVNode,
            parentComponent
        ))
        setupComponent(instance)

        setupRenderEffect(instance, initialVNode, container)
    }

    function setupRenderEffect(instance, initialVNode, container) {
        function componentUpdateFn() {
            if (!instance.isMounted) {
                const proxyToUse = instance.proxy
                const subTree = (instance.subTree = normalizeVNode(
                    instance.render.call(proxyToUse, proxyToUse)
                ))

                patch(null, subTree, container, null, instance)
                initialVNode.el = subTree.el
                instance.isMounted = true
            } else {
                const { next, vnode } = instance
                if (next) {
                    next.el = vnode.el
                    updateComponentPreRender(instance, next)
                }
                const proxyToUse = instance.proxy
                const nextTree = normalizeVNode(
                    instance.render.call(proxyToUse, proxyToUse)
                )
                const prevTree = instance.subTree
                instance.subTree = nextTree

                patch(prevTree, nextTree, prevTree.el, null, instance)
            }
        }

        instance.update = effect(componentUpdateFn, {
            scheduler: () => {
                queueJob(instance.update)
            },
        })
    }

    function updateComponentPreRender(instance, nextVNode) {
        nextVNode.component = instance
        instance.vnode = nextVNode
        instance.next = null

        const { props } = nextVNode
        instance.props = props
    }

    function updateComponent(n1, n2, container) {
        const instance = (n2.component = n2.component)

        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2
            instance.update()
        } else {
            n2.component = n1.component
            n2.el = n1.el
            instance.vnode = n2
        }
    }

    return {
        render,
        createApp: createAppAPI(render),
    }
}

function getSequence(arr: number[]): number[] {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
        const arrI = arr[i]
        if (arrI !== 0) {
            j = result[result.length - 1]
            if (arr[j] < arrI) {
                p[i] = j
                result.push(i)
                continue
            }
            u = 0
            v = result.length - 1
            while (u < v) {
                c = (u + v) >> 1
                if (arr[result[c]] < arrI) {
                    u = c + 1
                } else {
                    v = c
                }
            }

            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1]
                }
                result[i] = i
            }
        }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
        result[u] = v
        v = p[v]
    }
    return result
}
