namespace NodeJS {
  interface Require {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    (module: 'electron'): typeof import('electron')
  }
}
