import { configManager, jolokiaService } from '@hawtio/react'

export const configure = async () => {
  const hawtioVersion = await jolokiaService.readAttribute('hawtio:type=About', 'HawtioVersion')
  configManager.addProductInfo('Hawtio', hawtioVersion as string)
}
