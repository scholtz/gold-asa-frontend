import winston, { format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
let loggerInstance: winston.Logger
/**
 * Returns logger
 */
const { combine, timestamp, label, printf } = format

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`
})

const getLogger = () => {
  if (loggerInstance) return loggerInstance
  const logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), myFormat),
    transports: [
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        zippedArchive: true,
        maxSize: '100m',
        maxFiles: '14d'
      }),
      new DailyRotateFile({
        filename: 'logs/info-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        zippedArchive: true,
        maxSize: '100m',
        maxFiles: '14d'
      }),
      new DailyRotateFile({
        filename: 'logs/all-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '100m',
        maxFiles: '31d'
      }),
      new winston.transports.Console({
        format: winston.format.colorize(),
        level: 'info'
      })
    ]
  })
  loggerInstance = logger
  return loggerInstance
}
export default getLogger
