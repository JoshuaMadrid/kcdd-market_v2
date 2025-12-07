/**
 * ========================================
 * BENTO GRID SECTION COMPONENT
 * ========================================
 * 
 * Location: src/components/home/BentoGridSection.tsx
 * 
 * DESCRIPTION:
 * A bento-style grid layout with 4 cards in a 3-column, 2-row grid.
 * Cards can span multiple columns and have customizable backgrounds
 * (colors or images in the future).
 * 
 * LAYOUT:
 * ┌─────────────────┬─────────┐
 * │    Card 1       │ Card 2  │
 * │  (2 cols)       │ (1 col) │
 * ├─────────┬───────┴─────────┤
 * │ Card 3  │     Card 4      │
 * │ (1 col) │    (2 cols)     │
 * └─────────┴─────────────────┘
 * 
 * ========================================
 * USAGE
 * ========================================
 * 
 * ```tsx
 * import { BentoGridSection } from '@/components/home/BentoGridSection'
 * 
 * <BentoGridSection 
 *   cards={[
 *     {
 *       title: 'Card Title',
 *       description: 'Card description...',
 *       linkText: 'Learn more',
 *       linkHref: '/learn-more',
 *       backgroundColor: '#1b5858',
 *       textColor: 'light'
 *     },
 *     // ... more cards
 *   ]}
 * />
 * ```
 * 
 * ========================================
 */

import { Link } from 'react-router-dom'

export interface BentoCardData {
  title: string
  description: string
  linkText?: string
  linkHref?: string
  backgroundColor: string // Color for now, can be image URL later
  textColor: 'light' | 'dark' // 'light' = white text, 'dark' = black text
}

interface BentoGridSectionProps {
  cards: [BentoCardData, BentoCardData, BentoCardData, BentoCardData] // Exactly 4 cards
}

function BentoCard({ 
  card, 
  className 
}: { 
  card: BentoCardData
  className?: string 
}) {
  const textColorClass = card.textColor === 'light' ? 'text-white' : 'text-black'
  
  return (
    <div 
      className={`flex flex-col items-start justify-end p-5 rounded-[10px] ${className}`}
      style={{ backgroundColor: card.backgroundColor }}
    >
      <div className={`flex flex-col gap-1.5 max-w-[250px] ${textColorClass}`}>
        <h3 className="text-base font-bold leading-5">
          {card.title}
        </h3>
        <p className="text-sm font-medium leading-[18px]">
          {card.description}
        </p>
        {card.linkText && (
          card.linkHref ? (
            <Link 
              to={card.linkHref}
              className="text-sm font-medium leading-[18px] underline hover:opacity-80 transition-opacity"
            >
              {card.linkText}
            </Link>
          ) : (
            <span className="text-sm font-medium leading-[18px] underline">
              {card.linkText}
            </span>
          )
        )}
      </div>
    </div>
  )
}

export function BentoGridSection({ cards }: BentoGridSectionProps) {
  return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-[1000px] mx-auto">
        {/* Desktop Grid: 3 columns, 2 rows */}
        <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-2.5 h-[584px]">
          {/* Card 1: Top-left, spans 2 columns */}
          <BentoCard 
            card={cards[0]} 
            className="col-span-2 row-start-1"
          />
          
          {/* Card 2: Top-right, 1 column */}
          <BentoCard 
            card={cards[1]} 
            className="col-start-3 row-start-1"
          />
          
          {/* Card 3: Bottom-left, 1 column */}
          <BentoCard 
            card={cards[2]} 
            className="col-start-1 row-start-2"
          />
          
          {/* Card 4: Bottom-right, spans 2 columns */}
          <BentoCard 
            card={cards[3]} 
            className="col-span-2 col-start-2 row-start-2"
          />
        </div>

        {/* Mobile Stack: Single column */}
        <div className="flex md:hidden flex-col gap-2.5">
          {cards.map((card, index) => (
            <BentoCard 
              key={index}
              card={card} 
              className="min-h-[250px]"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

