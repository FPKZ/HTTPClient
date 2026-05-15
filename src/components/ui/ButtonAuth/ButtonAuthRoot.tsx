import type { ButtonHTMLAttributes } from "react";
import { ArrowRight } from "lucide-react";
import { tv, VariantProps } from "tailwind-variants"

const buttonAuthRoot = tv({
    base: "w-full p-1.5 flex items-center gap-2 bg-white! cursor-pointer rounded-full! transition-all duration-300",
    variants: {
        bg: {
            default: "bg-zinc-900!",
            white: "bg-white!",
        },
        color: {
            default: "text-white!",
            white: "text-black!",
        },
        hover: {
            defaultActive: "active:bg-zinc-900! hover:bg-zinc-800! focus:bg-zinc-800!",
            whiteActive: "active:opacity-100 hover:opacity-60 focus:opacity-90"
        }
    },
    defaultVariants: {
        bg: "default",
        color: "default",
        hover: "defaultActive",
    },
});

export type ButtonAuthRootProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  index?: number;
  children?: React.ReactNode | string;
};

export default function ButtonAuthRoot({
    index,
    bg,
    color,
    hover,
    className,
    ...props
}: ButtonAuthRootProps & VariantProps<typeof buttonAuthRoot>) {
  return (
    <button
        key={index}
        className={buttonAuthRoot({bg, color, hover, className})}
        {...props}
    >
        {props.children}
        <div className="w-8 h-8 flex items-center justify-center">
            <ArrowRight size={16} strokeWidth={4} />
        </div>
    </button>
  );
}