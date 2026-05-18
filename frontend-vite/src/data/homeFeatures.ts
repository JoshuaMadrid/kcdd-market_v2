import { Laptop, HandHeart, PackageCheck } from 'lucide-react'
import { Feature } from '@/components/home/FeaturesSection'

export const homeFeatures: Feature[] = [
  {
    icon: Laptop,
    title: 'Submit a Tech Need',
    description:
      'A verified org or individual posts a specific request — make, model, quantity, and the human story behind it. Our team reviews within 48 hours.',
  },
  {
    icon: HandHeart,
    title: 'Donors Pick a Device to Fund',
    description:
      'Browse open requests, find one that fits your budget, and fund it. Every gift is tagged to a single device with a serial number.',
  },
  {
    icon: PackageCheck,
    title: 'KC DIME Ships and Follows Up',
    description:
      'We wipe, re-image, label, and ship. At 30 and 90 days post-delivery, we check in on the recipient and pass the update back to the donor.',
  },
]
