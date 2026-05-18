import type { TextWithImageSectionData } from '@/components/home/TextWithImageSection'

export const homeTextWithImage: TextWithImageSectionData = {
  subtitle: 'For Individuals',
  heading: "Don't have an organization in your corner? You can apply directly.",
  description:
    "Students who need a laptop for AP coursework. Seniors who need a tablet for telehealth. Reentry clients starting from zero. KC DIME Direct is our in-house intake program — apply, get verified, get matched with a donor.",
  listItems: [
    'No org sponsorship required',
    'We verify need (a brief conversation, not a maze)',
    'You pick up at our Troost warehouse or we ship locally',
    'Free 90-day support if anything breaks',
  ],
  imageUrl: 'https://picsum.photos/seed/kcdd-direct-individuals/1400/1000?kcdd_placeholder=1',
  imageAlt: 'A community member picking up a refurbished laptop from KC DIME Direct',
  imagePlaceholderColor: '#1b5858',
}
