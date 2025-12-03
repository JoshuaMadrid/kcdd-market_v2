/**
 * Home Page Content Block Data
 * Location: src/data/homeContentBlock.ts
 * 
 * Data for the content block section on the homepage
 */

import { ContentBlockData } from '@/components/home/ContentBlockSection'

export const homeContentBlock: ContentBlockData = {
  subtitle: 'Lorem ipsum dolor sit amet',
  heading: 'How It Works',
  description: 'Our simple three-step process makes it easy for donors to connect with community needs and for organizations to get the technology they require.',
  listItems: [
    'CBOs submit detailed technology equipment requests, explaining their needs and the impact they\'ll create.',
    'Donors browse through requests and claim the ones that align with their interests and capacity to help.',
    'We track the entire fulfillment process and measure the real impact on Kansas City communities.',
  ],
  buttons: [
    {
      label: 'Login',
      href: '/auth/login',
      variant: 'primary'
    },
    {
      label: 'Login',
      href: '/auth/login',
      variant: 'secondary'
    }
  ],
  backgroundColor: '#103032',
  imageBackgroundColor: '#d25c2c'
}

