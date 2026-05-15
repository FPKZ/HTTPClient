import type { ButtonHTMLAttributes } from "react";

interface ButtonAuthContentProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode | string;
}

export default function ButtonAuthContent({
    ...props
}: ButtonAuthContentProps) {
    return (
        <p className="m-0 text-sm">{props.children}</p>
    )
}