import { hawtio, HawtioPlugin, helpRegistry, preferencesRegistry } from '@hawtio/react'
import { log, pluginName, pluginPath, pluginTitle } from './globals'
import help from './help.md'
import { SamplePlugin } from './SamplePlugin'
import { SamplePreferences } from './SamplePreferences'

export const plugin: HawtioPlugin = () => {
  log.info('Loading sample plugin')

  hawtio.addPlugin({
    id: pluginName,
    title: pluginTitle,
    path: pluginPath,
    component: SamplePlugin,
    isActive: async () => true,
  })

  helpRegistry.add(pluginName, pluginTitle, help, 100)
  preferencesRegistry.add(pluginName, pluginTitle, SamplePreferences, 100)
}
