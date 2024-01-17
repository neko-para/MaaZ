import hljsPlugin from '@highlightjs/vue-plugin'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/stackoverflow-light.css'

hljs.registerLanguage('json', json)

export default hljsPlugin
