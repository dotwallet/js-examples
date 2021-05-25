# Getting started with dotwallet.

Super simple example that uses DotWallet libraries to quickly set up login and Payments.

It uses our frontend [@dotwallet/js](https://github.com/dotwallet/dotwallet-js) to create login and payment buttons and their client-side logic.

Using Dotwallet requires a backend server. This example makes calls to a [dotwallet docker-server](https://github.com/dotwallet/docker-server).

By default, this will call our free testing server at 'https://dotwallet-microservice-xfl2wlshtq-de.a.run.app' which uses
Alternatively, host your own [dotwallet docker-server](https://github.com/dotwallet/docker-server) locally or in the cloud.

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
