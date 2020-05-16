// Fix: error TS2339: Property observable does not exist on type SymbolConstructor
// https://gitmemory.com/issue/bitjson/typescript-starter/221/570740536

export {};

declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}
