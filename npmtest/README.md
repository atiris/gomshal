# Npm test

Test commonjs and es6 module

```bash
# in project directory
npm run build
npm pack
# move gomshal-<version>.tgz to npmtest directory

# in npmtest directory
# copy package.cjs.json to package.json
npm install gomshal-<version>.tgz --save
# commonjs test
node index.cjs.js
# modify package.json or copy package.esm.json to package.json
# run es6 module test for node with esm import support
node index.esm.js
# or node index.esm.js --experimental-modules
```
