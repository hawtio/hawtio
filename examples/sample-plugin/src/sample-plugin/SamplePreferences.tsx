import { CardBody, Content } from '@patternfly/react-core'
import React from 'react'

export const SamplePreferences: React.FunctionComponent = () => {
  return (
    <CardBody>
      <Content component='h2'>Sample Plugin</Content>
      <Content component='p'>Preferences view for the custom plugin.</Content>
    </CardBody>
  )
}
