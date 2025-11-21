import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

// @ts-expect-error
self.MonacoEnvironment = {
  // @ts-ignore
  getWorker(_, label) {
    return new editorWorker()
  },
}
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
