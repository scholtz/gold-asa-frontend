import createArc3FilesDao from '../createArc3FilesDao'

const app = async () => {
  console.log(`${Date()} App started`)
  await createArc3FilesDao()
}

app()
