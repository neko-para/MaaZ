import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// import 'vuetify/styles'

const vuetify = createVuetify({
  icons: {
    aliases,
    defaultSet: 'mdi',
    sets: {
      mdi
    }
  }
})

export default vuetify
