import server from './server.js'
import logger from './config/logger.config.js'
import { mongooseConnect } from './config/index.config.js'
import { gracefulShutdown } from './utils/gracefulShutdown.js'
import {
  PORT,
  NODE_ENV,
  MONGO_DEVELOPMENT_URI,
  MONGO_PRODUCTION_URI
} from './constants.js'

// Start server
const app = server.listen(PORT, () => {
  logger.info('connected to 8080')
})

if (NODE_ENV === 'development') {
  mongooseConnect(MONGO_DEVELOPMENT_URI)
}

if (NODE_ENV === 'production') {
  mongooseConnect(MONGO_PRODUCTION_URI)
  gracefulShutdown(app)
}

export default app
