import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
import { Button } from './button'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. This is the main body of the card.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
}

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px] p-6">
      <p>A simple card with just content and padding.</p>
    </Card>
  ),
}

export const WithImage: Story = {
  render: () => (
    <Card className="w-[350px] overflow-hidden">
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600" />
      <CardHeader>
        <CardTitle>Featured Card</CardTitle>
        <CardDescription>With a colorful header image.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card has a visual header element above the content.</p>
      </CardContent>
    </Card>
  ),
}

export const Stats: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card className="w-[200px] p-6">
        <div className="text-3xl font-bold">2,847</div>
        <div className="text-sm text-muted-foreground">Total Users</div>
      </Card>
      <Card className="w-[200px] p-6">
        <div className="text-3xl font-bold">$12,450</div>
        <div className="text-sm text-muted-foreground">Revenue</div>
      </Card>
      <Card className="w-[200px] p-6">
        <div className="text-3xl font-bold">89%</div>
        <div className="text-sm text-muted-foreground">Success Rate</div>
      </Card>
    </div>
  ),
}

export const Interactive: Story = {
  render: () => (
    <Card className="w-[350px] cursor-pointer transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>Clickable Card</CardTitle>
        <CardDescription>Hover to see shadow effect.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card has interactive hover states.</p>
      </CardContent>
    </Card>
  ),
}
