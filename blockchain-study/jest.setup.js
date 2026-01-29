import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

import { webcrypto } from 'crypto'

Object.assign(global, { TextEncoder, TextDecoder })

if (typeof global.crypto === 'undefined') {
    Object.defineProperty(global, 'crypto', {
        value: webcrypto,
        writable: true
    });
}
