/**
 * Welcome Page
 * Shown immediately after signup so the new user picks their role.
 * Donor: continue browsing requests.
 * CBO: go to organization setup to upgrade user_type.
 */

import { Link } from 'react-router-dom'
import { Gift, Building2, ArrowRight } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { routes } from '@/config'

export function WelcomePage() {
  const { user } = useUser()
  const firstName = user?.firstName || 'there'

  return (
    <div className="container max-w-4xl py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Welcome, {firstName}!
        </h1>
        <p className="text-lg text-muted-foreground">
          How would you like to participate in the KC Digital Drive Market?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Donor card */}
        <Card className="border-2 hover:border-[#ea580c] hover:shadow-md transition-all group cursor-pointer">
          <Link to={routes.requests} className="block">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fff7ed] flex items-center justify-center group-hover:bg-[#ea580c]/10 transition-colors">
                <Gift className="h-8 w-8 text-[#ea580c]" />
              </div>
              <h2 className="text-xl font-bold mb-2">I'm a Donor</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Browse open requests from Kansas City nonprofits and fund technology equipment that bridges the digital divide.
              </p>
              <Button className="w-full bg-[#ea580c] hover:bg-[#dc4c06] text-white">
                Browse Requests
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        {/* CBO card */}
        <Card className="border-2 hover:border-[#ea580c] hover:shadow-md transition-all group cursor-pointer">
          <Link to={routes.cbo.setup} className="block">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fff7ed] flex items-center justify-center group-hover:bg-[#ea580c]/10 transition-colors">
                <Building2 className="h-8 w-8 text-[#ea580c]" />
              </div>
              <h2 className="text-xl font-bold mb-2">I'm a Community Organization</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Set up your organization profile, publish technology equipment requests, and connect with donors who care about your mission.
              </p>
              <Button variant="outline" className="w-full border-[#ea580c] text-[#ea580c] hover:bg-[#fff7ed]">
                Set Up Organization
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Not sure?{' '}
        <Link to={routes.about} className="underline hover:text-foreground">
          Learn more about how it works
        </Link>
      </p>
    </div>
  )
}
