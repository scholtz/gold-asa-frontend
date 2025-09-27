# GitHub Copilot Instructions for ASA.Gold Frontend

## Project Overview

ASA.Gold is a revolutionary gold-backed token platform built on the Algorand blockchain. This Vue.js frontend application enables users to trade, buy, and manage gold-backed ASA (Algorand Standard Asset) tokens and NFTs representing physical gold coins.

### Key Features
- **Gold Token Trading**: Trade gold-backed tokens with real-time pricing
- **Physical Gold NFTs**: Buy/sell NFTs backed by physical gold coins with delivery options
- **Web2/Web3 Authentication**: Seamless wallet integration with email verification
- **Proof of Reserve**: Transparent gold reserves verification system
- **Secondary Marketplace**: Trade gold NFTs on secondary markets
- **Physical Delivery**: Request physical delivery of gold coins to EEA countries

## Architecture Overview

### Technology Stack
- **Frontend**: Vue 3 with TypeScript and Composition API
- **UI Framework**: PrimeVue components with PrimeFlex for styling
- **Blockchain**: Algorand with custom smart contracts
- **Authentication**: algorand-authentication-component-vue
- **State Management**: Pinia stores
- **Build Tool**: Vite
- **Testing**: Vitest for unit tests, Cypress for e2e tests

### Project Structure
```
src/
├── components/          # Reusable Vue components
├── layouts/            # Layout components (AuthLayout)
├── views/              # Page components/views
├── router/             # Vue Router configuration
├── stores/             # Pinia state management
├── types/              # TypeScript type definitions
├── service/            # API and service functions
└── assets/             # Static assets

asa-gold-smartcontract/  # Smart contract code and tests
├── contracts/          # TEALScript smart contracts
├── src/               # Smart contract utilities
└── __test__/          # Contract test suites
```

## Development Guidelines

### Vue.js Patterns
- **Use Composition API**: All new components should use `<script setup lang="ts">`
- **TypeScript**: Maintain strict typing throughout the codebase
- **Component Props**: Define props using `defineProps<T>()` interface syntax
- **Reactive References**: Use `ref()` for primitive values, `reactive()` for objects
- **Computed Properties**: Use `computed()` for derived state

### Algorand Integration Best Practices

#### Wallet Connection
```typescript
// Use the authentication component for wallet integration
import { AlgorandAuthentication } from 'algorand-authentication-component-vue'
import type { IAuthenticationStore, INotification } from 'algorand-authentication-component-vue'

// Access wallet state through the store
const store = useAppStore()
const isAuthenticated = store.state.authState.isAuthenticated
const walletAddress = store.state.authState.account?.addr
```

#### Smart Contract Interactions
- Always use the `algorand-asa-gold` NPM package for contract interactions
- Handle transaction confirmations properly with loading states
- Implement error handling for blockchain operations
- Use proper ASA opt-in flows before token transfers

#### Asset Management
- **Gold Token**: ASA ID 1241944285 (mainnet)
- **DAO Token**: ASA ID 1241945177 (mainnet)
- Always verify ASA opt-in status before transactions
- Handle minimum balance requirements for ASA holding

### Component Development

#### Authentication-Required Components
```vue
<template>
  <Layout :hideTopMenu="false">
    <!-- Your component content -->
  </Layout>
</template>

<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
// Component automatically handles authentication flow
</script>
```

#### Styling Guidelines
- Use PrimeFlex utility classes for layout and spacing
- Leverage PrimeVue components for consistent UI
- Apply responsive design with PrimeFlex grid system
- Use AOS (Animate On Scroll) for page animations

### Smart Contract Development

#### Contract Structure
- Main contract: `AsaGoldSmartcontract` in `asa-gold-smartcontract.algo.ts`
- States: Sale (1), Secondary Sale (3), Delivery Request (4), In Delivery (5)
- Test coverage is mandatory for all contract changes

#### Testing Requirements
```bash
# Run smart contract tests
cd asa-gold-smartcontract
npm test

# Run specific test suite
npm run test1  # Deploy and init tests
```

### API Integration Patterns

#### Service Layer
Create services in `src/service/` for external API calls:
```typescript
// Example service pattern
import axios from 'axios'

export class GoldPriceService {
  private baseUrl = process.env.VITE_API_BASE_URL
  
  async getCurrentPrice(): Promise<number> {
    const response = await axios.get(`${this.baseUrl}/gold-price`)
    return response.data.price
  }
}
```

#### Error Handling
- Use PrimeVue Toast for user notifications
- Implement proper loading states
- Handle blockchain-specific errors (insufficient funds, opt-in required, etc.)

### State Management

#### Pinia Store Structure
```typescript
// stores/app.ts pattern
export const useAppStore = defineStore('app', () => {
  const state = reactive({
    authState: {
      isAuthenticated: false,
      account: null,
      wallet: null
    },
    // Other state properties
  })
  
  return { state }
})
```

### Routing and Navigation

#### Route Configuration
- Use lazy loading for all view components
- Implement route guards for authenticated pages
- Follow RESTful URL patterns where applicable

#### Navigation Patterns
```typescript
// Use router composition API
import { useRouter } from 'vue-router'

const router = useRouter()
const navigateToTrade = () => {
  router.push('/trade-gold')
}
```

## Code Quality Standards

### Linting and Formatting
```bash
npm run lint      # ESLint with auto-fix
npm run format    # Prettier formatting
npm run type-check # TypeScript validation
```

### Testing Strategy
- **Unit Tests**: Components and utilities with Vitest
- **E2E Tests**: Critical user flows with Cypress
- **Smart Contract Tests**: Comprehensive test coverage with Jest

### Performance Considerations
- Lazy load components and routes
- Optimize bundle size with proper imports
- Use computed properties for expensive operations
- Implement proper caching for API calls

## Blockchain-Specific Guidelines

### Transaction Handling
1. **Always validate** wallet connection before transactions
2. **Check ASA opt-in status** before token operations  
3. **Handle minimum balance** requirements (0.1 ALGO per ASA)
4. **Implement proper error handling** for transaction failures
5. **Show transaction confirmation** with proper loading states

### Security Best Practices
- Never expose private keys or mnemonics
- Validate all user inputs before blockchain operations
- Use proper transaction signing patterns
- Implement rate limiting for API calls

### Gas and Fee Management
- Account for transaction fees in user flows
- Provide clear fee information to users
- Handle insufficient balance scenarios gracefully

## Common Patterns and Examples

### Loading States
```vue
<template>
  <Button @click="handleTrade" :loading="isTrading">
    Trade Gold Token
  </Button>
</template>

<script setup lang="ts">
const isTrading = ref(false)

const handleTrade = async () => {
  isTrading.value = true
  try {
    await tradeGoldToken()
  } finally {
    isTrading.value = false
  }
}
</script>
```

### Form Handling
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <InputNumber v-model="amount" :min="0" />
    <Button type="submit" :disabled="!isValidAmount">Submit</Button>
  </form>
</template>

<script setup lang="ts">
const amount = ref(0)
const isValidAmount = computed(() => amount.value > 0)
</script>
```

## Development Workflow

1. **Setup**: Run `npm install` to install dependencies
2. **Development**: Use `npm run dev` for hot reload development
3. **Type Checking**: Run `npm run type-check` regularly
4. **Testing**: Execute `npm run test:unit` for component tests
5. **Building**: Use `npm run build` for production builds
6. **Smart Contracts**: Test contracts with `cd asa-gold-smartcontract && npm install && npm test`

### CI/CD Pipeline
- **Automated Deployment**: Main branch automatically deploys to production via GitHub Actions
- **Build Verification**: All PRs should pass type checking and build successfully
- **Smart Contract Testing**: Contract tests are part of the development workflow

### Environment Configuration
```typescript
// Default environments in app store
const environments = {
  mainnet: {
    algodHost: 'https://mainnet-api.algonode.cloud',
    goldToken: 1241944285,
    daoToken: 1241945177
  },
  testnet: {
    algodHost: 'https://testnet-api.algonode.cloud',
    goldToken: 67395862,
    // Test tokens for development
  }
}
```

## Key Dependencies to Understand

- `algorand-authentication-component-vue`: Wallet authentication
- `algorand-asa-gold`: Smart contract interactions
- `algosdk`: Core Algorand SDK functionality  
- `primevue`: UI component library
- `pinia`: State management
- `aos`: Animation library

## Business Logic Context

### Gold Token Economy
- Gold tokens are backed 1:1 by physical gold reserves
- Users can trade tokens or request physical delivery
- Secondary marketplace allows NFT trading
- Proof of reserve system ensures transparency

### Revenue Streams
- Onramp/offramp fees (0.1% for bank transfers)
- Physical delivery fees (0.9 gold token + postal insurance)
- Secondary marketplace fees
- New coin addition fees (3%)

When developing features, always consider the user experience from both Web2 and Web3 perspectives, ensuring the platform remains accessible to traditional users while leveraging blockchain benefits.

## Debugging and Troubleshooting

### Common Issues and Solutions

#### Wallet Connection Problems
```typescript
// Check authentication state
console.log('Auth State:', store.state.authState)
console.log('Is Authenticated:', store.state.authState.isAuthenticated)
console.log('Wallet Address:', store.state.authState.account?.addr)
```

#### Transaction Failures
1. **Check minimum balance**: Ensure account has 0.1 ALGO per ASA + transaction fees
2. **Verify opt-in status**: User must opt-in to ASAs before receiving them
3. **Validate smart contract state**: Ensure contract is in correct state for operation

#### Build Issues
- Use `npm run type-check` to identify TypeScript errors
- Check for missing dependencies with `npm list`
- Clear node_modules and reinstall if needed

### Performance Debugging
- Use Vue DevTools for component inspection
- Monitor network requests in browser DevTools
- Check bundle size with build output analysis

### Testing Strategies
```bash
# Frontend tests
npm run test:unit           # Component unit tests
npm run test:e2e           # End-to-end tests (requires Cypress binary)

# Smart contract tests
cd asa-gold-smartcontract
npm test                   # Full test suite
npm run test1             # Specific test groups
```