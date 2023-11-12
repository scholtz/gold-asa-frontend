import createArc3Files from '../createArc3Files'

const app = async () => {
  console.log(`${Date()} App started`)
  await createArc3Files('testnet', 1)
}

app()
