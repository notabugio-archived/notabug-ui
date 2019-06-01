
> I think all censorship should be deplored.  My position is that bits are **not a bug**.
>
> — Aaron Swartz (1986 - 2013)

**notabug** is a p2p link aggregator app that is:

 * distributed: peers backup/serve content
 * anonymous: but don't trust it to be
 * psuedo-anonymous: users can create optional cryptographic identities
 * immutable: edits are not supported for anonymous content
 * mutable: edits are supported for authenticated content
 * PoW-based: **voting is slow/CPU heavy**

## Docker Usage


### Build

    git clone https://github.com/notabugio/notabug.git && cd notabug
    docker build ./ -t nab

### Mirror

    docker run --name=nab-mirror -p 3333:3333 nab --peer https://notabug.io/gun --lmdb --pistol --render

You must rebuild docker image for this to pick up any src changes

nab will then be available on localhost:3333

### UI Development

    docker run --name=nab-uidev -v `pwd`/src:/notabug/src -p 3333:3333 nab --peer https://notabug.io/gun --lmdb --pistol --dev

This will not do SSR, it will rebuild the UI whenever src changes, useful for UI development

---

    BCH 1KtRnC9swwXbCTc8WFGBUT9pobYiizj1Ez
    BTC 13XvsLbkaiUud82sh9gh86vJB3neZRD2CK
    DCR DsYQVTvjyepvangZEy9CaJN16n1Zk97tejW
    LTC LPvfg2marjf7H16iDoa4xj7tmt5sVqw4mZ
    ETH 0x67857ED6e8834FE9f2ee8367DEc0AA0C7101B4Ab


