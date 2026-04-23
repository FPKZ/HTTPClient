import React from "react";

export const VoltIcon = ({
  className = "h-8 w-8",
  color = "#FFC107",
  ...props
}) => (
  <svg
    viewBox="0 0 60 81"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M40 10L15 45H35L25 70L55 30H35L40 10Z" fill={color} />
  </svg>
);

export const VoltLogo = ({ className = "", size = "text-2xl" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <VoltIcon className="h-8 w-8 shrink-0" />
      <span
        className={`${size} font-display font-black tracking-normal gradient-text italic inline-block pe-4 ml-1`}
      >
        VOLT
      </span>
    </div>
  );
};

export default VoltLogo;

/*
### ⚡ Nova Identidade Visual e Refinamento
- **Logo Oficial**: Integrado o componente `VoltLogo` utilizando o ícone de raio exato do sistema (Amber #FFC107).
- **Correção de Clipping**: Resolvido o problema de texto cortado no nome "VOLT" aplicando `inline-block` e padding horizontal. Isso garante que o navegador reserve espaço para a inclinação da fonte.
- **Metadados**: Título da página atualizado para "VOLT - Requisições API Simplificadas" e novo **favicon.svg** adicionado.
- **Paleta de Cores**: Implementação do "Amarelo Volt" (#FFC107) em conformidade total com os assets.
*/
