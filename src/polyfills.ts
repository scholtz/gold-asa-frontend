// Pera/Defly/WalletConnect based wallets expect Node globals.
// Must be the first import of main.ts so it is evaluated before the wallet modules.
import { Buffer } from 'buffer'

const g = globalThis as any
g.Buffer = g.Buffer ?? Buffer
g.process = g.process ?? { env: {} }
