console.log('---START---')

import * as R from 'ramda'
import { ThingSet, Config, Schema } from '@notabug/peer'
import WS from 'ws'
import { options } from './options'
import { owner, tabulator, indexer } from '/config'
import { ChainGunSear } from '@notabug/chaingun-sear'

Config.update({ owner, tabulator, indexer })
const Gun = (global.Gun = require('gun/sea').Gun)

let nab
const peerOptions = {
  ...R.pick(['localStorage', 'persist', 'disableValidation', 'until'], options),
  peers: options.peer || [],
  gc_info_enable: options.debug,
  super: !options.leech
}

process.env.GUN_ENV = options.debug ? 'debug' : undefined
require('gun/lib/not')
require('gun/nts')
require('gun/lib/store')
require('gun/lib/rs3')
require('gun/lib/wire')
require('gun/lib/verify')
require('gun/lib/then')
if (options.evict) require('gun/lib/les')
if (options.debug) require('gun/lib/debug')
if (options.redis) require('@notabug/gun-redis').attachToGun(Gun)
if (options.openstack) {
  const openStackOpts = {
    url: options.openstack
  }
  require('@notabug/gun-openstack-swift').attachToGun(Gun, openStackOpts)
}
if (options.lmdb) {
  require('@notabug/gun-lmdb').attachToGun(Gun, {
    path: options.lmdbpath,
    mapSize: options.lmdbmapsize
  })
}

if (options.port) {
  nab = require('./http').initServer({
    ...peerOptions,
    ...R.pick(
      ['pistol', 'render', 'redis', 'lmdb', 'host', 'port', 'dev', 'logging'],
      options
    )
  })
} else {
  nab = require('@notabug/peer').default(ChainGunSear, {
    ...peerOptions,
    WS,
    multicast: false
  })
  nab.gun.get('~@').once(() => null)
}

if (options.redis) nab.gun.redis = Gun.redis
if (options.lmdb) nab.gun.lmdb = Gun.lmdb

if (options.sync) nab.synchronize()
if (options.index || options.tabulate) {
  const { username, password } = require('../../server-config.json')

  nab.login(username, password).then(() => {
    console.log('logged in', username)
    let scopeParams = {
      unsub: true
    }

    if (options.index) nab.index(scopeParams)
    if (options.tabulate) nab.tabulate(scopeParams)
  })
}
