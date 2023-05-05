import { PageSection, PageSectionVariants, Text, TextContent } from '@patternfly/react-core'
import React from 'react'

export const SamplePlugin: React.FunctionComponent = () => (
  <PageSection variant={PageSectionVariants.light}>
    <TextContent>
      <Text component='h1'>Sample Plugin</Text>
      <Text component='p'>This is a sample Hawtio plugin that is discovered dynamically at runtime.</Text>
    </TextContent>
  </PageSection>
)
