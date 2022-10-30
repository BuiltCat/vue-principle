export const enum NodeTypes {
    ELEMENT = 'element',
    TEXT = 'TEXT',
}

let nodeId = 0

function createElement(tag: string) {
    const node = {
        tag,
        id: nodeId++,
        type: NodeTypes.ELEMENT,
        props: {},
        children: [],
        parentNode: null,
    }
    return node
}

function insert(child, parent) {
    parent.children.push(child)
    child.parentNode = parent
}

function parentNode(node) {
    return node.parentNode
}

function setElementText(el, text) {
    el.children = [
        {
            id: nodeId++,
            type: NodeTypes.TEXT,
            text,
            parentNode: el,
        },
    ]
}
export const nodeOps = {
    createElement,
    insert,
    parentNode,
    setElementText,
}
