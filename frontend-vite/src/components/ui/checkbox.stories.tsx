import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './checkbox'
import { Label } from './label'

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    checked: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: {},
}

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}

export const CheckboxGroup: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="email" defaultChecked />
        <Label htmlFor="email">Email notifications</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="sms" />
        <Label htmlFor="sms">SMS notifications</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="push" defaultChecked />
        <Label htmlFor="push">Push notifications</Label>
      </div>
    </div>
  ),
}

export const FormExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm font-medium">Notification Preferences</div>
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox id="marketing" className="mt-1" />
          <div>
            <Label htmlFor="marketing" className="text-sm font-medium">
              Marketing emails
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about new products, features, and more.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox id="security" defaultChecked className="mt-1" />
          <div>
            <Label htmlFor="security" className="text-sm font-medium">
              Security emails
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about your account security.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
}
