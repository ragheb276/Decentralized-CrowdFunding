import rateLimit from 'express-rate-limit'
import logger from './logger.config.js'
import mongoose from 'mongoose'
import multer from 'multer'

export const requestLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Limit each IP to 200 requests per `window` per 1 minute
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests, please try again later.',
  statusCode: 429 // Too Many Requests
})

export function mongooseConnect(mongoUri) {
  mongoose.set('strictQuery', false)
  mongoose
    .connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      logger.info('mongoDB connected')
      process.env.CI && process.exit(0)
    })
    .catch((error) => {
      logger.error(error.message)
      process.env.CI && process.exit(1)
    })

  mongoose.connection.on('disconnected', () => {
    logger.error('mongoDB disconnected')
  })
}

export function mongooseDisconnect() {
  mongoose.connection
    .close()
    .then(() => logger.warn('mongoDB disconnected'))
    .catch(logger.error)
}

const imageFilter = (req, file, cb) => {
  // Check if the file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true) // Accept the file
  } else {
    const error = new multer.MulterError(422, 'file')
    error.message = 'Only images are allowed!'
    cb(error, false) // Reject the file
  }
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter: imageFilter
})
