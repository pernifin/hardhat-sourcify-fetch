# Hardhat Sourcify Fetch plugin

This plugin fetches deployed contract source code from Sourcify by providing network name and contract address

## Installation

```bash
npm install --save-dev hardhat-sourcify-fetch
```

And add the following statement to your `hardhat.config.js`:

```js
require("hardhat-sourcify-fetch");
```

Or, if you are using TypeScript, add this to your `hardhat.config.ts`:

```js
import "hardhat-sourcify-fetch";
```

## Tasks

This plugin creates task *fetch* which accepts two mandatory params: --network and --address