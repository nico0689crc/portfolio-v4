import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer text-primary",
  {
    variants: {
      variant: {
        default: "inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-semibold hover:bg-amber-hover hover:scale-103 active:scale-98 transition-all duration-200",
        outline:
          "border border-primary-foreground/15 text-primary-foreground hover:text-accent hover:border-accent hover:bg-accent/10 hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all duration-200 group",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted/10 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:text-accent hover:scale-105 transition-all duration-200",
      },
      size: {
        default:
          "h-10 md:h-12 gap-1.5 px-4 md:px-6 text-sm md:text-base has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 md:h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2 md:px-3 text-[10px] md:text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 md:h-10 gap-1 md:gap-1.5 rounded-[min(var(--radius-md),12px)] px-3 md:px-4 text-xs md:text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 md:h-14 gap-1.5 md:gap-2 px-6 md:px-8 text-base md:text-lg has-data-[icon=inline-end]:pr-3 md:has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-3 md:has-data-[icon=inline-start]:pl-4",
        icon: "size-8 md:size-10",
        "icon-xs":
          "size-6 md:size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 md:size-9 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-10 md:size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
