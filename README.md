# cordova-subscription-example

> How to unlock a simple subscription-based premium feature in a cordova application.

[View the demo in action](https://j3k0.github.io/cordova-subscription-example/).

## How to get started

- Run `npm install` at the root of the project to install cordova locally for the project.
- From the `cordova/` directory:
  - `npm run browser` will run the demo in the browser
- To run the demo on Android, a few extra steps are required:
  - Update `cordova/config.xml` to use your own application id.
  - Update `cordova/www/ts/subscription-service.ts` to use your own [iaptic](https://iaptic.com) configuration.
  - From the `cordova/` directory, `npm run android` will build the demo for android.

> Note: If you are curious to know what those `npm run` commands do, just type `npm run` without arguments from the `cordova/` directory.

## Reading through the code

Source code in typescript is included in the `cordova/www/ts` directory.

- The entrypoint is `index.ts`
- In-App Purchases are handled in `subscription-service.ts`
- The "Store" page is rendered in `pages/store-page.ts`

## Copyright

(c) 2023, Jean-Christophe HOELT

License: MIT