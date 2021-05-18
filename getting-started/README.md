# Getting started with dotwallet.

Super simple example that uses DotWallet libraries to quickly set up login and Payments.

To use this, you need to have a backend server running.

By default, this will call our free testing server at 'https://dotwallet-microservice-xfl2wlshtq-de.a.run.app' which uses [dotwallet docker-server](https://github.com/dotwallet/docker-server).
Alternatively, host your own locally or in the cloud.

## to use as script tag

uncomment script tag in index.html
uncomment DotWallet.default in index.js
comment out require statement

## to use as import

```
npm i @dotwallet/js
```

## dev setup

```
npm link @dotwallet/js
npm run dev
```
