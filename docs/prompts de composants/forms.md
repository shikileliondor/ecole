You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
form-layout.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, CircleCheck, ExternalLink } from "lucide-react";
import { useState } from "react";

const highlights = [
  {
    id: 1,
    feature: "Used by top design teams worldwide",
  },
  {
    id: 2,
    feature: "Seamless integration with design tools",
  },
  {
    id: 3,
    feature: "Real-time collaboration features",
  },
];

const plans = [
  {
    name: "Creator",
    features: [
      { feature: "Up to 3 design projects" },
      { feature: "Basic collaboration tools" },
      { feature: "5GB cloud storage" },
      { feature: "Community forum support" },
    ],
    price: "$15",
    href: "#",
    isRecommended: false,
  },
  {
    name: "Team",
    features: [
      { feature: "Unlimited design projects" },
      { feature: "Advanced collaboration suite" },
      { feature: "50GB cloud storage" },
      { feature: "Priority email support" },
    ],
    price: "$49",
    href: "#",
    isRecommended: true,
  },
  {
    name: "Agency",
    features: [
      { feature: "Unlimited projects and team members" },
      { feature: "Client portal access" },
      { feature: "250GB cloud storage" },
      { feature: "White-labeling options" },
      { feature: "Dedicated account manager" },
    ],
    price: "$99",
    href: "#",
    isRecommended: false,
  },
];

export default function WorkspaceForm() {
  const [selected, setSelected] = useState(plans[0]);

  return (
    <div className="flex items-center justify-center p-10">
      <form className="sm:mx-auto sm:max-w-7xl">
        <h3 className="text-xl font-semibold text-foreground">
          Create new design workspace
        </h3>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="mt-6 lg:col-span-7">
            <div className="space-y-4 md:space-y-6">
              <div className="md:flex md:items-center md:space-x-4">
                <div className="md:w-1/4">
                  <Label htmlFor="organization" className="font-medium">
                    Organization
                  </Label>
                  <Select defaultValue="1">
                    <SelectTrigger
                      id="organization"
                      name="organization"
                      className="mt-2 w-full"
                    >
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Acme, Inc.</SelectItem>
                      <SelectItem value="2">Hero Labs</SelectItem>
                      <SelectItem value="3">Rose Holding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4 md:mt-0 md:w-3/4">
                  <Label htmlFor="workspace" className="font-medium">
                    Workspace name
                  </Label>
                  <Input id="workspace" name="workspace" className="mt-2" />
                </div>
              </div>
              <div>
                <Label htmlFor="region" className="font-medium">
                  Region
                </Label>
                <Select defaultValue="iad1">
                  <SelectTrigger id="region" name="region" className="mt-2">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fra1">
                      eu-central-1 (Frankfurt, Germany)
                    </SelectItem>
                    <SelectItem value="iad1">
                      us-east-1 (Washington, D.C., USA)
                    </SelectItem>
                    <SelectItem value="lhr1">
                      eu-west-2 (London, United Kingdom)
                    </SelectItem>
                    <SelectItem value="sfo1">
                      us-west-1 (San Francisco, USA)
                    </SelectItem>
                    <SelectItem value="sin1">
                      ap-southeast-1 (Singapore)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-2 text-sm text-muted-foreground">
                  For best performance, choose a region closest to your
                  operations
                </p>
              </div>
            </div>
            <h4 className="mt-14 font-medium">
              Plan type<span className="text-red-500">*</span>
            </h4>
            <RadioGroup
              value={selected.name}
              onValueChange={(value) =>
                setSelected(
                  plans.find((plan) => plan.name === value) || plans[0]
                )
              }
              className="mt-4 space-y-4"
            >
              {plans.map((plan) => (
                <label
                  key={plan.name}
                  htmlFor={plan.name}
                  className={cn(
                    "relative block cursor-pointer rounded-md border bg-background transition",
                    selected.name === plan.name
                      ? "border-primary/20 ring-2 ring-primary/20"
                      : "border-border"
                  )}
                >
                  <div className="flex items-start space-x-4 px-6 py-4">
                    <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                      <RadioGroupItem value={plan.name} id={plan.name} />
                    </div>
                    <div className="w-full">
                      <p className="leading-6">
                        <span className="font-semibold text-foreground">
                          {plan.name}
                        </span>
                        {plan.isRecommended && (
                          <Badge variant="secondary" className="ml-2">
                            recommended
                          </Badge>
                        )}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Check
                              className="h-4 w-4 text-muted-foreground"
                              aria-hidden={true}
                            />
                            {feature.feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-b-md border-t border-border bg-muted px-6 py-3">
                    <a
                      href={plan.href}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline hover:underline-offset-4"
                    >
                      Learn more
                      <ExternalLink className="h-4 w-4" aria-hidden={true} />
                    </a>
                    <div>
                      <span className="text-lg font-semibold text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
          <div className="lg:col-span-5">
            <Card className="bg-muted">
              <CardContent>
                <h4 className="text-sm font-semibold text-foreground">
                  Choose the right plan for your design team
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Our flexible plans are designed to scale with your team&apos;s
                  needs. All plans include core design collaboration features
                  with varying levels of storage and support.
                </p>
                <ul className="mt-4 space-y-1">
                  {highlights.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center space-x-2 py-1.5 text-foreground"
                    >
                      <CircleCheck className="h-5 w-5 text-primary" />
                      <span className="truncate text-sm">{item.feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className="mt-4 inline-flex items-center gap-1 text-sm text-primary"
                >
                  Learn more
                  <ExternalLink className="h-4 w-4" aria-hidden={true} />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
        <Separator className="my-10" />
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="ghost">
            Cancel
          </Button>
          <Button type="submit">Update</Button>
        </div>
      </form>
    </div>
  );
}


demo.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function FormLayout01() {
  return (
    <div className="flex items-center justify-center p-10">
      <div className="sm:mx-auto sm:max-w-2xl">
        <h3 className="text-2xl font-semibold text-foreground dark:text-foreground">
          Register to workspace
        </h3>
        <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
          Take a few moments to register for your company&apos;s workspace
        </p>
        <form action="#" method="post" className="mt-8">
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
            <div className="col-span-full sm:col-span-3">
              <Label
                htmlFor="first-name"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                First name
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="first-name"
                name="first-name"
                autoComplete="first-name"
                placeholder="First name"
                className="mt-2"
                required
              />
            </div>
            <div className="col-span-full sm:col-span-3">
              <Label
                htmlFor="last-name"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                Last name
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="last-name"
                name="last-name"
                autoComplete="last-name"
                placeholder="Last name"
                className="mt-2"
                required
              />
            </div>
            <div className="col-span-full">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                Email
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
                className="mt-2"
                required
              />
            </div>
            <div className="col-span-full">
              <Label
                htmlFor="address"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                Address
              </Label>
              <Input
                type="text"
                id="address"
                name="address"
                autoComplete="street-address"
                placeholder="Address"
                className="mt-2"
              />
            </div>
            <div className="col-span-full sm:col-span-2">
              <Label
                htmlFor="city"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                City
              </Label>
              <Input
                type="text"
                id="city"
                name="city"
                autoComplete="address-level2"
                placeholder="City"
                className="mt-2"
              />
            </div>
            <div className="col-span-full sm:col-span-2">
              <Label
                htmlFor="state"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                State
              </Label>
              <Input
                type="text"
                id="state"
                name="state"
                autoComplete="address-level1"
                placeholder="State"
                className="mt-2"
              />
            </div>
            <div className="col-span-full sm:col-span-2">
              <Label
                htmlFor="postal-code"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                Postal code
              </Label>
              <Input
                id="postal-code"
                name="postal-code"
                autoComplete="postal-code"
                placeholder="Postal code"
                className="mt-2"
              />
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              className="whitespace-nowrap"
            >
              Cancel
            </Button>
            <Button type="submit" className="whitespace-nowrap">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

```

Copy-paste these files for dependencies:
```tsx
shadcn/card
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```
```tsx
shadcn/badge
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

```
```tsx
shadcn/button
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

```
```tsx
shadcn/input
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

```
```tsx
shadcn/label
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

```
```tsx
shadcn/radio-group
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }

```
```tsx
shadcn/select
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}

```
```tsx
shadcn/separator
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

```
```tsx
shadcn/textarea
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

```

Install NPM dependencies:
```bash
lucide-react, class-variance-authority, @radix-ui/react-slot, @radix-ui/react-label, @radix-ui/react-radio-group, @radix-ui/react-select, @radix-ui/react-separator
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
