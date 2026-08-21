import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'

/**
 * jsdom start-up dominates this suite, and under load a query can still be
 * settling when the 1s default expires. Only the patience changes here; every
 * assertion still has to hold.
 */
configure({ asyncUtilTimeout: 5000 })
