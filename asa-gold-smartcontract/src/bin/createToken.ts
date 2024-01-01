import createArc3Files from '../createArc3Files'

const app = async () => {
  console.log(`${Date()} App started`)
  for (let i = 13; i <= 13; i++) {
    await createArc3Files('mainnet', i)
  }
}

app()
