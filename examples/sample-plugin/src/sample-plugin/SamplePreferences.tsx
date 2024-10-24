import { CardBody, Text, TextContent } from '@patternfly/react-core'
import React from 'react'

export const SamplePreferences: React.FunctionComponent = () => {
  return (
    <CardBody>
      <TextContent>
        <Text component='h2'>Sample Plugin</Text>
        <Text component='p'>Preferences view for the custom plugin.</Text>
      </TextContent>
    </CardBody>
  )
}
