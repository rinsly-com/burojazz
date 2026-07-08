'use client'

import React from 'react'
import { Pill } from '@payloadcms/ui'
import type { DefaultCellComponentProps } from 'payload'

type PillStyle = 'light-gray' | 'warning' | 'success' | 'dark'

const STAGES: Record<string, { label: string; pillStyle: PillStyle }> = {
  draft: { label: 'Draft', pillStyle: 'light-gray' },
  review: { label: 'Review', pillStyle: 'warning' },
  ready: { label: 'Ready', pillStyle: 'success' },
}

/**
 * Renders the page's status as a single colored chip in the list table.
 * A published page shows "Published"; otherwise it shows the workflow stage
 * (Draft / Review / Ready). This replaces both the stage and the native
 * `_status` columns.
 */
export const WorkflowStatusCell: React.FC<DefaultCellComponentProps> = ({ cellData, rowData }) => {
  const docStatus = rowData?._status as string | undefined

  // Published with no newer draft → clearly "Published".
  if (docStatus === 'published') {
    return (
      <Pill pillStyle="dark" size="small">
        Published
      </Pill>
    )
  }

  const key = typeof cellData === 'string' ? cellData : 'draft'
  const stage = STAGES[key] ?? { label: key || 'Draft', pillStyle: 'light-gray' as PillStyle }

  return (
    <Pill pillStyle={stage.pillStyle} size="small">
      {stage.label}
    </Pill>
  )
}

export default WorkflowStatusCell
