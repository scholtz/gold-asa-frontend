import createArc3FilesGold from '../createArc3FilesGold'

const app = async () => {
  console.log(`${Date()} App started`)
  await createArc3FilesGold()
}

app()
