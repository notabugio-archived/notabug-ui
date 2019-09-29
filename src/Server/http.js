import path from 'path'
import express from 'express'
import compression from 'compression'
import expires from 'express-cache-headers'
import fallback from 'express-history-api-fallback'
import { ChainGunSear } from '@notabug/chaingun-sear'

import init from '@notabug/peer'

const Gun = (global.Gun = require('gun/gun'))
const staticMedia = express.Router()
const root = path.join(__dirname, '..', 'htdocs')

staticMedia.use(express.static(root, { index: false }))

export const initServer = ({ port, host, render, ...options }) => {
  const app = express()
  let nab

  app.use(compression())
  app.use(staticMedia)

  if (options.lmdb) {
    app.get('/gun/nodes/*', expires(60), async (req, res) => {
      const soul = req.path.replace('/gun/nodes/', '')
      const result = await nab.gun.lmdb.getRaw(soul)
      if (!result) return res.status(404).end()
      res.set('Content-Type', 'application/json')
      res.send(result || '')
      res.end()
    })
  } else {
    // This is untested, good luck.  LMDB really is the way to go
    app.get('/gun/nodes/*', expires(60), async (req, res) => {
      const soul = req.path.replace('/gun/nodes/', '')
      const result = await new Promise((ok, fail) => {
        nab.gun.get(soul).not(() => ok(null)).once(ok)
      })
      if (!result) return res.status(404).end()
      res.json(result)
      res.end()
    })
  }

  if (options.dev) {
    const Bundler = require('parcel-bundler')
    const bundler = new Bundler(
      path.join(__dirname, '..', 'src', 'index.html'),
      {
        hmrPort: process.env.HMRPORT || 3334
      }
    )
    app.use(bundler.middleware())
  } else if (render) {
    const renderer = require('./renderer').default

    app.get('/gun', (req, res) => res.end())
    app.get('*', expires(60), (...args) => renderer(nab, ...args))
  } else {
    app.use(fallback('index.html', { root }))
  }

  const web = app.listen(port, host)

  nab = init(ChainGunSear, {
    ...options,
    disableValidation: options.pistol ? true : options.disableValidation,
    web: options.pistol ? undefined : web,
    leech: options.leech,
    peers: options.pistol
      ? port
        ? [] // [`http://${host || "127.0.0.1"}:${port}/gun`]
        : []
      : options.peers
  })
  if (options.pistol) {
    nab.receiver = require('./receiver').default({
      redis: options.redis,
      lmdb: options.lmdb,
      peers: options.peers,
      logging: options.logging,
      web
    })
  }
  // without a get gun never connects to receiver
  if (options.pistol) nab.gun.get('~@').once(() => null)
  return nab
}
