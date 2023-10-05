# cordova-subscription-example

> How to unlock a simple subscription-based premium feature in a cordova application.

[View the demo in action](https://j3k0.github.io/cordova-subscription-example/).

## How to get started

### Example without a backend server

- Run `npm install` at the root of the project to install cordova locally for the project.
- From the `without-server/` directory:
  - `npm run browser` will run the demo in the browser
- To run the demo on Android, a few extra steps are required:
  - Update `config.xml` to use your own application id.
  - Update `www/ts/subscription-service.ts` to use your own [iaptic](https://iaptic.com) configuration and product identifiers.
  - From the `without-server/` directory, `npm run android` will build the demo for android.

> Note: If you are curious to know what those `npm run` commands do, just type `npm run` without arguments.

### Example with a backend server

This example requires you to deploy the demo server: https://github.com/iaptic/iaptic-example-nodejs-backend
It's a minimal server that handles user sessions and subscription status.

Running the demo is similar to the example without a server.

All configuration for that example is in `www/ts/configuration.ts`

## Reading through the code

Source code in typescript is included in the `cordova/www/ts` directory.

- The entrypoint is `index.ts`
- In-App Purchases are handled in `subscription-service.ts`
- The pages are rendered in `pages/*-page.ts`

## Copyright

(c) 2023, Jean-Christophe HOELT

License: MIT