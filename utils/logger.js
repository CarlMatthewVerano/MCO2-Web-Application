import winston from 'winston'
import fs from 'fs'
import path from 'path'

const logDir = 'logs'

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const logger =  winston.createLogger({
  level: 'debug',
  transports: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: path.join(logDir, '/debug.log'), json: false })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true, humanReadableUnhandledException: true }),
    new winston.transports.File({ filename: path.join(logDir, '/debug.log'), json: false, humanReadableUnhandledException: true })
  ],
  exitOnError: false
})

export default logger
