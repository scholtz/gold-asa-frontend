import createArc3Files from '../createArc3Files'

const app = async () => {
  console.log(`${Date()} App started`)
  for (let i = 14; i <= 14; i++) {
    await createArc3Files('mainnet', i)
  }
}

app()
