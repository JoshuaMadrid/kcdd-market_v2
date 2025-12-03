/**
 * Home Page Content Block Data
 * Location: src/data/homeContentBlock.ts
 * 
 * Data for the content block section on the homepage
 */

import { ContentBlockData } from '@/components/home/ContentBlockSection'

export const homeContentBlock: ContentBlockData = {
  subtitle: 'Lorem ipsum dolor sit amet',
  heading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
  listItems: [
    'Lorem ipsum dolor si',
    'incididunt ut labor',
    'qua. Ut enim ad mi',
    'ut labore et dol'
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

