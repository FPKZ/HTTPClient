import React from "react";
import { Form } from "react-bootstrap";
import { unstable_PasswordToggleField as PasswordToggleField } from "radix-ui";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";

/**
 * Componente de campo de senha padronizado com funcionalidade de alternar visibilidade.
 * Utiliza Radix UI para acessibilidade e Bootstrap para estilização básica.
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
    <Form.Group controlId={id || name} className="mb-3">
      {label && <Form.Label>{label}</Form.Label>}
      <div className="position-relative d-flex align-items-center">
        <PasswordToggleField.Root className="w-100 position-relative">
          <PasswordToggleField.Input 
            {...props}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`
              rounded border border-[#313131]!
              bg-[#181818]! hover:bg-[#121212]! focus:bg-[#121212]!
              w-100 p-2 outline-none ${isInvalid ? 'is-invalid' : ''} ${className || ''}
            `}
            style={{ 
              paddingRight: '45px',
              transition: 'all 0.2s ease-in-out'
            }}
          />
          <PasswordToggleField.Toggle 
            className="position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent! px-3 d-flex align-items-center justify-content-center text-secondary hover:text-primary"
            style={{ 
              cursor: 'pointer', 
              zIndex: 10,
              outline: 'none',
              background: 'none',
              height: '100%'
            }}
            type="button"
            tabIndex="-1" // Evita que o tab pare no botão de olho se desejado, mas Radix geralmente cuida disso
          >
            <PasswordToggleField.Icon
              visible={<EyeOpenIcon width={20} height={20} />}
              hidden={<EyeClosedIcon width={20} height={20} />}
            />
          </PasswordToggleField.Toggle>
        </PasswordToggleField.Root>
      </div>
      {isInvalid && (
        <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default PasswordField;
