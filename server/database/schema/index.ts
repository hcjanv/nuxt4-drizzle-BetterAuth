import * as auth from './auth'
import * as core from './core'

export const schema = {
    ...auth,
    ...core
}

// Re-export all entities for direct imports
export * from './auth'
export * from './core'
