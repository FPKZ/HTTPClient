import React, { useRef, useLayoutEffect } from "react";

interface AutoResizeTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function AutoResizeTextarea({
  value,
  onChange,
  className,
  style,
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height =
          scrollHeight > 0 ? `${scrollHeight}px` : "1.2rem";
      }
    };

    adjustHeight();

    const observer = new ResizeObserver(adjustHeight);
    if (textareaRef.current) {
      observer.observe(textareaRef.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={className}
      style={{ ...style, overflow: "hidden", resize: "none" }}
      value={value}
      onChange={onChange}
      rows={1}
    />
  );
}
