/* globals Promise */
import * as R from 'ramda'
import {
  chainInterface,
  Receiver,
  deduplicateMessages,
  relayMessages,
  cluster,
  websocketTransport
} from '@notabug/gun-receiver'
import { receiver as lmdb } from '@notabug/gun-lmdb'
import { Validation } from '@notabug/peer'
import { options } from './options'
import winston, { format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { gunReceiverLog } from '@notabug/gun-receiver-log'

const Gun = require('gun/gun')
const { combine, timestamp, prettyPrint } = format
const suppressor = Validation ? Validation.createSuppressor(Gun) : undefined

const validateMessage = ({ json, skipValidation, ...msg }) => {
  if (skipValidation || !suppressor) return { ...msg, json }

  return suppressor.validate(json).then(validated => {
    if (!validated) return console.error(suppressor.validate.errors, json)
    return { ...msg, json: validated }
  })
}

const lmdbConf = { path: options.lmdbpath, mapSize: options.lmdbmapsize }

const lmdbSupport = R.pipe(
  lmdb.respondToGets(Gun, { disableRelay: true }, lmdbConf),
  chainInterface,
  lmdb.acceptWrites(Gun, { disableRelay: true }, lmdbConf)
)

const logging = () => {
  let def = {
    filename: `logs/info-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    level: 'info'
  }
  const logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), prettyPrint()),
    transports: [new DailyRotateFile(def)]
  })

  return gunReceiverLog(logger)
}

export default opts =>
  R.pipe(
    Receiver,
    deduplicateMessages,
    db => {
      db.onIn(msg => {
        if (msg && msg.json && msg.json.ok) console.log(msg.json)
        return msg
      })
      return db
    },
    opts.logging ? logging() : R.identity,
    opts.disableValidation ? R.identity : db => db.onIn(validateMessage) && db,
    opts.lmdb ? lmdbSupport : R.identity,
    relayMessages,
    cluster,
    opts.port || opts.web ? websocketTransport.server(opts) : R.identity,
    ...opts.peers.map(peer => websocketTransport.client(peer))
  )(opts)
