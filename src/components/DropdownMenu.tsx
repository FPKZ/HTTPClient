import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { tv, type VariantProps } from "tailwind-variants";

/**
 * DropdownMenuComponent
 * Componente genérico para menus suspenso com suporte a Tailwind-Variants (tv).
 */

export const dropdownMenu = tv({
  slots: {
    trigger: "flex items-center justify-center p-1.5 hover:bg-zinc-800 rounded text-gray-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer outline-none",
    content: "min-w-45 bg-zinc-900 border border-zinc-700! p-1 rounded-sm shadow-2xl z-50!",
    item: "flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-300 outline-none cursor-pointer hover:bg-zinc-800 data-[state=open]:bg-zinc-800 rounded transition-colors w-full",
    separator: "h-px bg-zinc-700! m-1",
    subTrigger: "flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-300 outline-none cursor-pointer hover:bg-zinc-800 data-[state=open]:bg-zinc-800 rounded transition-colors w-full",
    subContent: "min-w-45 bg-zinc-900 border border-zinc-700! p-1 rounded-sm shadow-2xl z-60!",
    itemIcon: "shrink-0",
    itemLabel: "flex-1 text-left",
    itemShortcut: "ml-auto text-[10px] text-zinc-500 font-semibold tracking-widest pl-4",
    itemChecked: "ml-auto text-[10px] font-semibold tracking-widest pl-4",
    subTriggerArrow: "ml-auto text-zinc-500",
  },
  variants: {
    variant: {
      default: {},
      light: {
        content: "bg-white border-zinc-200 text-zinc-800 shadow-lg",
        subContent: "bg-white border-zinc-200 text-zinc-800 shadow-lg",
        item: "text-zinc-700 hover:bg-zinc-100 data-[state=open]:bg-zinc-100",
        subTrigger: "text-zinc-700 hover:bg-zinc-100 data-[state=open]:bg-zinc-100",
        separator: "bg-zinc-200",
        itemShortcut: "text-zinc-400",
        subTriggerArrow: "text-zinc-400",
      }
    },
    size: {
      sm: {
        item: "px-2 py-1.5 text-[11px]",
        subTrigger: "px-2 py-1.5 text-[11px]",
        content: "min-w-36",
        subContent: "min-w-36",
      },
      md: {
        item: "px-3 py-2 text-xs",
        subTrigger: "px-3 py-2 text-xs",
        content: "min-w-45",
        subContent: "min-w-45",
      }
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
});

export type DropdownMenuVariants = VariantProps<typeof dropdownMenu>;

export interface DropdownMenuClassNames {
  trigger?: string;
  content?: string;
  item?: string;
  separator?: string;
  subTrigger?: string;
  subContent?: string;
  itemIcon?: string;
  itemLabel?: string;
  itemShortcut?: string;
  itemChecked?: string;
  subTriggerArrow?: string;
}

export interface DropdownMenuItem {
  icon?: React.ReactNode;
  label?: string;
  onClick?: (e?: any) => void;
  className?: string;
  shortcut?: string | React.ReactNode;
  disabled?: boolean;
  separator?: boolean;
  checked?: React.ReactNode;
  subMenu?: DropdownMenuItem[];
  classNames?: Omit<DropdownMenuClassNames, 'trigger' | 'content'>;
}

interface DropdownContextValue {
  styles: ReturnType<typeof dropdownMenu>;
  classNames?: DropdownMenuClassNames;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

export interface MenuItemProps extends DropdownMenuVariants {
  item: DropdownMenuItem;
  index: number;
  className?: string;
  classNames?: Omit<DropdownMenuClassNames, 'trigger' | 'content'>;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  item,
  index,
  className,
  classNames,
  variant,
  size,
}) => {
  const context = React.useContext(DropdownContext);
  const styles = context?.styles || dropdownMenu({ variant, size });

  const localClassNames = {
    item: cn(context?.classNames?.item, classNames?.item, item.classNames?.item),
    separator: cn(context?.classNames?.separator, classNames?.separator, item.classNames?.separator),
    subTrigger: cn(context?.classNames?.subTrigger, classNames?.subTrigger, item.classNames?.subTrigger),
    subContent: cn(context?.classNames?.subContent, classNames?.subContent, item.classNames?.subContent),
    itemIcon: cn(context?.classNames?.itemIcon, classNames?.itemIcon, item.classNames?.itemIcon),
    itemLabel: cn(context?.classNames?.itemLabel, classNames?.itemLabel, item.classNames?.itemLabel),
    itemShortcut: cn(context?.classNames?.itemShortcut, classNames?.itemShortcut, item.classNames?.itemShortcut),
    itemChecked: cn(context?.classNames?.itemChecked, classNames?.itemChecked, item.classNames?.itemChecked),
    subTriggerArrow: cn(context?.classNames?.subTriggerArrow, classNames?.subTriggerArrow, item.classNames?.subTriggerArrow),
  };

  if (item.separator) {
    return (
      <DropdownMenu.Separator
        key={`sep-${index}`}
        className={styles.separator({
          className: cn(localClassNames.separator, item.className)
        })}
      />
    );
  }

  const commonItemClasses = styles.item({
    className: cn(
      item?.disabled && "opacity-50 cursor-not-allowed",
      localClassNames.item,
      item.className
    )
  });

  const subTriggerClasses = styles.subTrigger({
    className: cn(
      item?.disabled && "opacity-50 cursor-not-allowed",
      localClassNames.subTrigger,
      item.className
    )
  });

  const itemContent = (
    <>
      {item.icon && (
        <span className={styles.itemIcon({ className: localClassNames.itemIcon })}>
          {item.icon}
        </span>
      )}
      <span className={styles.itemLabel({ className: localClassNames.itemLabel })}>
        {item.label}
      </span>
      {item.shortcut && (
        <span className={styles.itemShortcut({ className: localClassNames.itemShortcut })}>
          {item.shortcut}
        </span>
      )}
      {item.checked && (
        <span className={styles.itemChecked({ className: localClassNames.itemChecked })}>
          {item.checked}
        </span>
      )}
    </>
  );

  if (item.subMenu) {
    return (
      <DropdownMenu.Sub key={`sub-${index}`}>
        <DropdownMenu.SubTrigger disabled={item?.disabled} className={subTriggerClasses}>
          {itemContent}
          <span className={styles.subTriggerArrow({ className: localClassNames.subTriggerArrow })}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
            >
              <path
                d="M6.1584 3.1356C6.35366 2.94034 6.67024 2.94034 6.8655 3.1356L10.7039 6.97401C10.8992 7.16927 10.8992 7.48585 10.7039 7.68112L6.8655 11.5195C6.67024 11.7148 6.35366 11.7148 6.1584 11.5195C5.96314 11.3243 5.96314 11.0077 6.1584 10.8124L9.64322 7.32757L6.1584 3.84273C5.96314 3.64747 5.96314 3.33089 6.1584 3.1356Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </span>
        </DropdownMenu.SubTrigger>
        <DropdownMenu.Portal>
          <DropdownMenu.SubContent
            className={styles.subContent({ className: localClassNames.subContent })}
            sideOffset={2}
            alignOffset={-5}
          >
            {item.subMenu.map((subItem, subIndex) => (
              <MenuItem
                key={`sub-item-${subIndex}`}
                item={subItem}
                index={subIndex}
                variant={variant}
                size={size}
              />
            ))}
          </DropdownMenu.SubContent>
        </DropdownMenu.Portal>
      </DropdownMenu.Sub>
    );
  }

  return (
    <DropdownMenu.Item
      key={index}
      disabled={item?.disabled}
      onClick={item.onClick}
      className={commonItemClasses}
    >
      {itemContent}
    </DropdownMenu.Item>
  );
};

export interface DropdownMenuComponentProps extends DropdownMenuVariants {
  buttonContent: React.ReactNode;
  items: DropdownMenuItem[];
  className?: string;
  classNames?: DropdownMenuClassNames;
}

export function DropdownMenuComponent({
  buttonContent,
  items,
  className,
  classNames,
  variant,
  size,
}: DropdownMenuComponentProps) {
  const styles = React.useMemo(() => dropdownMenu({ variant, size }), [variant, size]);
  const providerValue = React.useMemo(() => ({ styles, classNames }), [styles, classNames]);

  return (
    <DropdownContext.Provider value={providerValue}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className={styles.trigger({ className: classNames?.trigger })}>
            {buttonContent}
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={styles.content({ className: cn(className, classNames?.content) })}
            sideOffset={5}
            align="end"
          >
            {items.map((item, index) => (
              <MenuItem key={index} item={item} index={index} />
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </DropdownContext.Provider>
  );
}
