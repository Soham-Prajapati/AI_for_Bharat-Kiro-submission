/**
 * Type definitions for Creator DNA visualization
 */

export interface DNADimension {
  dimension: string
  value: number
  fullMark: number
  description: string
  color: string
  icon: string
}

export interface CreatorDNA {
  creatorId: string
  creatorName: string
  dimensions: DNADimension[]
}

export interface DNAChartProps {
  dnaData?: CreatorDNA
  showLegend?: boolean
  animated?: boolean
}

// Predefined dimension templates
export const DNA_DIMENSIONS = {
  ENERGY: 'Energy',
  FORMALITY: 'Formality',
  HUMOR: 'Humor',
  TECHNICAL_DEPTH: 'Technical Depth',
  STORYTELLING: 'Storytelling'
} as const

export type DNADimensionType = typeof DNA_DIMENSIONS[keyof typeof DNA_DIMENSIONS]
