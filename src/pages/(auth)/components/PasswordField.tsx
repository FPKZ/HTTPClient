import React from "react";
import { unstable_PasswordToggleField as PasswordToggleField } from "radix-ui";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";

/**
 * Componente de campo de senha padronizado com funcionalidade de alternar visibilidade.
 * Utiliza Radix UI para acessibilidade e Tailwind CSS para estilização.
 */
const PasswordField: React.FC<{
    label?: string; 
    name: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    isInvalid?: boolean; 
    error?: string; 
    placeholder: string;
    id?: string;
    className?: string;
    required?: boolean;
}> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  isInvalid, 
  error, 
  placeholder,
  id,
  className,
  ...props 
}: any) => {
  return (
    <div id={id || name} className="mb-3">
      {label && <label htmlFor={id || name} className="block mb-1 text-sm text-[#cecece]/70">{label}</label>}
      <div className="relative flex items-center">
        <PasswordToggleField.Root className="w-full relative">
          <PasswordToggleField.Input 
            {...props}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`
              rounded border border-[#313131]
              bg-[#181818] hover:bg-[#121212] focus:bg-[#121212]
              w-full p-2 outline-none ${isInvalid ? 'border-red-500' : ''} ${className || ''}
            `}
            style={{ 
              paddingRight: '45px',
              transition: 'all 0.2s ease-in-out'
            }}
          />
          <PasswordToggleField.Toggle 
            className="absolute right-0 top-1/2 -translate-y-1/2 border-0 bg-transparent px-3 flex items-center justify-center text-zinc-500 hover:text-white"
            style={{ 
              cursor: 'pointer', 
              zIndex: 10,
              outline: 'none',
              background: 'none',
              height: '100%'
            }}
            type="button"
            tabIndex={-1}
          >
            <PasswordToggleField.Icon
              visible={<EyeOpenIcon width={20} height={20} />}
              hidden={<EyeClosedIcon width={20} height={20} />}
            />
          </PasswordToggleField.Toggle>
        </PasswordToggleField.Root>
      </div>
      {isInvalid && (
        <span className="text-red-500 text-xs mt-1 block">
          {error}
        </span>
      )}
    </div>
  );
};

export default PasswordField;
