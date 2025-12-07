/**
 * ========================================
 * SECTION HEADER COMPONENT
 * ========================================
 * 
 * Location: src/components/home/SectionHeader.tsx
 * 
 * DESCRIPTION:
 * A centered text block with a bold heading and description.
 * Used to introduce sections with a title and subtitle.
 * 
 * ========================================
 * USAGE
 * ========================================
 * 
 * ```tsx
 * import { SectionHeader } from '@/components/home/SectionHeader'
 * 
 * <SectionHeader 
 *   heading="Our Services"
 *   description="Discover what we have to offer..."
 * />
 * ```
 * 
 * ========================================
 */

export interface SectionHeaderData {
  heading: string
  description: string
}

interface SectionHeaderProps {
  data: SectionHeaderData
}

export function SectionHeader({ data }: SectionHeaderProps) {
  const { heading, description } = data

  return (
    <div className="flex flex-col gap-[22px] items-center justify-center text-center text-black py-10 px-4 max-w-[1000px] mx-auto">
      <h2 className="font-bold text-[30px] w-full">
        {heading}
      </h2>
      <p className="font-normal text-base w-full">
        {description}
      </p>
    </div>
  )
}

