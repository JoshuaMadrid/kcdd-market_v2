/**
 * Notice Banner Component
 *
 * Renders a thin marquee at the very top of every page. Only shows when
 * VITE_NOTICE_BANNER_TEXT is set in the env — otherwise renders nothing.
 * Keeps the codepath in place so a future maintainer can flip a real
 * announcement on without re-wiring the layouts.
 */

const text = (import.meta.env.VITE_NOTICE_BANNER_TEXT as string | undefined)?.trim()

export function NoticeBanner() {
  if (!text) return null

  // Repeat the text a few times so it visually fills the line at any width.
  const repeated = Array.from({ length: 7 }, () => text).join(' • ')

  return (
    <div className="flex items-center justify-center overflow-hidden bg-[hsl(var(--brand-primary-light))] px-4 py-2.5">
      <p className="whitespace-nowrap text-sm font-normal text-[hsl(var(--brand-primary))]">
        {repeated}
      </p>
    </div>
  )
}
