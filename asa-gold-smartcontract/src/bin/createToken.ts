import createArc3Files from '../createArc3Files'

const app = async () => {
  console.log(`${Date()} App started`)
  for (let i = 15; i <= 16; i++) {
    await createArc3Files('mainnet', i)
  }
}

app()
