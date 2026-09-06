import { BUN_ENV, PORT } from './config'
import createServer from './lib/server'

const app = createServer()

if (BUN_ENV != 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app