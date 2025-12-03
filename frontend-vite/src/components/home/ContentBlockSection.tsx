/**
 * Content Block Section Component
 * Location: src/components/home/ContentBlockSection.tsx
 * 
 * Reusable content section with image and CTA buttons on dark background
 */

import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export interface ContentBlockButton {
  label: string
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export interface ContentBlockData {
  subtitle?: string
  heading: string
  description: string
  listItems?: string[]
  imageUrl?: string
  imageAlt?: string
  buttons?: ContentBlockButton[]
  backgroundColor?: string
  imageBackgroundColor?: string
}

interface ContentBlockSectionProps {
  data: ContentBlockData
  imagePosition?: 'left' | 'right'
}

export function ContentBlockSection({ 
  data,
  imagePosition = 'left'
}: ContentBlockSectionProps) {
  const {
    subtitle,
    heading,
    description,
    listItems = [],
    imageUrl,
    imageAlt = 'Feature image',
    buttons = [],
    backgroundColor = '#103032',
    imageBackgroundColor = '#d25c2c'
  } = data
  // Image component
  const imageElement = (
    <figure 
      className="w-full lg:flex-1 h-[390px] rounded-[10px] overflow-hidden" 
      style={!imageUrl ? { backgroundColor: imageBackgroundColor } : undefined}
      aria-label={imageAlt}
    >
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      )}
    </figure>
  )

  // Text content component
  const textContent = (
    <article className="w-full lg:flex-1 flex flex-col gap-6">
      {subtitle && (
        <p className="text-base text-white">{subtitle}</p>
      )}
      
      <h2 id="content-block-heading" className="text-[30px] font-bold text-white leading-normal">
        {heading}
      </h2>
      
      <div className="text-base text-white">
        <p className={listItems.length > 0 ? 'mb-4' : ''}>
          {description}
        </p>
        {listItems.length > 0 && (
          <ul className="list-disc ml-6 space-y-1">
            {listItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>
      
      {buttons.length > 0 && (
        <nav className="flex gap-4" aria-label="Content actions">
          {buttons.map((button, index) => {
            const isPrimary = button.variant !== 'secondary'
            const btnBgColor = isPrimary ? imageBackgroundColor : '#ffffff'
            const btnTextColor = isPrimary ? '#ffffff' : backgroundColor
            const btnBorderColor = isPrimary ? imageBackgroundColor : '#ffffff'
            const hoverTextColor = isPrimary ? imageBackgroundColor : '#ffffff'
            
            const buttonElement = (
              <Button
                key={index}
                onClick={button.onClick}
                className="border-2 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 transition-all duration-200 rounded-full h-10 px-4"
                style={{
                  backgroundColor: btnBgColor,
                  color: btnTextColor,
                  borderColor: btnBorderColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = hoverTextColor
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = btnBgColor
                  e.currentTarget.style.color = btnTextColor
                }}
              >
                {button.label}
              </Button>
            )

            return button.href ? (
              <Link key={index} to={button.href}>
                {buttonElement}
              </Link>
            ) : buttonElement
          })}
        </nav>
      )}
    </article>
  )

  return (
    <section 
      className="py-8 md:py-12 px-4" 
      style={{ backgroundColor }}
      aria-labelledby="content-block-heading"
    >
      <div className={`max-w-[1000px] mx-auto flex flex-col lg:flex-row gap-10 items-center ${imagePosition === 'right' ? 'lg:flex-row-reverse' : ''}`}>
        {imageElement}
        {textContent}
      </div>
    </section>
  )
}

