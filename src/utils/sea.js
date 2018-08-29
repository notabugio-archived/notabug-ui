/* eslint-disable */
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

;(function () {

  /* UNBUILD */
  var root;
  if (typeof window !== "undefined") {
    root = window;
  }
  if (typeof global !== "undefined") {
    root = global;
  }
  root = root || {};
  var console = root.console || { log: function log() {} };
  function USE(arg) {
    return arg.slice ? USE[R(arg)] : function (mod, path) {
      arg(mod = { exports: {} });
      USE[R(path)] = mod.exports;
    };
    function R(p) {
      return p.split('/').slice(-1).toString().replace('.js', '');
    }
  }
  if (typeof module !== "undefined") {
    var common = module;
  }
  /* UNBUILD */

  ;USE(function (module) {
    // Security, Encryption, and Authorization: SEA.js
    // MANDATORY READING: http://gun.js.org/explainers/data/security.html
    // THIS IS AN EARLY ALPHA!

    function SEA() {}
    if (typeof window !== "undefined") {
      (SEA.window = window).SEA = SEA;
    }

    module.exports = SEA;
  })(USE, './root');

  ;USE(function (module) {
    var SEA = USE('./root');
    if (SEA.window) {
      if (location.protocol.indexOf('s') < 0 && location.host.indexOf('localhost') < 0 && location.protocol.indexOf('file:') < 0) {
        location.protocol = 'https:'; // WebCrypto does NOT work without HTTPS!
      }
    }
  })(USE, './https');

  ;USE(function (module) {
    // This is Array extended to have .toString(['utf8'|'hex'|'base64'])
    function SeaArray() {}
    Object.assign(SeaArray, { from: Array.from });
    SeaArray.prototype = Object.create(Array.prototype);
    SeaArray.prototype.toString = function (enc, start, end) {
      var _this = this;

      enc = enc || 'utf8';start = start || 0;
      var length = this.length;
      if (enc === 'hex') {
        var buf = new Uint8Array(this);
        return [].concat(_toConsumableArray(Array((end && end + 1 || length) - start).keys())).map(function (i) {
          return buf[i + start].toString(16).padStart(2, '0');
        }).join('');
      }
      if (enc === 'utf8') {
        return Array.from({ length: (end || length) - start }, function (_, i) {
          return String.fromCharCode(_this[i + start]);
        }).join('');
      }
      if (enc === 'base64') {
        return btoa(this);
      }
    };
    module.exports = SeaArray;
  })(USE, './array');

  ;USE(function (module) {
    // This is Buffer implementation used in SEA. Functionality is mostly
    // compatible with NodeJS 'safe-buffer' and is used for encoding conversions
    // between binary and 'hex' | 'utf8' | 'base64'
    // See documentation and validation for safe implementation in:
    // https://github.com/feross/safe-buffer#update
    var SeaArray = USE('./array');
    function SafeBuffer() {
      console.warn('new SafeBuffer() is depreciated, please use SafeBuffer.from()');
      return SafeBuffer.from.apply(SafeBuffer, arguments);
    }
    SafeBuffer.prototype = Object.create(Array.prototype);
    Object.assign(SafeBuffer, {
      // (data, enc) where typeof data === 'string' then enc === 'utf8'|'hex'|'base64'
      from: function from() {
        if (!Object.keys(arguments).length) {
          throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
        }
        var input = arguments[0];
        var buf = void 0;
        if (typeof input === 'string') {
          var enc = arguments[1] || 'utf8';
          if (enc === 'hex') {
            var bytes = input.match(/([\da-fA-F]{2})/g).map(function (byte) {
              return parseInt(byte, 16);
            });
            if (!bytes || !bytes.length) {
              throw new TypeError('Invalid first argument for type \'hex\'.');
            }
            buf = SeaArray.from(bytes);
          } else if (enc === 'utf8') {
            var _length = input.length;
            var words = new Uint16Array(_length);
            Array.from({ length: _length }, function (_, i) {
              return words[i] = input.charCodeAt(i);
            });
            buf = SeaArray.from(words);
          } else if (enc === 'base64') {
            var dec = atob(input);
            var _length2 = dec.length;
            var _bytes = new Uint8Array(_length2);
            Array.from({ length: _length2 }, function (_, i) {
              return _bytes[i] = dec.charCodeAt(i);
            });
            buf = SeaArray.from(_bytes);
          } else if (enc === 'binary') {
            buf = SeaArray.from(input);
          } else {
            console.info('SafeBuffer.from unknown encoding: ' + enc);
          }
          return buf;
        }
        var byteLength = input.byteLength;
        var length = input.byteLength ? input.byteLength : input.length;
        if (length) {
          var _buf = void 0;
          if (input instanceof ArrayBuffer) {
            _buf = new Uint8Array(input);
          }
          return SeaArray.from(_buf || input);
        }
      },

      // This is 'safe-buffer.alloc' sans encoding support
      alloc: function alloc(length) /*, enc*/{
        var fill = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        return SeaArray.from(new Uint8Array(Array.from({ length: length }, function () {
          return fill;
        })));
      },

      // This is normal UNSAFE 'buffer.alloc' or 'new Buffer(length)' - don't use!
      allocUnsafe: function allocUnsafe(length) {
        return SeaArray.from(new Uint8Array(Array.from({ length: length })));
      },

      // This puts together array of array like members
      concat: function concat(arr) {
        // octet array
        if (!Array.isArray(arr)) {
          throw new TypeError('First argument must be Array containing ArrayBuffer or Uint8Array instances.');
        }
        return SeaArray.from(arr.reduce(function (ret, item) {
          return ret.concat(Array.from(item));
        }, []));
      }
    });
    SafeBuffer.prototype.from = SafeBuffer.from;
    SafeBuffer.prototype.toString = SeaArray.prototype.toString;

    module.exports = SafeBuffer;
  })(USE, './buffer');

  ;USE(function (module) {
    var Buffer = USE('./buffer');
    var api = { Buffer: Buffer };

    if (typeof __webpack_require__ === 'function' || typeof window !== 'undefined') {
      var crypto = window.crypto || window.msCrypto;
      var subtle = crypto.subtle || crypto.webkitSubtle;
      var TextEncoder = window.TextEncoder;
      var TextDecoder = window.TextDecoder;
      Object.assign(api, {
        crypto: crypto,
        subtle: subtle,
        TextEncoder: TextEncoder,
        TextDecoder: TextDecoder,
        random: function random(len) {
          return Buffer.from(crypto.getRandomValues(new Uint8Array(Buffer.alloc(len))));
        }
      });
    } else {
      try {
        var crypto = require('crypto');

        var _require = require('@trust/webcrypto'),
            _subtle = _require.subtle; // All but ECDH


        var _require2 = require('text-encoding'),
            _TextEncoder = _require2.TextEncoder,
            _TextDecoder = _require2.TextDecoder;

        Object.assign(api, {
          crypto: crypto,
          subtle: _subtle,
          TextEncoder: _TextEncoder,
          TextDecoder: _TextDecoder,
          random: function random(len) {
            return Buffer.from(crypto.randomBytes(len));
          }
        });
        try {
          var WebCrypto = require('node-webcrypto-ossl');
          api.ossl = new WebCrypto({ directory: 'ossl' }).subtle; // ECDH
        } catch (e) {
          console.log("node-webcrypto-ossl is optionally needed for ECDH, please install if needed.");
        }
      } catch (e) {
        console.log("@trust/webcrypto and text-encoding are not included by default, you must add it to your package.json!");
        TRUST_WEBCRYPTO_OR_TEXT_ENCODING_NOT_INSTALLED;
      }
    }

    module.exports = api;
  })(USE, './shim');

  ;USE(function (module) {
    var Buffer = USE('./buffer');
    var settings = {};
    // Encryption parameters
    var pbkdf2 = { hash: 'SHA-256', iter: 100000, ks: 64 };

    var ecdsaSignProps = { name: 'ECDSA', hash: { name: 'SHA-256' } };
    var ecdsaKeyProps = { name: 'ECDSA', namedCurve: 'P-256' };
    var ecdhKeyProps = { name: 'ECDH', namedCurve: 'P-256' };

    var _initial_authsettings = {
      validity: 12 * 60 * 60, // internally in seconds : 12 hours
      hook: function hook(props) {
        return props;
      } // { iat, exp, alias, remember }
      // or return new Promise((resolve, reject) => resolve(props)

      // These are used to persist user's authentication "session"
    };var authsettings = Object.assign({}, _initial_authsettings);
    // This creates Web Cryptography API compliant JWK for sign/verify purposes
    var keysToEcdsaJwk = function keysToEcdsaJwk(pub, d) {
      // d === priv
      var _pub$split = pub.split('.'),
          _pub$split2 = _slicedToArray(_pub$split, 2),
          x = _pub$split2[0],
          y = _pub$split2[1]; // new


      var jwk = { kty: "EC", crv: "P-256", x: x, y: y, ext: true };
      jwk.key_ops = d ? ['sign'] : ['verify'];
      if (d) {
        jwk.d = d;
      }
      return jwk;
    };

    Object.assign(settings, {
      pbkdf2: pbkdf2,
      ecdsa: {
        pair: ecdsaKeyProps,
        sign: ecdsaSignProps
      },
      ecdh: ecdhKeyProps,
      jwk: keysToEcdsaJwk,
      recall: authsettings
    });
    module.exports = settings;
  })(USE, './settings');

  ;USE(function (module) {
    module.exports = function (props) {
      try {
        if (props.slice && 'SEA{' === props.slice(0, 4)) {
          props = props.slice(3);
        }
        return props.slice ? JSON.parse(props) : props;
      } catch (e) {} //eslint-disable-line no-empty
      return props;
    };
  })(USE, './parse');

  ;USE(function (module) {
    var _this2 = this;

    var shim = USE('./shim');
    var Buffer = USE('./buffer');
    var parse = USE('./parse');

    var _USE = USE('./settings'),
        pbkdf2 = _USE.pbkdf2;
    // This internal func returns SHA-256 hashed data for signing


    var sha256hash = function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(mm) {
        var m, hash;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                m = parse(mm);
                _context.next = 3;
                return shim.subtle.digest({ name: pbkdf2.hash }, new shim.TextEncoder().encode(m));

              case 3:
                hash = _context.sent;
                return _context.abrupt("return", Buffer.from(hash));

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, _this2);
      }));

      return function sha256hash(_x2) {
        return _ref.apply(this, arguments);
      };
    }();
    module.exports = sha256hash;
  })(USE, './sha256');

  ;USE(function (module) {
    // This internal func returns SHA-1 hashed data for KeyID generation
    var __shim = USE('./shim');
    var subtle = __shim.subtle;
    var ossl = __shim.ossl ? __shim.__ossl : subtle;
    var sha1hash = function sha1hash(b) {
      return ossl.digest({ name: 'SHA-1' }, new ArrayBuffer(b));
    };
    module.exports = sha1hash;
  })(USE, './sha1');

  ;USE(function (module) {
    var _this3 = this;

    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var u;

    SEA.work = function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(data, pair, cb) {
        var salt, key, result, _r, crypto, hash, r;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                // used to be named `proof`
                salt = pair.epub || pair; // epub not recommended, salt should be random!

                if (salt instanceof Function) {
                  cb = salt;
                  salt = u;
                }
                salt = salt || shim.random(9);

                if (!SEA.window) {
                  _context2.next = 15;
                  break;
                }

                _context2.next = 7;
                return shim.subtle.importKey('raw', new shim.TextEncoder().encode(data), { name: 'PBKDF2' }, false, ['deriveBits']);

              case 7:
                key = _context2.sent;
                _context2.next = 10;
                return shim.subtle.deriveBits({
                  name: 'PBKDF2',
                  iterations: S.pbkdf2.iter,
                  salt: new shim.TextEncoder().encode(salt),
                  hash: S.pbkdf2.hash
                }, key, S.pbkdf2.ks * 8);

              case 10:
                result = _context2.sent;

                data = shim.random(data.length); // Erase data in case of passphrase
                _r = shim.Buffer.from(result, 'binary').toString('utf8');

                if (cb) {
                  try {
                    cb(_r);
                  } catch (e) {
                    console.log(e);
                  }
                }
                return _context2.abrupt("return", _r);

              case 15:
                // For NodeJS crypto.pkdf2 rocks
                crypto = shim.crypto;
                hash = crypto.pbkdf2Sync(data, new shim.TextEncoder().encode(salt), S.pbkdf2.iter, S.pbkdf2.ks, S.pbkdf2.hash.replace('-', '').toLowerCase());

                data = shim.random(data.length); // Erase passphrase for app
                r = hash && hash.toString('utf8');

                if (cb) {
                  try {
                    cb(r);
                  } catch (e) {
                    console.log(e);
                  }
                }
                return _context2.abrupt("return", r);

              case 23:
                _context2.prev = 23;
                _context2.t0 = _context2["catch"](0);

                SEA.err = _context2.t0;
                if (cb) {
                  cb();
                }
                return _context2.abrupt("return");

              case 28:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, _this3, [[0, 23]]);
      }));

      return function (_x3, _x4, _x5) {
        return _ref2.apply(this, arguments);
      };
    }();

    module.exports = SEA.work;
  })(USE, './work');

  ;USE(function (module) {
    var _this4 = this;

    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var Buff = typeof Buffer !== 'undefined' ? Buffer : shim.Buffer;

    //SEA.pair = async (data, proof, cb) => { try {
    SEA.pair = function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(cb) {
        var ecdhSubtle, sa, dh, r;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                ecdhSubtle = shim.ossl || shim.subtle;
                // First: ECDSA keys for signing/verifying...

                _context5.next = 4;
                return shim.subtle.generateKey(S.ecdsa.pair, true, ['sign', 'verify']).then(function () {
                  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(keys) {
                    var key, pub;
                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            // privateKey scope doesn't leak out from here!
                            //const { d: priv } = await shim.subtle.exportKey('jwk', keys.privateKey)
                            key = {};
                            _context3.next = 3;
                            return shim.subtle.exportKey('jwk', keys.privateKey);

                          case 3:
                            key.priv = _context3.sent.d;
                            _context3.next = 6;
                            return shim.subtle.exportKey('jwk', keys.publicKey);

                          case 6:
                            pub = _context3.sent;

                            //const pub = Buff.from([ x, y ].join(':')).toString('base64') // old
                            key.pub = pub.x + '.' + pub.y; // new
                            // x and y are already base64
                            // pub is UTF8 but filename/URL safe (https://www.ietf.org/rfc/rfc3986.txt)
                            // but split on a non-base64 letter.
                            return _context3.abrupt("return", key);

                          case 9:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3, _this4);
                  }));

                  return function (_x7) {
                    return _ref4.apply(this, arguments);
                  };
                }());

              case 4:
                sa = _context5.sent;
                _context5.prev = 5;
                _context5.next = 8;
                return ecdhSubtle.generateKey(S.ecdh, true, ['deriveKey']).then(function () {
                  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(keys) {
                    var key, pub;
                    return regeneratorRuntime.wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            // privateKey scope doesn't leak out from here!
                            key = {};
                            _context4.next = 3;
                            return ecdhSubtle.exportKey('jwk', keys.privateKey);

                          case 3:
                            key.epriv = _context4.sent.d;
                            _context4.next = 6;
                            return ecdhSubtle.exportKey('jwk', keys.publicKey);

                          case 6:
                            pub = _context4.sent;

                            //const epub = Buff.from([ ex, ey ].join(':')).toString('base64') // old
                            key.epub = pub.x + '.' + pub.y; // new
                            // ex and ey are already base64
                            // epub is UTF8 but filename/URL safe (https://www.ietf.org/rfc/rfc3986.txt)
                            // but split on a non-base64 letter.
                            return _context4.abrupt("return", key);

                          case 9:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, _callee4, _this4);
                  }));

                  return function (_x8) {
                    return _ref5.apply(this, arguments);
                  };
                }());

              case 8:
                dh = _context5.sent;
                _context5.next = 20;
                break;

              case 11:
                _context5.prev = 11;
                _context5.t0 = _context5["catch"](5);

                if (!SEA.window) {
                  _context5.next = 15;
                  break;
                }

                throw _context5.t0;

              case 15:
                if (!(_context5.t0 == 'Error: ECDH is not a supported algorithm')) {
                  _context5.next = 19;
                  break;
                }

                console.log('Ignoring ECDH...');_context5.next = 20;
                break;

              case 19:
                throw _context5.t0;

              case 20:
                dh = dh || {};

                r = { pub: sa.pub, priv: sa.priv, /* pubId, */epub: dh.epub, epriv: dh.epriv };

                if (cb) {
                  try {
                    cb(r);
                  } catch (e) {
                    console.log(e);
                  }
                }
                return _context5.abrupt("return", r);

              case 26:
                _context5.prev = 26;
                _context5.t1 = _context5["catch"](0);

                console.log(_context5.t1);
                SEA.err = _context5.t1;
                if (cb) {
                  cb();
                }
                return _context5.abrupt("return");

              case 32:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, _this4, [[0, 26], [5, 11]]);
      }));

      return function (_x6) {
        return _ref3.apply(this, arguments);
      };
    }();

    module.exports = SEA.pair;
  })(USE, './pair');

  ;USE(function (module) {
    var _this5 = this;

    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var sha256hash = USE('./sha256');

    SEA.sign = function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(data, pair, cb) {
        var pub, priv, jwk, msg, hash, sig, r;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.prev = 0;

                if (!(data.slice && 'SEA{' === data.slice(0, 4) && '"m":' === data.slice(4, 8))) {
                  _context6.next = 4;
                  break;
                }

                // TODO: This would prevent pair2 signing pair1's signature.
                // So we may want to change this in the future.
                // but for now, we want to prevent duplicate double signature.
                if (cb) {
                  try {
                    cb(data);
                  } catch (e) {
                    console.log(e);
                  }
                }
                return _context6.abrupt("return", data);

              case 4:
                pub = pair.pub;
                priv = pair.priv;
                jwk = S.jwk(pub, priv);
                msg = JSON.stringify(data);
                _context6.next = 10;
                return sha256hash(msg);

              case 10:
                hash = _context6.sent;
                _context6.next = 13;
                return shim.subtle.importKey('jwk', jwk, S.ecdsa.pair, false, ['sign']).then(function (key) {
                  return shim.subtle.sign(S.ecdsa.sign, key, new Uint8Array(hash));
                });

              case 13:
                sig = _context6.sent;
                // privateKey scope doesn't leak out from here!
                r = 'SEA' + JSON.stringify({ m: msg, s: shim.Buffer.from(sig, 'binary').toString('utf8') });


                if (cb) {
                  try {
                    cb(r);
                  } catch (e) {
                    console.log(e);
                  }
                }
                return _context6.abrupt("return", r);

              case 19:
                _context6.prev = 19;
                _context6.t0 = _context6["catch"](0);

                console.log(_context6.t0);
                SEA.err = _context6.t0;
                if (cb) {
                  cb();
                }
                return _context6.abrupt("return");

              case 25:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, _this5, [[0, 19]]);
      }));

      return function (_x9, _x10, _x11) {
        return _ref6.apply(this, arguments);
      };
    }();

    module.exports = SEA.sign;
  })(USE, './sign');

  ;USE(function (module) {
    var _this6 = this;

    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var sha256hash = USE('./sha256');
    var parse = USE('./parse');
    var u;

    SEA.verify = function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(data, pair, cb) {
        var json, raw, pub, jwk, key, hash, sig, check, r;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.prev = 0;
                json = parse(data);

                if (!(false === pair)) {
                  _context7.next = 6;
                  break;
                }

                // don't verify!
                raw = json !== data ? json.s && json.m ? parse(json.m) : data : json;

                if (cb) {
                  try {
                    cb(raw);
                  } catch (e) {
                    console.log(e);
                  }
                }
                return _context7.abrupt("return", raw);

              case 6:
                pub = pair.pub || pair;
                jwk = S.jwk(pub);
                _context7.next = 10;
                return shim.subtle.importKey('jwk', jwk, S.ecdsa.pair, false, ['verify']);

              case 10:
                key = _context7.sent;
                _context7.next = 13;
                return sha256hash(json.m);

              case 13:
                hash = _context7.sent;
                sig = new Uint8Array(shim.Buffer.from(json.s, 'utf8'));
                _context7.next = 17;
                return shim.subtle.verify(S.ecdsa.sign, key, sig, new Uint8Array(hash));

              case 17:
                check = _context7.sent;

                if (check) {
                  _context7.next = 20;
                  break;
                }

                throw "Signature did not match.";

              case 20:
                r = check ? parse(json.m) : u;


                if (cb) {
                  try {
                    cb(r);
                  } catch (e) {
                    console.log(e);
                  }
                }
                return _context7.abrupt("return", r);

              case 25:
                _context7.prev = 25;
                _context7.t0 = _context7["catch"](0);

                console.log(_context7.t0);
                SEA.err = _context7.t0;
                if (cb) {
                  cb();
                }
                return _context7.abrupt("return");

              case 31:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, _this6, [[0, 25]]);
      }));

      return function (_x12, _x13, _x14) {
        return _ref7.apply(this, arguments);
      };
    }();

    module.exports = SEA.verify;
  })(USE, './verify');

  ;USE(function (module) {
    var _this7 = this;

    var shim = USE('./shim');
    var sha256hash = USE('./sha256');

    var importGen = function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(key, salt, opt) {
        var combo, hash;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                //const combo = shim.Buffer.concat([shim.Buffer.from(key, 'utf8'), salt || shim.random(8)]).toString('utf8') // old
                opt = opt || {};
                combo = key + (salt || shim.random(8)).toString('utf8'); // new

                _context8.t0 = shim.Buffer;
                _context8.next = 5;
                return sha256hash(combo);

              case 5:
                _context8.t1 = _context8.sent;
                hash = _context8.t0.from.call(_context8.t0, _context8.t1, 'binary');
                _context8.next = 9;
                return shim.subtle.importKey('raw', new Uint8Array(hash), opt.name || 'AES-GCM', false, ['encrypt', 'decrypt']);

              case 9:
                return _context8.abrupt("return", _context8.sent);

              case 10:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, _this7);
      }));

      return function importGen(_x15, _x16, _x17) {
        return _ref8.apply(this, arguments);
      };
    }();
    module.exports = importGen;
  })(USE, './aeskey');

  ;USE(function (module) {
    var _this8 = this;

    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var aeskey = USE('./aeskey');

    SEA.encrypt = function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(data, pair, cb, opt) {
        var key, msg, rand, ct, r;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.prev = 0;
                opt = opt || {};
                key = pair.epriv || pair;
                msg = JSON.stringify(data);
                rand = { s: shim.random(8), iv: shim.random(16) };
                _context9.next = 7;
                return aeskey(key, rand.s, opt).then(function (aes) {
                  return shim.subtle.encrypt({ // Keeping the AES key scope as private as possible...
                    name: opt.name || 'AES-GCM', iv: new Uint8Array(rand.iv)
                  }, aes, new shim.TextEncoder().encode(msg));
                });

              case 7:
                ct = _context9.sent;
                r = 'SEA' + JSON.stringify({
                  ct: shim.Buffer.from(ct, 'binary').toString('utf8'),
                  iv: rand.iv.toString('utf8'),
                  s: rand.s.toString('utf8')
                });


                if (cb) {
                  try {
                    cb(r);
                  } catch (e) {
                    console.log(e);
                  }
                }
                return _context9.abrupt("return", r);

              case 13:
                _context9.prev = 13;
                _context9.t0 = _context9["catch"](0);

                SEA.err = _context9.t0;
                if (cb) {
                  cb();
                }
                return _context9.abrupt("return");

              case 18:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, _this8, [[0, 13]]);
      }));

      return function (_x18, _x19, _x20, _x21) {
        return _ref9.apply(this, arguments);
      };
    }();

    module.exports = SEA.encrypt;
  })(USE, './encrypt');

  ;USE(function (module) {
    var _this9 = this;

    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    var aeskey = USE('./aeskey');
    var parse = USE('./parse');

    SEA.decrypt = function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(data, pair, cb, opt) {
        var key, json, ct, r;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.prev = 0;
                opt = opt || {};
                key = pair.epriv || pair;
                json = parse(data);
                _context10.next = 6;
                return aeskey(key, shim.Buffer.from(json.s, 'utf8'), opt).then(function (aes) {
                  return shim.subtle.decrypt({ // Keeping aesKey scope as private as possible...
                    name: opt.name || 'AES-GCM', iv: new Uint8Array(shim.Buffer.from(json.iv, 'utf8'))
                  }, aes, new Uint8Array(shim.Buffer.from(json.ct, 'utf8')));
                });

              case 6:
                ct = _context10.sent;
                r = parse(new shim.TextDecoder('utf8').decode(ct));


                if (cb) {
                  try {
                    cb(r);
                  } catch (e) {
                    console.log(e);
                  }
                }
                return _context10.abrupt("return", r);

              case 12:
                _context10.prev = 12;
                _context10.t0 = _context10["catch"](0);

                SEA.err = _context10.t0;
                if (cb) {
                  cb();
                }
                return _context10.abrupt("return");

              case 17:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, _this9, [[0, 12]]);
      }));

      return function (_x22, _x23, _x24, _x25) {
        return _ref10.apply(this, arguments);
      };
    }();

    module.exports = SEA.decrypt;
  })(USE, './decrypt');

  ;USE(function (module) {
    var _this10 = this;

    var SEA = USE('./root');
    var shim = USE('./shim');
    var S = USE('./settings');
    // Derive shared secret from other's pub and my epub/epriv
    SEA.secret = function () {
      var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(key, pair, cb) {
        var pub, epub, epriv, ecdhSubtle, pubKeyData, props, privKeyData, derived, r;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.prev = 0;
                pub = key.epub || key;
                epub = pair.epub;
                epriv = pair.epriv;
                ecdhSubtle = shim.ossl || shim.subtle;
                pubKeyData = keysToEcdhJwk(pub);
                _context12.t0 = Object;
                _context12.t1 = S.ecdh;
                _context12.next = 10;
                return ecdhSubtle.importKey.apply(ecdhSubtle, _toConsumableArray(pubKeyData).concat([true, []]));

              case 10:
                _context12.t2 = _context12.sent;
                _context12.t3 = {
                  public: _context12.t2
                };
                props = _context12.t0.assign.call(_context12.t0, _context12.t1, _context12.t3);
                privKeyData = keysToEcdhJwk(epub, epriv);
                _context12.next = 16;
                return ecdhSubtle.importKey.apply(ecdhSubtle, _toConsumableArray(privKeyData).concat([false, ['deriveKey']])).then(function () {
                  var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(privKey) {
                    var derivedKey;
                    return regeneratorRuntime.wrap(function _callee11$(_context11) {
                      while (1) {
                        switch (_context11.prev = _context11.next) {
                          case 0:
                            _context11.next = 2;
                            return ecdhSubtle.deriveKey(props, privKey, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);

                          case 2:
                            derivedKey = _context11.sent;
                            return _context11.abrupt("return", ecdhSubtle.exportKey('jwk', derivedKey).then(function (_ref13) {
                              var k = _ref13.k;
                              return k;
                            }));

                          case 4:
                          case "end":
                            return _context11.stop();
                        }
                      }
                    }, _callee11, _this10);
                  }));

                  return function (_x29) {
                    return _ref12.apply(this, arguments);
                  };
                }());

              case 16:
                derived = _context12.sent;
                r = derived;

                if (cb) {
                  try {
                    cb(r);
                  } catch (e) {
                    console.log(e);
                  }
                }
                return _context12.abrupt("return", r);

              case 22:
                _context12.prev = 22;
                _context12.t4 = _context12["catch"](0);

                SEA.err = _context12.t4;
                if (cb) {
                  cb();
                }
                return _context12.abrupt("return");

              case 27:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, _this10, [[0, 22]]);
      }));

      return function (_x26, _x27, _x28) {
        return _ref11.apply(this, arguments);
      };
    }();

    var keysToEcdhJwk = function keysToEcdhJwk(pub, d) {
      // d === priv
      var _pub$split3 = pub.split('.'),
          _pub$split4 = _slicedToArray(_pub$split3, 2),
          x = _pub$split4[0],
          y = _pub$split4[1]; // new


      var jwk = d ? { d: d } : {};
      return [// Use with spread returned value...
      'jwk', Object.assign(jwk, { x: x, y: y, kty: 'EC', crv: 'P-256', ext: true }), // ??? refactor
      S.ecdh];
    };

    module.exports = SEA.secret;
  })(USE, './secret');

  ;USE(function (module) {
    var _this11 = this;

    // Old Code...
    var __gky10 = USE('./shim');
    var crypto = __gky10.crypto;
    var subtle = __gky10.subtle;
    var ossl = __gky10.ossl;
    var TextEncoder = __gky10.TextEncoder;
    var TextDecoder = __gky10.TextDecoder;
    var getRandomBytes = __gky10.random;
    var EasyIndexedDB = USE('./indexed');
    var Buffer = USE('./buffer');
    var settings = USE('./settings');
    var __gky11 = USE('./settings');
    var pbKdf2 = __gky11.pbkdf2;
    var ecdsaKeyProps = __gky11.ecdsa.pair;
    var ecdsaSignProps = __gky11.ecdsa.sign;
    var ecdhKeyProps = __gky11.ecdh;
    var keysToEcdsaJwk = __gky11.jwk;
    var sha1hash = USE('./sha1');
    var sha256hash = USE('./sha256');
    var recallCryptoKey = USE('./remember');
    var parseProps = USE('./parse');

    // Practical examples about usage found from ./test/common.js
    var SEA = USE('./root');
    SEA.work = USE('./work');
    SEA.sign = USE('./sign');
    SEA.verify = USE('./verify');
    SEA.encrypt = USE('./encrypt');
    SEA.decrypt = USE('./decrypt');

    SEA.random = getRandomBytes;

    // This is easy way to use IndexedDB, all methods are Promises
    // Note: Not all SEA interfaces have to support this.
    SEA.EasyIndexedDB = EasyIndexedDB;

    // This is Buffer used in SEA and usable from Gun/SEA application also.
    // For documentation see https://nodejs.org/api/buffer.html
    SEA.Buffer = Buffer;

    // These SEA functions support now ony Promises or
    // async/await (compatible) code, use those like Promises.
    //
    // Creates a wrapper library around Web Crypto API
    // for various AES, ECDSA, PBKDF2 functions we called above.
    // Calculate public key KeyID aka PGPv4 (result: 8 bytes as hex string)
    SEA.keyid = function () {
      var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(pub) {
        var pb, id, sha1, hash;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _context13.prev = 0;

                // base64('base64(x):base64(y)') => Buffer(xy)
                pb = Buffer.concat(Buffer.from(pub, 'base64').toString('utf8').split(':').map(function (t) {
                  return Buffer.from(t, 'base64');
                }));
                // id is PGPv4 compliant raw key

                id = Buffer.concat([Buffer.from([0x99, pb.length / 0x100, pb.length % 0x100]), pb]);
                _context13.next = 5;
                return sha1hash(id);

              case 5:
                sha1 = _context13.sent;
                hash = Buffer.from(sha1, 'binary');
                return _context13.abrupt("return", hash.toString('hex', hash.length - 8));

              case 10:
                _context13.prev = 10;
                _context13.t0 = _context13["catch"](0);

                console.log(_context13.t0);
                throw _context13.t0;

              case 14:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, _this11, [[0, 10]]);
      }));

      return function (_x30) {
        return _ref14.apply(this, arguments);
      };
    }();
    // all done!
    // Obviously it is missing MANY necessary features. This is only an alpha release.
    // Please experiment with it, audit what I've done so far, and complain about what needs to be added.
    // SEA should be a full suite that is easy and seamless to use.
    // Again, scroll naer the top, where I provide an EXAMPLE of how to create a user and sign in.
    // Once logged in, the rest of the code you just read handled automatically signing/validating data.
    // But all other behavior needs to be equally easy, like opinionated ways of
    // Adding friends (trusted public keys), sending private messages, etc.
    // Cheers! Tell me what you think.
    var Gun = (SEA.window || {}).Gun; // || require("./gun");
    Gun.SEA = SEA;
    SEA.Gun = Gun;

    module.exports = SEA;
  })(USE, './sea');

  ;USE(function (module) {
    var SEA = USE('./sea');
    var Gun = SEA.Gun;
    // This is internal func queries public key(s) for alias.
    var queryGunAliases = function queryGunAliases(alias, gunRoot) {
      return new Promise(function (resolve, reject) {
        // load all public keys associated with the username alias we want to log in with.
        gunRoot.get('~@' + alias).get(function (rat, rev) {
          rev.off();
          if (!rat.put) {
            // if no user, don't do anything.
            var err = 'No user!';
            Gun.log(err);
            return reject({ err: err });
          }
          // then figuring out all possible candidates having matching username
          var aliases = [];
          var c = 0;
          // TODO: how about having real chainable map without callback ?
          Gun.obj.map(rat.put, function (at, pub) {
            if (!pub.slice || '~' !== pub.slice(0, 1)) {
              // TODO: ... this would then be .filter((at, pub))
              return;
            }
            ++c;
            // grab the account associated with this public key.
            gunRoot.get(pub).get(function (at, ev) {
              pub = pub.slice(1);
              ev.off();
              --c;
              if (at.put) {
                aliases.push({ pub: pub, at: at });
              }
              if (!c && (c = -1)) {
                resolve(aliases);
              }
            });
          });
          if (!c) {
            reject({ err: 'Public key does not exist!' });
          }
        });
      });
    };
    module.exports = queryGunAliases;
  })(USE, './query');

  ;USE(function (module) {
    var _this12 = this;

    var SEA = USE('./sea');
    var Gun = SEA.Gun;
    var queryGunAliases = USE('./query');
    var parseProps = USE('./parse');
    // This is internal User authentication func.
    var authenticate = function () {
      var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(alias, pass, gunRoot) {
        var aliases, err, users, user;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.next = 2;
                return queryGunAliases(alias, gunRoot);

              case 2:
                _context15.t0 = function () {
                  var _ref16 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                      pub = _ref16.pub,
                      _ref16$at = _ref16.at;

                  _ref16$at = _ref16$at === undefined ? {} : _ref16$at;
                  var put = _ref16$at.put;
                  return !!pub && !!put;
                };

                aliases = _context15.sent.filter(_context15.t0);

                if (aliases.length) {
                  _context15.next = 6;
                  break;
                }

                throw { err: 'Public key does not exist!' };

              case 6:
                err = void 0;
                // then attempt to log into each one until we find ours!
                // (if two users have the same username AND the same password... that would be bad)

                _context15.next = 9;
                return Promise.all(aliases.map(function () {
                  var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(_ref18, i) {
                    var at = _ref18.at,
                        pub = _ref18.pub;
                    var auth, proof, props, salt, sea, priv, epriv, epub, tmp;
                    return regeneratorRuntime.wrap(function _callee14$(_context14) {
                      while (1) {
                        switch (_context14.prev = _context14.next) {
                          case 0:
                            // attempt to PBKDF2 extend the password with the salt. (Verifying the signature gives us the plain text salt.)
                            auth = parseProps(at.put.auth);
                            // NOTE: aliasquery uses `gun.get` which internally SEA.read verifies the data for us, so we do not need to re-verify it here.
                            // SEA.verify(at.put.auth, pub).then(function(auth){

                            _context14.prev = 1;
                            _context14.next = 4;
                            return SEA.work(pass, auth.s);

                          case 4:
                            proof = _context14.sent;
                            props = { pub: pub, proof: proof, at: at
                              // the proof of work is evidence that we've spent some time/effort trying to log in, this slows brute force.
                              /*
                              MARK TO @mhelander : pub vs epub!???
                              */
                            };
                            salt = auth.salt;
                            _context14.next = 9;
                            return SEA.decrypt(auth.ek, proof);

                          case 9:
                            sea = _context14.sent;

                            if (sea) {
                              _context14.next = 13;
                              break;
                            }

                            err = 'Failed to decrypt secret! ' + i + '/' + aliases.length;
                            return _context14.abrupt("return");

                          case 13:
                            // now we have AES decrypted the private key, from when we encrypted it with the proof at registration.
                            // if we were successful, then that meanswe're logged in!
                            priv = sea.priv;
                            epriv = sea.epriv;
                            epub = at.put.epub;
                            // TODO: 'salt' needed?

                            err = null;
                            if (typeof window !== 'undefined') {
                              tmp = window.sessionStorage;

                              if (tmp && gunRoot._.opt.remember) {
                                window.sessionStorage.alias = alias;
                                window.sessionStorage.tmp = pass;
                              }
                            }
                            return _context14.abrupt("return", Object.assign(props, { priv: priv, salt: salt, epub: epub, epriv: epriv }));

                          case 21:
                            _context14.prev = 21;
                            _context14.t0 = _context14["catch"](1);

                            err = 'Failed to decrypt secret!';
                            throw { err: err };

                          case 25:
                          case "end":
                            return _context14.stop();
                        }
                      }
                    }, _callee14, _this12, [[1, 21]]);
                  }));

                  return function (_x35, _x36) {
                    return _ref17.apply(this, arguments);
                  };
                }()));

              case 9:
                users = _context15.sent;
                user = Gun.list.map(users, function (acc) {
                  if (acc) {
                    return acc;
                  }
                });

                if (user) {
                  _context15.next = 13;
                  break;
                }

                throw { err: err || 'Public key does not exist!' };

              case 13:
                return _context15.abrupt("return", user);

              case 14:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, _this12);
      }));

      return function authenticate(_x31, _x32, _x33) {
        return _ref15.apply(this, arguments);
      };
    }();
    module.exports = authenticate;
  })(USE, './authenticate');

  ;USE(function (module) {
    var _this13 = this;

    var authsettings = USE('./settings');
    var SEA = USE('./sea');
    var Gun = SEA.Gun;
    //const { scope: seaIndexedDb } = USE('./indexed')
    // This updates sessionStorage & IndexedDB to persist authenticated "session"
    var updateStorage = function updateStorage(proof, key, pin) {
      return function () {
        var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(props) {
          var alias, id, remember, signed, encrypted, auth;
          return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  if (Gun.obj.has(props, 'alias')) {
                    _context16.next = 2;
                    break;
                  }

                  return _context16.abrupt("return");

                case 2:
                  if (!(authsettings.validity && proof && Gun.obj.has(props, 'iat'))) {
                    _context16.next = 31;
                    break;
                  }

                  props.proof = proof;
                  delete props.remember; // Not stored if present

                  alias = props.alias;
                  id = props.alias;
                  remember = { alias: alias, pin: pin };
                  _context16.prev = 8;
                  _context16.next = 11;
                  return SEA.sign(JSON.stringify(remember), key);

                case 11:
                  signed = _context16.sent;


                  sessionStorage.setItem('user', alias);
                  sessionStorage.setItem('remember', signed);

                  _context16.next = 16;
                  return SEA.encrypt(props, pin);

                case 16:
                  encrypted = _context16.sent;

                  if (!encrypted) {
                    _context16.next = 25;
                    break;
                  }

                  _context16.next = 20;
                  return SEA.sign(encrypted, key);

                case 20:
                  auth = _context16.sent;
                  _context16.next = 23;
                  return seaIndexedDb.wipe();

                case 23:
                  _context16.next = 25;
                  return seaIndexedDb.put(id, { auth: auth });

                case 25:
                  return _context16.abrupt("return", props);

                case 28:
                  _context16.prev = 28;
                  _context16.t0 = _context16["catch"](8);
                  throw { err: 'Session persisting failed!' };

                case 31:
                  _context16.next = 33;
                  return seaIndexedDb.wipe();

                case 33:
                  // NO! Do not do this. It ruins other people's sessionStorage code. This is bad/wrong, commenting it out.
                  // And remove sessionStorage data
                  sessionStorage.removeItem('user');
                  sessionStorage.removeItem('remember');

                  return _context16.abrupt("return", props);

                case 36:
                case "end":
                  return _context16.stop();
              }
            }
          }, _callee16, _this13, [[8, 28]]);
        }));

        return function (_x37) {
          return _ref19.apply(this, arguments);
        };
      }();
    };
    module.exports = updateStorage;
  })(USE, './update');

  ;USE(function (module) {
    var _this14 = this;

    var SEA = USE('./sea');
    var Gun = SEA.Gun;
    var Buffer = USE('./buffer');
    var authsettings = USE('./settings');
    var updateStorage = USE('./update');
    // This internal func persists User authentication if so configured
    var authPersist = function () {
      var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(user, proof, opts) {
        var pin, alias, exp, iat, remember, props, pub, epub, priv, epriv, key, asyncProps;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                // opts = { pin: 'string' }
                // no opts.pin then uses random PIN
                // How this works:
                // called when app bootstraps, with wanted options
                // IF authsettings.validity === 0 THEN no remember-me, ever
                // IF PIN then signed 'remember' to window.sessionStorage and 'auth' to IndexedDB
                pin = Buffer.from(Gun.obj.has(opts, 'pin') && opts.pin || Gun.text.random(10), 'utf8').toString('base64');
                alias = user.alias;
                exp = authsettings.validity; // seconds // @mhelander what is `exp`???

                if (!(proof && alias && exp)) {
                  _context17.next = 22;
                  break;
                }

                iat = Math.ceil(Date.now() / 1000); // seconds

                remember = Gun.obj.has(opts, 'pin') || undefined; // for hook - not stored

                props = authsettings.hook({ alias: alias, iat: iat, exp: exp, remember: remember });
                pub = user.pub;
                epub = user.epub;
                priv = user.sea.priv;
                epriv = user.sea.epriv;
                key = { pub: pub, priv: priv, epub: epub, epriv: epriv };

                if (!(props instanceof Promise)) {
                  _context17.next = 19;
                  break;
                }

                _context17.next = 15;
                return props.then();

              case 15:
                asyncProps = _context17.sent;
                _context17.next = 18;
                return updateStorage(proof, key, pin)(asyncProps);

              case 18:
                return _context17.abrupt("return", _context17.sent);

              case 19:
                _context17.next = 21;
                return updateStorage(proof, key, pin)(props);

              case 21:
                return _context17.abrupt("return", _context17.sent);

              case 22:
                _context17.next = 24;
                return updateStorage()({ alias: 'delete' });

              case 24:
                return _context17.abrupt("return", _context17.sent);

              case 25:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, _this14);
      }));

      return function authPersist(_x38, _x39, _x40) {
        return _ref20.apply(this, arguments);
      };
    }();
    module.exports = authPersist;
  })(USE, './persist');

  ;USE(function (module) {
    var _this15 = this;

    var authPersist = USE('./persist');
    // This internal func finalizes User authentication
    var finalizeLogin = function () {
      var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(alias, key, gunRoot, opts) {
        var user, opt, pub, priv, epub, epriv;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                user = gunRoot._.user;
                // add our credentials in-memory only to our root gun instance
                //var tmp = user._.tag;

                opt = user._.opt;

                user._ = key.at.$._;
                user._.opt = opt;
                //user._.tag = tmp || user._.tag;
                // so that way we can use the credentials to encrypt/decrypt data
                // that is input/output through gun (see below)
                pub = key.pub;
                priv = key.priv;
                epub = key.epub;
                epriv = key.epriv;

                user._.is = user.is = { alias: alias, pub: pub };
                Object.assign(user._, { alias: alias, pub: pub, epub: epub, sea: { pub: pub, priv: priv, epub: epub, epriv: epriv } });
                //console.log("authorized", user._);
                // persist authentication
                //await authPersist(user._, key.proof, opts) // temporarily disabled
                // emit an auth event, useful for page redirects and stuff.
                try {
                  gunRoot._.on('auth', user._);
                } catch (e) {
                  console.log('Your \'auth\' callback crashed with:', e);
                }
                // returns success with the user data credentials.
                return _context18.abrupt("return", user._);

              case 12:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, _this15);
      }));

      return function finalizeLogin(_x41, _x42, _x43, _x44) {
        return _ref21.apply(this, arguments);
      };
    }();
    module.exports = finalizeLogin;
  })(USE, './login');

  ;USE(function (module) {
    var _this16 = this;

    var Buffer = USE('./buffer');
    var authsettings = USE('./settings');
    //const { scope: seaIndexedDb } = USE('./indexed')
    var queryGunAliases = USE('./query');
    var parseProps = USE('./parse');
    var updateStorage = USE('./update');
    var SEA = USE('./sea');
    var Gun = SEA.Gun;
    var finalizeLogin = USE('./login');

    // This internal func recalls persisted User authentication if so configured
    var authRecall = function () {
      var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(gunRoot, authprops) {
        var remember, _ref23, _ref23$alias, alias, pIn, pin, checkRememberData, readAndDecrypt, aliases, err, _ref28, _ref29, _ref29$, key, at, proof, newPin, user, pIN, pinProp, _ref30, _ref30$err, _err;

        return regeneratorRuntime.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                // window.sessionStorage only holds signed { alias, pin } !!!
                remember = authprops || sessionStorage.getItem('remember');
                _ref23 = authprops || {}, _ref23$alias = _ref23.alias, alias = _ref23$alias === undefined ? sessionStorage.getItem('user') : _ref23$alias, pIn = _ref23.pin; // @mhelander what is pIn?

                pin = pIn && Buffer.from(pIn, 'utf8').toString('base64');
                // Checks for existing proof, matching alias and expiration:

                checkRememberData = function () {
                  var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(_ref25) {
                    var proof = _ref25.proof,
                        aLias = _ref25.alias,
                        iat = _ref25.iat,
                        exp = _ref25.exp,
                        remember = _ref25.remember;
                    var checkNotExpired, hooked;
                    return regeneratorRuntime.wrap(function _callee19$(_context19) {
                      while (1) {
                        switch (_context19.prev = _context19.next) {
                          case 0:
                            if (!(!!proof && alias === aLias)) {
                              _context19.next = 12;
                              break;
                            }

                            checkNotExpired = function checkNotExpired(args) {
                              if (Math.floor(Date.now() / 1000) < iat + args.exp) {
                                // No way hook to update 'iat'
                                return Object.assign(args, { iat: iat, proof: proof });
                              } else {
                                Gun.log('Authentication expired!');
                              }
                            };
                            // We're not gonna give proof to hook!


                            hooked = authsettings.hook({ alias: alias, iat: iat, exp: exp, remember: remember });
                            _context19.t1 = hooked instanceof Promise;

                            if (!_context19.t1) {
                              _context19.next = 8;
                              break;
                            }

                            _context19.next = 7;
                            return hooked.then(checkNotExpired);

                          case 7:
                            _context19.t1 = _context19.sent;

                          case 8:
                            _context19.t0 = _context19.t1;

                            if (_context19.t0) {
                              _context19.next = 11;
                              break;
                            }

                            _context19.t0 = checkNotExpired(hooked);

                          case 11:
                            return _context19.abrupt("return", _context19.t0);

                          case 12:
                          case "end":
                            return _context19.stop();
                        }
                      }
                    }, _callee19, _this16);
                  }));

                  return function checkRememberData(_x47) {
                    return _ref24.apply(this, arguments);
                  };
                }();

                readAndDecrypt = function () {
                  var _ref26 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(data, pub, key) {
                    return regeneratorRuntime.wrap(function _callee20$(_context20) {
                      while (1) {
                        switch (_context20.prev = _context20.next) {
                          case 0:
                            _context20.t0 = parseProps;
                            _context20.t1 = SEA;
                            _context20.next = 4;
                            return SEA.verify(data, pub);

                          case 4:
                            _context20.t2 = _context20.sent;
                            _context20.t3 = key;
                            _context20.next = 8;
                            return _context20.t1.decrypt.call(_context20.t1, _context20.t2, _context20.t3);

                          case 8:
                            _context20.t4 = _context20.sent;
                            return _context20.abrupt("return", (0, _context20.t0)(_context20.t4));

                          case 10:
                          case "end":
                            return _context20.stop();
                        }
                      }
                    }, _callee20, _this16);
                  }));

                  return function readAndDecrypt(_x48, _x49, _x50) {
                    return _ref26.apply(this, arguments);
                  };
                }();

                // Already authenticated?


                if (!(gunRoot._.user && Gun.obj.has(gunRoot._.user._, 'pub') && Gun.obj.has(gunRoot._.user._, 'sea'))) {
                  _context23.next = 7;
                  break;
                }

                return _context23.abrupt("return", gunRoot._.user._);

              case 7:
                if (alias) {
                  _context23.next = 9;
                  break;
                }

                throw { err: 'No authentication session found!' };

              case 9:
                if (remember) {
                  _context23.next = 23;
                  break;
                }

                _context23.next = 12;
                return seaIndexedDb.get(alias, 'auth');

              case 12:
                _context23.t2 = _context23.sent;

                if (!_context23.t2) {
                  _context23.next = 15;
                  break;
                }

                _context23.t2 = authsettings.validity;

              case 15:
                _context23.t1 = _context23.t2;

                if (!_context23.t1) {
                  _context23.next = 18;
                  break;
                }

                _context23.t1 = 'Missing PIN and alias!';

              case 18:
                _context23.t0 = _context23.t1;

                if (_context23.t0) {
                  _context23.next = 21;
                  break;
                }

                _context23.t0 = 'No authentication session found!';

              case 21:
                _context23.t3 = _context23.t0;
                throw {
                  err: _context23.t3
                };

              case 23:
                _context23.next = 25;
                return queryGunAliases(alias, gunRoot);

              case 25:
                _context23.t4 = function () {
                  var _ref27 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                      pub = _ref27.pub;

                  return !!pub;
                };

                aliases = _context23.sent.filter(_context23.t4);

                if (aliases.length) {
                  _context23.next = 29;
                  break;
                }

                throw { err: 'Public key does not exist!' };

              case 29:
                err = void 0;
                // Yes, then attempt to log into each one until we find ours!
                // (if two users have the same username AND the same password... that would be bad)

                _context23.next = 32;
                return Promise.all(aliases.filter(function (_ref31) {
                  var _ref31$at = _ref31.at;
                  _ref31$at = _ref31$at === undefined ? {} : _ref31$at;
                  var put = _ref31$at.put;
                  return !!put;
                }).map(function () {
                  var _ref32 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(_ref33) {
                    var at = _ref33.at,
                        pub = _ref33.pub;

                    var readStorageData, __gky20, data, newPin, proof, auth, sea, priv, epriv, epub;

                    return regeneratorRuntime.wrap(function _callee22$(_context22) {
                      while (1) {
                        switch (_context22.prev = _context22.next) {
                          case 0:
                            readStorageData = function () {
                              var _ref34 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(args) {
                                var props, pin, aLias, data;
                                return regeneratorRuntime.wrap(function _callee21$(_context21) {
                                  while (1) {
                                    switch (_context21.prev = _context21.next) {
                                      case 0:
                                        _context21.t0 = args;

                                        if (_context21.t0) {
                                          _context21.next = 7;
                                          break;
                                        }

                                        _context21.t1 = parseProps;
                                        _context21.next = 5;
                                        return SEA.verify(remember, pub, true);

                                      case 5:
                                        _context21.t2 = _context21.sent;
                                        _context21.t0 = (0, _context21.t1)(_context21.t2);

                                      case 7:
                                        props = _context21.t0;
                                        pin = props.pin;
                                        aLias = props.alias;

                                        if (!(!pin && alias === aLias)) {
                                          _context21.next = 16;
                                          break;
                                        }

                                        _context21.next = 13;
                                        return checkRememberData(props);

                                      case 13:
                                        _context21.t3 = _context21.sent;
                                        _context21.next = 29;
                                        break;

                                      case 16:
                                        _context21.t4 = checkRememberData;
                                        _context21.t5 = readAndDecrypt;
                                        _context21.next = 20;
                                        return seaIndexedDb.get(alias, 'auth');

                                      case 20:
                                        _context21.t6 = _context21.sent;
                                        _context21.t7 = pub;
                                        _context21.t8 = pin;
                                        _context21.next = 25;
                                        return (0, _context21.t5)(_context21.t6, _context21.t7, _context21.t8);

                                      case 25:
                                        _context21.t9 = _context21.sent;
                                        _context21.next = 28;
                                        return (0, _context21.t4)(_context21.t9);

                                      case 28:
                                        _context21.t3 = _context21.sent;

                                      case 29:
                                        data = _context21.t3;

                                        pin = pin || data.pin;
                                        delete data.pin;
                                        return _context21.abrupt("return", { pin: pin, data: data });

                                      case 33:
                                      case "end":
                                        return _context21.stop();
                                    }
                                  }
                                }, _callee21, _this16);
                              }));

                              return function readStorageData(_x53) {
                                return _ref34.apply(this, arguments);
                              };
                            }();
                            // got pub, try auth with pin & alias :: or unwrap Storage data...


                            _context22.next = 3;
                            return readStorageData(pin && { pin: pin, alias: alias });

                          case 3:
                            __gky20 = _context22.sent;
                            data = __gky20.data;
                            newPin = __gky20.pin;
                            proof = data.proof;

                            if (proof) {
                              _context22.next = 20;
                              break;
                            }

                            if (data) {
                              _context22.next = 11;
                              break;
                            }

                            err = 'No valid authentication session found!';
                            return _context22.abrupt("return");

                          case 11:
                            _context22.prev = 11;
                            _context22.next = 14;
                            return updateStorage()(data);

                          case 14:
                            _context22.next = 18;
                            break;

                          case 16:
                            _context22.prev = 16;
                            _context22.t0 = _context22["catch"](11);

                          case 18:
                            //eslint-disable-line no-empty
                            err = 'Expired session!';
                            return _context22.abrupt("return");

                          case 20:
                            _context22.prev = 20;
                            // auth parsing or decryption fails or returns empty - silently done
                            auth = at.put.auth.auth;
                            _context22.next = 24;
                            return SEA.decrypt(auth, proof);

                          case 24:
                            sea = _context22.sent;

                            if (sea) {
                              _context22.next = 28;
                              break;
                            }

                            err = 'Failed to decrypt private key!';
                            return _context22.abrupt("return");

                          case 28:
                            priv = sea.priv;
                            epriv = sea.epriv;
                            epub = at.put.epub;
                            // Success! we've found our private data!

                            err = null;
                            return _context22.abrupt("return", { proof: proof, at: at, pin: newPin, key: { pub: pub, priv: priv, epriv: epriv, epub: epub } });

                          case 35:
                            _context22.prev = 35;
                            _context22.t1 = _context22["catch"](20);

                            err = 'Failed to decrypt private key!';
                            return _context22.abrupt("return");

                          case 39:
                          case "end":
                            return _context22.stop();
                        }
                      }
                    }, _callee22, _this16, [[11, 16], [20, 35]]);
                  }));

                  return function (_x52) {
                    return _ref32.apply(this, arguments);
                  };
                }()).filter(function (props) {
                  return !!props;
                }));

              case 32:
                _ref28 = _context23.sent;
                _ref29 = _slicedToArray(_ref28, 1);
                _ref29$ = _ref29[0];
                _ref29$ = _ref29$ === undefined ? {} : _ref29$;
                key = _ref29$.key, at = _ref29$.at, proof = _ref29$.proof, newPin = _ref29$.pin;

                if (key) {
                  _context23.next = 39;
                  break;
                }

                throw { err: err || 'Public key does not exist!' };

              case 39:
                _context23.prev = 39;
                _context23.next = 42;
                return updateStorage(proof, key, newPin || pin)(key);

              case 42:
                user = Object.assign(key, { at: at, proof: proof });
                pIN = newPin || pin;
                pinProp = pIN && { pin: Buffer.from(pIN, 'base64').toString('utf8') };
                _context23.next = 47;
                return finalizeLogin(alias, user, gunRoot, pinProp);

              case 47:
                return _context23.abrupt("return", _context23.sent);

              case 50:
                _context23.prev = 50;
                _context23.t5 = _context23["catch"](39);
                // TODO: right log message ?
                Gun.log('Failed to finalize login with new password!');
                _ref30 = _context23.t5 || {}, _ref30$err = _ref30.err, _err = _ref30$err === undefined ? '' : _ref30$err;
                throw { err: 'Finalizing new password login failed! Reason: ' + _err };

              case 55:
              case "end":
                return _context23.stop();
            }
          }
        }, _callee23, _this16, [[39, 50]]);
      }));

      return function authRecall(_x45, _x46) {
        return _ref22.apply(this, arguments);
      };
    }();
    module.exports = authRecall;
  })(USE, './recall');

  ;USE(function (module) {
    var _this17 = this;

    var authPersist = USE('./persist');
    var authsettings = USE('./settings');
    //const { scope: seaIndexedDb } = USE('./indexed')
    // This internal func executes logout actions
    var authLeave = function () {
      var _ref35 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(gunRoot) {
        var alias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : gunRoot._.user._.alias;
        var user;
        return regeneratorRuntime.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                user = gunRoot._.user._ || {};

                ['get', 'soul', 'ack', 'put', 'is', 'alias', 'pub', 'epub', 'sea'].map(function (key) {
                  return delete user[key];
                });
                if (user.$) {
                  delete user.$.is;
                }
                // Let's use default
                gunRoot.user();
                // Removes persisted authentication & CryptoKeys
                _context24.prev = 4;
                _context24.next = 7;
                return authPersist({ alias: alias });

              case 7:
                _context24.next = 11;
                break;

              case 9:
                _context24.prev = 9;
                _context24.t0 = _context24["catch"](4);

              case 11:
                return _context24.abrupt("return", { ok: 0 });

              case 12:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee24, _this17, [[4, 9]]);
      }));

      return function authLeave(_x54) {
        return _ref35.apply(this, arguments);
      };
    }();
    module.exports = authLeave;
  })(USE, './leave');

  ;USE(function (module) {
    var Gun = USE('./sea').Gun;
    Gun.chain.then = function (cb) {
      var gun = this,
          p = new Promise(function (res, rej) {
        gun.once(res);
      });
      return cb ? p.then(cb) : p;
    };
  })(USE, './then');

  ;USE(function (module) {
    var SEA = USE('./sea');
    var Gun = SEA.Gun;
    var then = USE('./then');

    function User(root) {
      this._ = { $: this };
    }
    User.prototype = function () {
      function F() {};F.prototype = Gun.chain;return new F();
    }(); // Object.create polyfill
    User.prototype.constructor = User;

    // let's extend the gun chain with a `user` function.
    // only one user can be logged in at a time, per gun instance.
    Gun.chain.user = function (pub) {
      var gun = this,
          root = gun.back(-1),
          user;
      if (pub) {
        return root.get('~' + pub);
      }
      if (user = root.back('user')) {
        return user;
      }
      var root = root._,
          at = root,
          uuid = at.opt.uuid || Gun.state.lex;
      (at = (user = at.user = gun.chain(new User()))._).opt = {};
      at.opt.uuid = function (cb) {
        var id = uuid(),
            pub = root.user;
        if (!pub || !(pub = pub._.sea) || !(pub = pub.pub)) {
          return id;
        }
        id = id + '~' + pub + '.';
        if (cb && cb.call) {
          cb(null, id);
        }
        return id;
      };
      return user;
    };
    Gun.User = User;
    module.exports = User;
  })(USE, './user');

  ;USE(function (module) {
    // TODO: This needs to be split into all separate functions.
    // Not just everything thrown into 'create'.

    var SEA = USE('./sea');
    var User = USE('./user');
    var authRecall = USE('./recall');
    var authsettings = USE('./settings');
    var authenticate = USE('./authenticate');
    var finalizeLogin = USE('./login');
    var authLeave = USE('./leave');
    var _initial_authsettings = USE('./settings').recall;
    var Gun = SEA.Gun;

    var u;
    // Well first we have to actually create a user. That is what this function does.
    User.prototype.create = function (username, pass, cb, opt) {
      var _this18 = this;

      // TODO: Needs to be cleaned up!!!
      var gunRoot = this.back(-1);
      var gun = this,
          cat = gun._;
      cb = cb || function () {};
      if (cat.ing) {
        cb({ err: Gun.log("User is already being created or authenticated!"), wait: true });
        return gun;
      }
      cat.ing = true;
      opt = opt || {};
      var resolve = function resolve() {},
          reject = resolve;
      // Because more than 1 user might have the same username, we treat the alias as a list of those users.
      if (cb) {
        resolve = reject = cb;
      }
      gunRoot.get('~@' + username).get(function () {
        var _ref36 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(at, ev) {
          var err, salt, proof, pairs, pub, priv, epriv, alias, epub, auth, user, tmp;
          return regeneratorRuntime.wrap(function _callee25$(_context25) {
            while (1) {
              switch (_context25.prev = _context25.next) {
                case 0:
                  ev.off();

                  if (!(at.put && !opt.already)) {
                    _context25.next = 7;
                    break;
                  }

                  // If we can enforce that a user name is already taken, it might be nice to try, but this is not guaranteed.
                  err = 'User already created!';

                  Gun.log(err);
                  cat.ing = false;
                  gun.leave();
                  return _context25.abrupt("return", reject({ err: err }));

                case 7:
                  salt = Gun.text.random(64);
                  // pseudo-randomly create a salt, then use CryptoJS's PBKDF2 function to extend the password with it.

                  _context25.prev = 8;
                  _context25.next = 11;
                  return SEA.work(pass, salt);

                case 11:
                  proof = _context25.sent;
                  _context25.next = 14;
                  return SEA.pair();

                case 14:
                  pairs = _context25.sent;

                  // now we have generated a brand new ECDSA key pair for the user account.
                  pub = pairs.pub;
                  priv = pairs.priv;
                  epriv = pairs.epriv;
                  // the user's public key doesn't need to be signed. But everything else needs to be signed with it!

                  _context25.next = 20;
                  return SEA.sign(username, pairs);

                case 20:
                  alias = _context25.sent;

                  if (!(u === alias)) {
                    _context25.next = 23;
                    break;
                  }

                  throw SEA.err;

                case 23:
                  _context25.next = 25;
                  return SEA.sign(pairs.epub, pairs);

                case 25:
                  epub = _context25.sent;

                  if (!(u === epub)) {
                    _context25.next = 28;
                    break;
                  }

                  throw SEA.err;

                case 28:
                  _context25.next = 30;
                  return SEA.encrypt({ priv: priv, epriv: epriv }, proof).then(function (auth) {
                    return (// TODO: So signedsalt isn't needed?
                      // SEA.sign(salt, pairs).then((signedsalt) =>
                      SEA.sign({ ek: auth, s: salt }, pairs)
                    );
                  }
                  // )
                  ).catch(function (e) {
                    Gun.log('SEA.en or SEA.write calls failed!');cat.ing = false;gun.leave();reject(e);
                  });

                case 30:
                  auth = _context25.sent;
                  user = { alias: alias, pub: pub, epub: epub, auth: auth };
                  tmp = '~' + pairs.pub;
                  // awesome, now we can actually save the user with their public key as their ID.

                  try {

                    gunRoot.get(tmp).put(user);
                  } catch (e) {
                    console.log(e);
                  }
                  // next up, we want to associate the alias with the public key. So we add it to the alias list.
                  gunRoot.get('~@' + username).put(Gun.obj.put({}, tmp, Gun.val.link.ify(tmp)));
                  // callback that the user has been created. (Note: ok = 0 because we didn't wait for disk to ack)
                  setTimeout(function () {
                    cat.ing = false;resolve({ ok: 0, pub: pairs.pub });
                  }, 10); // TODO: BUG! If `.auth` happens synchronously after `create` finishes, auth won't work. This setTimeout is a temporary hack until we can properly fix it.
                  _context25.next = 44;
                  break;

                case 38:
                  _context25.prev = 38;
                  _context25.t0 = _context25["catch"](8);

                  Gun.log('SEA.create failed!');
                  cat.ing = false;
                  gun.leave();
                  reject(_context25.t0);

                case 44:
                case "end":
                  return _context25.stop();
              }
            }
          }, _callee25, _this18, [[8, 38]]);
        }));

        return function (_x56, _x57) {
          return _ref36.apply(this, arguments);
        };
      }());
      return gun; // gun chain commands must return gun chains!
    };
    // now that we have created a user, we want to authenticate them!
    User.prototype.auth = function (alias, pass, cb, opt) {
      // TODO: Needs to be cleaned up!!!!
      var opts = opt || typeof cb !== 'function' && cb;
      var pin = opts && opts.pin;
      var newpass = opts && opts.newpass;
      var gunRoot = this.back(-1);
      cb = typeof cb === 'function' ? cb : function () {};
      newpass = newpass || (opts || {}).change;
      var gun = this,
          cat = gun._;
      if (cat.ing) {
        cb({ err: "User is already being created or authenticated!", wait: true });
        return gun;
      }
      cat.ing = true;

      if (!pass && pin) {
        _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26() {
          var r, err;
          return regeneratorRuntime.wrap(function _callee26$(_context26) {
            while (1) {
              switch (_context26.prev = _context26.next) {
                case 0:
                  _context26.prev = 0;
                  _context26.next = 3;
                  return authRecall(gunRoot, { alias: alias, pin: pin });

                case 3:
                  r = _context26.sent;
                  return _context26.abrupt("return", (cat.ing = false, cb(r), gun));

                case 7:
                  _context26.prev = 7;
                  _context26.t0 = _context26["catch"](0);
                  err = { err: 'Auth attempt failed! Reason: No session data for alias & PIN' };
                  return _context26.abrupt("return", (cat.ing = false, gun.leave(), cb(err), gun));

                case 11:
                case "end":
                  return _context26.stop();
              }
            }
          }, _callee26, this, [[0, 7]]);
        }))();
        return gun;
      }

      var putErr = function putErr(msg) {
        return function (e) {
          var message = e.message,
              _e$err = e.err,
              err = _e$err === undefined ? message || '' : _e$err;

          Gun.log(msg);
          var error = { err: msg + ' Reason: ' + err };
          return cat.ing = false, gun.leave(), cb(error), gun;
        };
      };

      _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27() {
        var keys, pub, priv, epub, epriv, salt, encSigAuth, signedEpub, signedAlias, user, login, _login;

        return regeneratorRuntime.wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                _context27.prev = 0;
                _context27.next = 3;
                return authenticate(alias, pass, gunRoot);

              case 3:
                keys = _context27.sent;

                if (keys) {
                  _context27.next = 6;
                  break;
                }

                return _context27.abrupt("return", putErr('Auth attempt failed!')({ message: 'No keys' }));

              case 6:
                pub = keys.pub;
                priv = keys.priv;
                epub = keys.epub;
                epriv = keys.epriv;
                // we're logged in!

                if (!newpass) {
                  _context27.next = 40;
                  break;
                }

                _context27.prev = 11;
                salt = Gun.text.random(64);
                _context27.next = 15;
                return SEA.work(newpass, salt).then(function (key) {
                  return SEA.encrypt({ priv: priv, epriv: epriv }, key).then(function (auth) {
                    return SEA.sign({ ek: auth, s: salt }, keys);
                  });
                });

              case 15:
                encSigAuth = _context27.sent;
                _context27.next = 18;
                return SEA.sign(epub, keys);

              case 18:
                signedEpub = _context27.sent;
                _context27.next = 21;
                return SEA.sign(alias, keys);

              case 21:
                signedAlias = _context27.sent;
                user = {
                  pub: pub,
                  alias: signedAlias,
                  auth: encSigAuth,
                  epub: signedEpub
                  // awesome, now we can update the user using public key ID.
                };
                gunRoot.get('~' + user.pub).put(user);
                // then we're done
                login = finalizeLogin(alias, keys, gunRoot, { pin: pin });

                login.catch(putErr('Failed to finalize login with new password!'));
                cat.ing = false;
                _context27.t0 = cb;
                _context27.next = 30;
                return login;

              case 30:
                _context27.t1 = _context27.sent;
                (0, _context27.t0)(_context27.t1);
                return _context27.abrupt("return", gun);

              case 35:
                _context27.prev = 35;
                _context27.t2 = _context27["catch"](11);
                return _context27.abrupt("return", putErr('Password set attempt failed!')(_context27.t2));

              case 38:
                _context27.next = 49;
                break;

              case 40:
                _login = finalizeLogin(alias, keys, gunRoot, { pin: pin });

                _login.catch(putErr('Finalizing login failed!'));
                cat.ing = false;
                _context27.t3 = cb;
                _context27.next = 46;
                return _login;

              case 46:
                _context27.t4 = _context27.sent;
                (0, _context27.t3)(_context27.t4);
                return _context27.abrupt("return", gun);

              case 49:
                _context27.next = 54;
                break;

              case 51:
                _context27.prev = 51;
                _context27.t5 = _context27["catch"](0);
                return _context27.abrupt("return", putErr('Auth attempt failed!')(_context27.t5));

              case 54:
              case "end":
                return _context27.stop();
            }
          }
        }, _callee27, this, [[0, 51], [11, 35]]);
      }))();
      return gun;
    };
    User.prototype.pair = function () {
      var user = this;
      if (!user.is) {
        return false;
      }
      return user._.sea;
    };
    User.prototype.leave = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28() {
      var gun, user, tmp;
      return regeneratorRuntime.wrap(function _callee28$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              gun = this, user = gun.back(-1)._.user;

              if (user) {
                delete user.is;
                delete user._.is;
                delete user._.sea;
              }
              if (typeof window !== 'undefined') {
                tmp = window.sessionStorage;

                delete tmp.alias;
                delete tmp.tmp;
              }
              _context28.next = 5;
              return authLeave(this.back(-1));

            case 5:
              return _context28.abrupt("return", _context28.sent);

            case 6:
            case "end":
              return _context28.stop();
          }
        }
      }, _callee28, this);
    }));
    // If authenticated user wants to delete his/her account, let's support it!
    User.prototype.delete = function () {
      var _ref40 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(alias, pass) {
        var gunRoot, __gky40, pub, _gunRoot$_$user, user;

        return regeneratorRuntime.wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                gunRoot = this.back(-1);
                _context29.prev = 1;
                _context29.next = 4;
                return authenticate(alias, pass, gunRoot);

              case 4:
                __gky40 = _context29.sent;
                pub = __gky40.pub;
                _context29.next = 8;
                return authLeave(gunRoot, alias);

              case 8:
                // Delete user data
                gunRoot.get('~' + pub).put(null);
                // Wipe user data from memory
                _gunRoot$_$user = gunRoot._.user, user = _gunRoot$_$user === undefined ? { _: {} } : _gunRoot$_$user;
                // TODO: is this correct way to 'logout' user from Gun.User ?

                ['alias', 'sea', 'pub'].map(function (key) {
                  return delete user._[key];
                });
                user._.is = user.is = {};
                gunRoot.user();
                return _context29.abrupt("return", { ok: 0 // TODO: proper return codes???
                });

              case 16:
                _context29.prev = 16;
                _context29.t0 = _context29["catch"](1);

                Gun.log('User.delete failed! Error:', _context29.t0);
                throw _context29.t0;

              case 20:
              case "end":
                return _context29.stop();
            }
          }
        }, _callee29, this, [[1, 16]]);
      }));

      return function (_x58, _x59) {
        return _ref40.apply(this, arguments);
      };
    }();
    // If authentication is to be remembered over reloads or browser closing,
    // set validity time in minutes.
    User.prototype.recall = function () {
      var _ref41 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(setvalidity, options) {
        var gunRoot, validity, opts, o, tmp, err;
        return regeneratorRuntime.wrap(function _callee30$(_context30) {
          while (1) {
            switch (_context30.prev = _context30.next) {
              case 0:
                gunRoot = this.back(-1);
                validity = void 0;
                opts = void 0;
                o = setvalidity;

                if (!(o && o.sessionStorage)) {
                  _context30.next = 7;
                  break;
                }

                if (typeof window !== 'undefined') {
                  tmp = window.sessionStorage;

                  if (tmp) {
                    gunRoot._.opt.remember = true;
                    if (tmp.alias && tmp.tmp) {
                      gunRoot.user().auth(tmp.alias, tmp.tmp);
                    }
                  }
                }
                return _context30.abrupt("return", this);

              case 7:

                if (!Gun.val.is(setvalidity)) {
                  opts = setvalidity;
                  validity = _initial_authsettings.validity;
                } else {
                  opts = options;
                  validity = setvalidity * 60; // minutes to seconds
                }

                _context30.prev = 8;

                // opts = { hook: function({ iat, exp, alias, proof }) }
                // iat == Date.now() when issued, exp == seconds to expire from iat
                // How this works:
                // called when app bootstraps, with wanted options
                // IF authsettings.validity === 0 THEN no remember-me, ever
                // IF PIN then signed 'remember' to window.sessionStorage and 'auth' to IndexedDB
                authsettings.validity = typeof validity !== 'undefined' ? validity : _initial_authsettings.validity;
                authsettings.hook = Gun.obj.has(opts, 'hook') && typeof opts.hook === 'function' ? opts.hook : _initial_authsettings.hook;
                // All is good. Should we do something more with actual recalled data?
                _context30.next = 13;
                return authRecall(gunRoot);

              case 13:
                return _context30.abrupt("return", _context30.sent);

              case 16:
                _context30.prev = 16;
                _context30.t0 = _context30["catch"](8);
                err = 'No session!';

                Gun.log(err);
                // NOTE! It's fine to resolve recall with reason why not successful
                // instead of rejecting...
                return _context30.abrupt("return", { err: _context30.t0 && _context30.t0.err || err });

              case 21:
              case "end":
                return _context30.stop();
            }
          }
        }, _callee30, this, [[8, 16]]);
      }));

      return function (_x60, _x61) {
        return _ref41.apply(this, arguments);
      };
    }();
    User.prototype.alive = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31() {
      var gunRoot, err;
      return regeneratorRuntime.wrap(function _callee31$(_context31) {
        while (1) {
          switch (_context31.prev = _context31.next) {
            case 0:
              gunRoot = this.back(-1);
              _context31.prev = 1;
              _context31.next = 4;
              return authRecall(gunRoot);

            case 4:
              return _context31.abrupt("return", gunRoot._.user._);

            case 7:
              _context31.prev = 7;
              _context31.t0 = _context31["catch"](1);
              err = 'No session!';

              Gun.log(err);
              throw { err: err };

            case 12:
            case "end":
              return _context31.stop();
          }
        }
      }, _callee31, this, [[1, 7]]);
    }));
    User.prototype.trust = function () {
      var _ref43 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(user) {
        return regeneratorRuntime.wrap(function _callee32$(_context32) {
          while (1) {
            switch (_context32.prev = _context32.next) {
              case 0:
                // TODO: BUG!!! SEA `node` read listener needs to be async, which means core needs to be async too.
                //gun.get('alice').get('age').trust(bob);
                if (Gun.is(user)) {
                  user.get('pub').get(function (ctx, ev) {
                    console.log(ctx, ev);
                  });
                }

              case 1:
              case "end":
                return _context32.stop();
            }
          }
        }, _callee32, this);
      }));

      return function (_x62) {
        return _ref43.apply(this, arguments);
      };
    }();
    User.prototype.grant = function (to, cb) {
      console.log("`.grant` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
      var gun = this,
          user = gun.back(-1).user(),
          pair = user.pair(),
          path = '';
      gun.back(function (at) {
        if (at.pub) {
          return;
        }path += at.get || '';
      });
      _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33() {
        var enc, sec, pub, epub, dh;
        return regeneratorRuntime.wrap(function _callee33$(_context33) {
          while (1) {
            switch (_context33.prev = _context33.next) {
              case 0:
                _context33.next = 2;
                return user.get('trust').get(pair.pub).get(path).then();

              case 2:
                sec = _context33.sent;
                _context33.next = 5;
                return SEA.decrypt(sec, pair);

              case 5:
                sec = _context33.sent;

                if (sec) {
                  _context33.next = 12;
                  break;
                }

                sec = SEA.random(16).toString();
                _context33.next = 10;
                return SEA.encrypt(sec, pair);

              case 10:
                enc = _context33.sent;

                user.get('trust').get(pair.pub).get(path).put(enc);

              case 12:
                pub = to.get('pub').then();
                epub = to.get('epub').then();
                _context33.next = 16;
                return pub;

              case 16:
                pub = _context33.sent;
                _context33.next = 19;
                return epub;

              case 19:
                epub = _context33.sent;
                _context33.next = 22;
                return SEA.secret(epub, pair);

              case 22:
                dh = _context33.sent;
                _context33.next = 25;
                return SEA.encrypt(sec, dh);

              case 25:
                enc = _context33.sent;

                user.get('trust').get(pub).get(path).put(enc, cb);

              case 27:
              case "end":
                return _context33.stop();
            }
          }
        }, _callee33, this);
      }))();
      return gun;
    };
    User.prototype.secret = function (data, cb) {
      console.log("`.secret` API MAY BE DELETED OR CHANGED OR RENAMED, DO NOT USE!");
      var gun = this,
          user = gun.back(-1).user(),
          pair = user.pair(),
          path = '';
      gun.back(function (at) {
        if (at.pub) {
          return;
        }path += at.get || '';
      });
      _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34() {
        var enc, sec;
        return regeneratorRuntime.wrap(function _callee34$(_context34) {
          while (1) {
            switch (_context34.prev = _context34.next) {
              case 0:
                _context34.next = 2;
                return user.get('trust').get(pair.pub).get(path).then();

              case 2:
                sec = _context34.sent;
                _context34.next = 5;
                return SEA.decrypt(sec, pair);

              case 5:
                sec = _context34.sent;

                if (sec) {
                  _context34.next = 12;
                  break;
                }

                sec = SEA.random(16).toString();
                _context34.next = 10;
                return SEA.encrypt(sec, pair);

              case 10:
                enc = _context34.sent;

                user.get('trust').get(pair.pub).get(path).put(enc);

              case 12:
                _context34.next = 14;
                return SEA.encrypt(data, sec);

              case 14:
                enc = _context34.sent;

                gun.put(enc, cb);

              case 16:
              case "end":
                return _context34.stop();
            }
          }
        }, _callee34, this);
      }))();
      return gun;
    };
    module.exports = User;
  })(USE, './create');

  ;USE(function (module) {
    var SEA = USE('./sea');
    var Gun = SEA.Gun;
    // After we have a GUN extension to make user registration/login easy, we then need to handle everything else.

    // We do this with a GUN adapter, we first listen to when a gun instance is created (and when its options change)
    Gun.on('opt', function (at) {
      if (!at.sea) {
        // only add SEA once per instance, on the "at" context.
        at.sea = { own: {} };
        at.on('in', security, at); // now listen to all input data, acting as a firewall.
        at.on('out', signature, at); // and output listeners, to encrypt outgoing data.
        at.on('node', each, at);
      }
      this.to.next(at); // make sure to call the "next" middleware adapter.
    });

    // Alright, this next adapter gets run at the per node level in the graph database.
    // This will let us verify that every property on a node has a value signed by a public key we trust.
    // If the signature does not match, the data is just `undefined` so it doesn't get passed on.
    // If it does match, then we transform the in-memory "view" of the data into its plain value (without the signature).
    // Now NOTE! Some data is "system" data, not user data. Example: List of public keys, aliases, etc.
    // This data is self-enforced (the value can only match its ID), but that is handled in the `security` function.
    // From the self-enforced data, we can see all the edges in the graph that belong to a public key.
    // Example: ~ASDF is the ID of a node with ASDF as its public key, signed alias and salt, and
    // its encrypted private key, but it might also have other signed values on it like `profile = <ID>` edge.
    // Using that directed edge's ID, we can then track (in memory) which IDs belong to which keys.
    // Here is a problem: Multiple public keys can "claim" any node's ID, so this is dangerous!
    // This means we should ONLY trust our "friends" (our key ring) public keys, not any ones.
    // I have not yet added that to SEA yet in this alpha release. That is coming soon, but beware in the meanwhile!
    function each(msg) {
      // TODO: Warning: Need to switch to `gun.on('node')`! Do not use `Gun.on('node'` in your apps!
      // NOTE: THE SECURITY FUNCTION HAS ALREADY VERIFIED THE DATA!!!
      // WE DO NOT NEED TO RE-VERIFY AGAIN, JUST TRANSFORM IT TO PLAINTEXT.
      var to = this.to,
          vertex = msg.$._.put,
          c = 0,
          d;
      Gun.node.is(msg.put, function (val, key, node) {
        c++; // for each property on the node
        // TODO: consider async/await use here...
        SEA.verify(val, false, function (data) {
          c--; // false just extracts the plain data.
          node[key] = val = data; // transform to plain value.
          if (d && !c && (c = -1)) {
            to.next(msg);
          }
        });
      });
      d = true;
      if (d && !c) {
        to.next(msg);
      }
      return;
    }

    // signature handles data output, it is a proxy to the security function.
    function signature(msg) {
      if (msg.user) {
        return this.to.next(msg);
      }
      var ctx = this.as;
      msg.user = ctx.user;
      security.call(this, msg);
    }

    // okay! The security function handles all the heavy lifting.
    // It needs to deal read and write of input and output of system data, account/public key data, and regular data.
    // This is broken down into some pretty clear edge cases, let's go over them:
    function security(msg) {
      var at = this.as,
          sea = at.sea,
          to = this.to;
      if (msg.get) {
        // if there is a request to read data from us, then...
        var soul = msg.get['#'];
        if (soul) {
          // for now, only allow direct IDs to be read.
          if ('alias' === soul) {
            // Allow reading the list of usernames/aliases in the system?
            return to.next(msg); // yes.
          } else if ('~@' === soul.slice(0, 2)) {
            // Allow reading the list of public keys associated with an alias?
            return to.next(msg); // yes.
          } else {
            // Allow reading everything?
            return to.next(msg); // yes // TODO: No! Make this a callback/event that people can filter on.
          }
        }
      }
      if (msg.put) {
        var relpub = function relpub(s) {
          if (!s) {
            return;
          }
          s = s.split('~');
          if (!s || !(s = s[1])) {
            return;
          }
          s = s.split('.');
          if (!s || 2 > s.length) {
            return;
          }
          s = s.slice(0, 2).join('.');
          return s;
        };

        // potentially parallel async operations!!!
        var check = {},
            each = {},
            u;
        each.node = function (node, soul) {
          if (Gun.obj.empty(node, '_')) {
            return check['node' + soul] = 0;
          } // ignore empty updates, don't reject them.
          Gun.obj.map(node, each.way, { soul: soul, node: node });
        };
        each.way = function (val, key) {
          var soul = this.soul,
              node = this.node,
              tmp;
          if ('_' === key) {
            return;
          } // ignore meta data
          if ('~@' === soul) {
            // special case for shared system data, the list of aliases.
            each.alias(val, key, node, soul);return;
          }
          if ('~@' === soul.slice(0, 2)) {
            // special case for shared system data, the list of public keys for an alias.
            each.pubs(val, key, node, soul);return;
          }
          if ('~' === soul.slice(0, 1) && 2 === (tmp = soul.slice(1)).split('.').length) {
            // special case, account data for a public key.
            each.pub(val, key, node, soul, tmp, msg.user);return;
          }
          each.any(val, key, node, soul, msg.user);return;
          return each.end({ err: "No other data allowed!" });
        };
        each.alias = function (val, key, node, soul) {
          // Example: {_:#~@, ~@alice: {#~@alice}}
          if (!val) {
            return each.end({ err: "Data must exist!" });
          } // data MUST exist
          if ('~@' + key === Gun.val.link.is(val)) {
            return check['alias' + key] = 0;
          } // in fact, it must be EXACTLY equal to itself
          each.end({ err: "Mismatching alias." }); // if it isn't, reject.
        };
        each.pubs = function (val, key, node, soul) {
          // Example: {_:#~@alice, ~asdf: {#~asdf}}
          if (!val) {
            return each.end({ err: "Alias must exist!" });
          } // data MUST exist
          if (key === Gun.val.link.is(val)) {
            return check['pubs' + soul + key] = 0;
          } // and the ID must be EXACTLY equal to its property
          each.end({ err: "Alias must match!" }); // that way nobody can tamper with the list of public keys.
        };
        each.pub = function (val, key, node, soul, pub, user) {
          // Example: {_:#~asdf, hello:SEA{'world',fdsa}}
          if ('pub' === key) {
            if (val === pub) {
              return check['pub' + soul + key] = 0;
            } // the account MUST match `pub` property that equals the ID of the public key.
            return each.end({ err: "Account must match!" });
          }
          check['user' + soul + key] = 1;
          if (user && (user = user._) && user.sea && pub === user.pub) {
            //var id = Gun.text.random(3);
            SEA.sign(val, user.sea, function (data) {
              var rel;
              if (u === data) {
                return each.end({ err: SEA.err || 'Pub signature fail.' });
              }
              if (rel = Gun.val.link.is(val)) {
                (at.sea.own[rel] = at.sea.own[rel] || {})[pub] = true;
              }
              node[key] = data;
              check['user' + soul + key] = 0;
              each.end({ ok: 1 });
            });
            // TODO: Handle error!!!!
            return;
          }
          SEA.verify(val, pub, function (data) {
            var rel, tmp;
            if (u === data) {
              // make sure the signature matches the account it claims to be on.
              return each.end({ err: "Unverified data." }); // reject any updates that are signed with a mismatched account.
            }
            if ((rel = Gun.val.link.is(data)) && pub === relpub(rel)) {
              (at.sea.own[rel] = at.sea.own[rel] || {})[pub] = true;
            }
            check['user' + soul + key] = 0;
            each.end({ ok: 1 });
          });
        };

        each.any = function (val, key, node, soul, user) {
          var tmp, pub;
          if (!user || !(user = user._) || !(user = user.sea)) {
            if (tmp = relpub(soul)) {
              check['any' + soul + key] = 1;
              SEA.verify(val, pub = tmp, function (data) {
                var rel;
                if (!data) {
                  return each.end({ err: "Mismatched owner on '" + key + "'." });
                }
                if ((rel = Gun.val.link.is(data)) && pub === relpub(rel)) {
                  (at.sea.own[rel] = at.sea.own[rel] || {})[pub] = true;
                }
                check['any' + soul + key] = 0;
                each.end({ ok: 1 });
              });
              return;
            }
            check['any' + soul + key] = 1;
            at.on('secure', function (msg) {
              this.off();
              check['any' + soul + key] = 0;
              if (at.opt.secure) {
                msg = null;
              }
              each.end(msg || { err: "Data cannot be modified." });
            }).on.on('secure', msg);
            //each.end({err: "Data cannot be modified."});
            return;
          }
          if (!(tmp = relpub(soul))) {
            if (at.opt.secure) {
              each.end({ err: "Soul is missing public key at '" + key + "'." });
              return;
            }
            if (val && val.slice && 'SEA{' === val.slice(0, 4)) {
              check['any' + soul + key] = 0;
              each.end({ ok: 1 });
              return;
            }
            //check['any'+soul+key] = 1;
            //SEA.sign(val, user, function(data){
            // if(u === data){ return each.end({err: 'Any signature failed.'}) }
            //  node[key] = data;
            check['any' + soul + key] = 0;
            each.end({ ok: 1 });
            //});
            return;
          }
          var pub = tmp;
          if (pub !== user.pub) {
            each.any(val, key, node, soul);
            return;
          }
          /*var other = Gun.obj.map(at.sea.own[soul], function(v, p){
            if(user.pub !== p){ return p }
          });
          if(other){
            each.any(val, key, node, soul);
            return;
          }*/
          check['any' + soul + key] = 1;
          SEA.sign(val, user, function (data) {
            if (u === data) {
              return each.end({ err: 'My signature fail.' });
            }
            node[key] = data;
            check['any' + soul + key] = 0;
            each.end({ ok: 1 });
          });
        };
        each.end = function (ctx) {
          // TODO: Can't you just switch this to each.end = cb?
          if (each.err) {
            return;
          }
          if ((each.err = ctx.err) || ctx.no) {
            console.log('NO!', each.err, msg.put);
            return;
          }
          if (!each.end.ed) {
            return;
          }
          if (Gun.obj.map(check, function (no) {
            if (no) {
              return true;
            }
          })) {
            return;
          }
          to.next(msg);
        };
        Gun.obj.map(msg.put, each.node);
        each.end({ end: each.end.ed = true });
        return; // need to manually call next after async.
      }
      to.next(msg); // pass forward any data we do not know how to handle or process (this allows custom security protocols).
    }
  })(USE, './index');
})();
