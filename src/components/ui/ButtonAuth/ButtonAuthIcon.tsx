import { tv, VariantProps } from "tailwind-variants";
import type { ImgHTMLAttributes } from "react";

const buttonAuthIcon = tv({
    base: "flex items-center justify-center",
    variants: {
        size: {
            default: "w-8 h-8",
            small: "w-6 h-6",
            large: "w-10 h-10",
        },
        invisible: {
            true: "invisible",
            false: "visible",
        }
    },
    defaultVariants: {
        size: "default",
        invisible: false,
    },
})

interface ButtonAuthIconProps extends ImgHTMLAttributes<HTMLImageElement> {
    img?: string;
    alt?: string;
    size?: string;
}

export default function ButtonAuthIcon({
    img,
    alt,
    size,
    ...props
}: ButtonAuthIconProps & VariantProps<typeof buttonAuthIcon>) {
    return (
        <div>
            <img
                src={img}
                alt={alt}
                className={buttonAuthIcon({size, ...props})}
            />
        </div>
    );
}