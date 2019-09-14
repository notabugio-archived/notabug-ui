import commandLineArgs from 'command-line-args'
import { Config } from '@notabug/peer'
import { owner, tabulator, indexer } from '/config'

Config.update({ owner, tabulator, indexer })

export const options = commandLineArgs([
  { name: 'dev', type: Boolean, defaultValue: false },
  {
    name: 'persist',
    alias: 'P',
    type: Boolean,
    defaultValue: false
  },
  {
    name: 'redis',
    alias: 'r',
    type: Boolean,
    defaultValue: false
  },
  { name: 'lmdb', type: Boolean, defaultValue: false },
  { name: 'lmdbpath', type: String, defaultValue: 'lmdbdata' },
  { name: 'lmdbmapsize', type: Number, defaultValue: 1024 ** 4 },
  {
    name: 'disableValidation',
    alias: 'D',
    type: Boolean,
    defaultValue: false
  },
  {
    name: 'evict',
    alias: 'e',
    type: Boolean,
    defaultValue: false
  },
  {
    name: 'debug',
    alias: 'd',
    type: Boolean,
    defaultValue: false
  },
  {
    name: 'render',
    alias: 'z',
    type: Boolean,
    defaultValue: false
  },
  { name: 'port', alias: 'p', type: Number, defaultValue: null },
  {
    name: 'pistol',
    alias: 'i',
    type: Boolean,
    defaultValue: false
  },
  {
    name: 'host',
    alias: 'h',
    type: String,
    defaultValue: '127.0.0.1'
  },
  { name: 'peer', multiple: true, type: String },
  { name: 'leech', type: Boolean, defaultValue: false },
  { name: 'until', alias: 'u', type: Number, defaultValue: 1000 },
  { name: 'index', type: Boolean, defaultValue: false },
  { name: 'sync', type: Boolean, defaultValue: false },
  { name: 'backindex', type: Boolean, defaultValue: false },
  { name: 'logging', type: Boolean, defaultValue: false },
  {
    name: 'listings',
    alias: 'v',
    type: Boolean,
    defaultValue: false
  },
  {
    name: 'spaces',
    alias: 's',
    type: Boolean,
    defaultValue: false
  },
  {
    name: 'tabulate',
    alias: 't',
    type: Boolean,
    defaultValue: false
  },
  {
    name: 'comments',
    alias: 'c',
    type: Boolean,
    defaultValue: false
  },
  { name: 'openstack', type: String }
])
