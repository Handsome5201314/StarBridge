import { createApiApp } from './app'
import { createPrismaRepository } from './repositories/prismaRepository'

const port = Number(process.env.PORT || 5174)
const host = process.env.HOST || '127.0.0.1'
const repository =
  process.env.STARBRIDGE_REPOSITORY === 'memory' ? undefined : createPrismaRepository()

createApiApp({ repository }).listen(port, host, () => {
  console.log(`StarBridge API listening on http://${host}:${port}`)
})
