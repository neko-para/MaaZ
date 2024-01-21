import * as prettier from 'prettier'
import babelPlugin from 'prettier/plugins/babel'
import estreePlugin from 'prettier/plugins/estree'

export async function format(code: string) {
  return await prettier.format(code, {
    semi: false,
    printWidth: 100,
    parser: 'json',
    plugins: [estreePlugin, babelPlugin]
  })
}
