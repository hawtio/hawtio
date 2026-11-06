import '@patternfly/patternfly/patternfly-charts.css'
import '@patternfly/react-core/dist/styles/base.css'
import '@hawtio/react/dist/init.css'
import '@hawtio/react/dist/index.css'
import './index.css'

(() => {
  if (localStorage && window.matchMedia) {
    const saved = localStorage.getItem('hawtio.theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = saved ?? (prefersDark ? 'dark' : 'light')
    document.addEventListener('DOMContentLoaded', () => {
      if (theme === 'dark') {
        document.documentElement.classList.add('pf-v6-theme-dark')
      } else {
        document.documentElement.classList.remove('pf-v6-theme-dark')
      }
    })
  }
})()

import('./bootstrap')

export {}
