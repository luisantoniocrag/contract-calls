# Calls to smart contracts through Alchemy

## Server Requeriments

- nodeJS `>= v14.17.0`
- npm `>= 6.14.13`
- git `>= 2.32.0 (Apple Git-132)`

## Docs Requeriments
Additional to the server requeriments, we need to install this dependencie to BUILD the docs, if you just want to watch or preview the api docs you don't need to install this. Just open the `index.html` file in the `/apidoc` directory.

```bash
$ npm install apidoc -g
```

## Installation and Set Up

1. clone the repository
``` bash
$ git clone git@github.com:luisantoniocrag/contract-calls.git
```

2. Install dependencies
``` bash
$ npm install
```

3. ENV variables

Add the following env variables within an `.env` file in the root directory.

`ALCHEMY_URI`

Example:

```js
// .env
ALCHEMY_URI = 'https://polygon-mumbai.g.alchemy.com/v2/<key/>'
```

`SC_ADDRESS` (NFT Smart Contract Address)

Example:

```js
// .env
SC_ADDRESS= '<0x.../>'
```

`PK` (Your Private Key - NFT Admin)

Example:

```js
// .env
PK= '<yourPrivateKey.../>'
```

4. start a local server
```bash
$ npm start
```

## View docs

**FYI: You need to run the local server first.**

If you just want to preview the api documentation go to the `index.html` file in the `/apidoc` directory.


## Build new docs 

Build new apidocs folder using all files within the source folder. `/src`.

```bash
$ apidoc -i src -o apidoc
```
**FYI: You need to run the local server before testing your new endpoint or editing.**
