import winston from 'winston'
import { NODE_ENV } from '../constants.js'

const { combine, timestamp, printf } = winston.format

// Define the log format
const productionLogFormat = printf((info) => {
  return `${info.timestamp} ${info.level}: ${info.message}`
})

const devLogFormat = printf((info) => {
  return `${info.level}: ${info.message}`
})

let logger

if (NODE_ENV === 'development') {
  logger = winston.createLogger({
    level: 'info', // info and above types like warn, error, etc. will be logged
    format: combine(winston.format.colorize(), devLogFormat),
    transports: [
      new winston.transports.Console({}),
      new winston.transports.File({
        filename: 'logs.log',
        level: 'warn'
      })
    ]
  })
} else if (NODE_ENV === 'production') {
  // log to console if in CI environment, otherwise log to file
  const transports = process.env.CI
    ? [new winston.transports.Console({})]
    : [
        new winston.transports.File({
          filename: './logs/logs.log'
        })
      ]
  logger = winston.createLogger({
    level: 'info', // warn and above types like error will be logged
    format: combine(
      timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
      productionLogFormat
    ),
    transports
  })
}

export default logger
