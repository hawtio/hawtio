import { PageSection, PageSectionVariants, Content } from '@patternfly/react-core'
import React from 'react'

export const SamplePlugin: React.FunctionComponent = () => (
  <PageSection variant={PageSectionVariants.default}>
    <Content>
      <Content component='h1'>Sample Plugin</Content>
      <Content component='p'>This is a sample Hawtio plugin that is discovered dynamically at runtime.</Content>
    </Content>
  </PageSection>
)
