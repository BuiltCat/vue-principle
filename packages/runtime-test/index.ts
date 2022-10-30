import { createRenderer } from '../runtime-core/renderer'
import { extend } from '../shared'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

export const { render } = createRenderer(extend({ patchProp }, nodeOps))

export * from './nodeOps'
export * from './serialize'
