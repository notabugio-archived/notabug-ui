# proof-of-work
[![Build Status](https://secure.travis-ci.org/indutny/proof-of-work.svg)](http://travis-ci.org/indutny/proof-of-work)
[![NPM version](https://badge.fury.io/js/proof-of-work.svg)](http://badge.fury.io/js/proof-of-work)

Proof of work based on SHA256 and Bloom filter.

## Usage

Solver:
```js
const pow = require('proof-of-work');

const solver = new pow.Solver();

// complexity=13 prefix=abcd
const prefix = Buffer.from('abcd', 'hex');
const nonce = solver.solve(13, /* optional */ prefix);
console.log(nonce);
```

Verifier:
```js
const pow = require('proof-of-work');

const verifier = new pow.Verifier({
  // bit-size of Bloom filter
  size: 1024,

  // number of hash functions in a Bloom filter
  n: 16,

  // target complexity
  complexity: 19,

  // **recommended, but optional** nonce prefix
  // It is highly suggested to use unique nonce prefix for your application
  // to avoid nonce-reuse attack
  prefix: Buffer.from('abcd', 'hex'),

  // nonce validity time (default: one minute)
  validity: 60000
});

// Remove stale nonces from Bloom filter
setInterval(() => {
  verifier.reset();
}, 60000);

verifier.check(nonce);

// Optionally, complexity may be raised/lowered in specific cases
verifier.check(nonce, 21);
```

## CLI

```bash
$ npm install -g proof-of-work

$ proof-of-work -h
Usage: proof-of-work [prefix] <complexity>                - generate nonce
       proof-of-work verify [prefix] <complexity> [nonce] - verify nonce

$ proof-of-work 20
0000015cb7756da0812e3b723dcdcfbd

$ proof-of-work verify 20 \
    0000015cb7756da0812e3b723dcdcfbd && \
    echo success
success

$ proof-of-work 13 | proof-of-work verify 13 && echo success
success

$ proof-of-work 0 | proof-of-work verify 32 || echo failure
failure
```

## Technique

The generated nonce must have following structure:

```
[ Unsigned 64-bit Big Endian timestamp ] [ ... random bytes ]
```

Timestamp MUST be equal to number of milliseconds since
`1970-01-01T00:00:00.000Z` in UTC time.

Verifier has two Bloom filters: current and previous, and operates using
following algorithm:

1. Check that `8 < nonce.length <= 32` (byte length)
2. Check that timestamp is within validity range:
   `Math.abs(timestamp - Date.now()) <= validity`
3. Look up `nonce` in both Bloom filters. If present in any of them - fail
4. Compute `SHA256(prefix ++ nonce)` and check that `N = complexity`
   most-significant bits (in Big Endian encoding) are zero
5. Add `nonce` to the current Bloom filter

`verifier.reset()` copies current Bloom filter to previous, and resets current
Bloom filter.

## Complexity

Here is a chart of average time in seconds to solution vs target complexity:

![timing][0]

## LICENSE

This software is licensed under the MIT License.

Copyright Fedor Indutny, 2017.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: https://raw.githubusercontent.com/indutny/proof-of-work/master/images/pow.png
