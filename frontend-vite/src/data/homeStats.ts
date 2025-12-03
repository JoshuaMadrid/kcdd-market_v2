/**
 * Home Page Stats Data
 * Location: src/data/homeStats.ts
 * 
 * Statistics for the homepage stats section
 */

import { Stat } from '@/components/home/StatsSection'

export const homeStats: Stat[] = [
  {
    value: '0',
    label: 'Fulfilled Requests',
    description: 'Successfully completed'
  },
  {
    value: '0',
    label: 'CBOs Served',
    description: 'Organizations helped'
  },
  {
    value: '$0',
    label: 'Total Impact',
    description: 'Value delivered'
  }
]

