import { ContentBlockData } from '@/components/home/ContentBlockSection'

export const homeContentBlock: ContentBlockData = {
  subtitle: 'How KC DIME Works',
  heading: 'From "we need a laptop" to "it just shipped" — in three steps.',
  description:
    'KC DIME is the Kansas City tech nonprofit that turns donor dollars into actual devices in actual hands. Whether you\'re a community organization equipping a classroom or an individual restarting your career, the path is the same.',
  listItems: [
    'Orgs and individuals submit a verified technology need',
    'Donors fund the request — every dollar tagged to a real device',
    'KC DIME ships the gear and reports back at 30 and 90 days',
  ],
  buttons: [
    { label: 'Browse Requests', href: '/requests', variant: 'primary' },
    { label: 'Learn More', href: '/about', variant: 'secondary' },
  ],
  imageUrl: 'https://picsum.photos/seed/kcdd-how-it-works/900/900?kcdd_placeholder=1',
  imageAlt: 'A young person using a refurbished laptop in a community space',
  backgroundColor: '#103032',
  imageBackgroundColor: '#DBF938',
}
