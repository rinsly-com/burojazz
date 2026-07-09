import React from 'react'

import type { Page } from '@/payload-types'
import { Buttons } from '@/components/frontend/ui/CMSLink'
import { Section } from '@/components/frontend/ui/Section'

type Props = Extract<NonNullable<Page['layout']>[number], { blockType: 'buttonRow' }>

const ALIGN: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

/** A standalone row of 0…N CMS-configured buttons. */
export function ButtonRow({ buttons, alignment }: Props) {
  if (!buttons?.length) return null

  return (
    <Section className="py-8 md:py-12">
      <Buttons
        buttons={buttons}
        className={`flex flex-wrap items-center gap-6 ${ALIGN[alignment ?? 'left']}`}
      />
    </Section>
  )
}
