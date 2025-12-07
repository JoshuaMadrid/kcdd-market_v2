/**
 * ========================================
 * FOOTER COMPONENT
 * ========================================
 * 
 * Location: src/components/Footer.tsx
 * Data File: src/data/footer.ts
 * 
 * DESCRIPTION:
 * Site-wide footer with link columns, newsletter signup,
 * and legal links. Dark teal background.
 * 
 * ========================================
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Apple, Facebook, Twitter, Instagram, Linkedin, Loader2, CheckCircle } from 'lucide-react'
import { subscribeToNewsletter } from '@/lib/supabase'

export interface FooterLinkColumn {
  title: string
  links: { label: string; href: string }[]
}

export interface FooterData {
  linkColumns: FooterLinkColumn[]
  newsletter: {
    title: string
    description: string
    placeholder: string
    buttonLabel: string
  }
  socialLinks: { icon: string; href: string; label: string }[]
  legalLinks: { label: string; href: string }[]
  bottomSocialLinks?: { icon: string; href: string; label: string }[]
}

interface FooterProps {
  data: FooterData
}

// Icon mapping for social links
const iconMap: Record<string, React.ElementType> = {
  apple: Apple,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
}

function SocialIcon({ 
  iconName, 
  variant = 'white' 
}: { 
  iconName: string
  variant?: 'white' | 'teal' 
}) {
  const Icon = iconMap[iconName] || Apple
  const bgColor = variant === 'white' ? 'bg-white' : 'bg-[#1b5858]'
  const iconColor = variant === 'white' ? 'text-[#103032]' : 'text-white'
  
  return (
    <div className={`${bgColor} flex items-center justify-center p-[5px] rounded-full`}>
      <Icon className={`size-4 ${iconColor}`} />
    </div>
  )
}

export function Footer({ data }: FooterProps) {
  const { linkColumns, newsletter, socialLinks, legalLinks, bottomSocialLinks } = data
  
  // Newsletter form state
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await subscribeToNewsletter(email, 'footer')
      setIsSuccess(true)
      setEmail('')
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err) {
      console.error('Newsletter subscription error:', err)
      setError('Failed to subscribe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <footer className="bg-[#103032] py-10 px-4">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-2.5">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
          {/* Link Columns */}
          <div className="flex flex-wrap gap-3">
            {linkColumns.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-1.5 w-[162px]">
                <h3 className="font-bold text-base text-[#dbf938] leading-5">
                  {column.title}
                </h3>
                {column.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    to={link.href}
                    className="font-medium text-sm text-[#d5d5d5] leading-[18px] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className="flex flex-col gap-1.5 w-full lg:w-auto lg:max-w-[350px]">
            <h3 className="font-bold text-base text-white leading-5">
              {newsletter.title}
            </h3>
            <p className="font-medium text-sm text-white leading-[18px]">
              {newsletter.description}
            </p>
            
            {/* Email Input Form */}
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 items-end pt-4 pb-1.5">
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="newsletter-email" className="font-medium text-sm text-white leading-none">
                  EMAIL:
                </label>
                <Input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={newsletter.placeholder}
                  className="h-9 bg-white border-[#e5e5e5] rounded-lg shadow-sm"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit"
                disabled={isLoading || isSuccess}
                className="h-9 px-4 rounded-full bg-[#f5f5f5] text-[#171717] hover:bg-white shadow-sm disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle className="size-4 text-green-600" />
                ) : (
                  newsletter.buttonLabel
                )}
              </Button>
            </form>

            {/* Success/Error Messages */}
            {isSuccess && (
              <p className="text-sm text-[#dbf938] font-medium">
                Thanks for subscribing!
              </p>
            )}
            {error && (
              <p className="text-sm text-red-400 font-medium">
                {error}
              </p>
            )}

            {/* Social Links (white) */}
            <div className="flex gap-2 items-center">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href}
                  aria-label={social.label}
                  className="hover:opacity-80 transition-opacity"
                >
                  <SocialIcon iconName={social.icon} variant="white" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between pt-10">
          {/* Legal Links */}
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-[#d5d5d5]">
            {legalLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="underline hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Bottom Social Links (teal) */}
          {bottomSocialLinks && bottomSocialLinks.length > 0 && (
            <div className="flex gap-2 items-center">
              {bottomSocialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href}
                  aria-label={social.label}
                  className="hover:opacity-80 transition-opacity"
                >
                  <SocialIcon iconName={social.icon} variant="teal" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

