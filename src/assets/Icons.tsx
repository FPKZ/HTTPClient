import React from "react";
import { tv, type VariantProps } from "tailwind-variants";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  width?: string | number;
  height?: string | number;
  className?: string;
}

interface DivIconProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Icons = () => {
  const FullLogo = ({
    width = "240",
    height = "80",
    className = "",
    ...props
  }: IconProps = {}) => {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 220 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path d="M40 10L15 45H35L25 70L55 30H35L40 10Z" fill="#FFC107" />
        <text
          x="67"
          y="58"
          fill="white"
          fontFamily="Inter"
          fontWeight="800"
          fontStyle="italic"
          fontSize="50"
        >
          VOLT
        </text>
      </svg>
    );
  };

  const SquareIcon = ({ className = "", ...props }: DivIconProps = {}) => {
    return (
      <div
        className={`w-24 h-24 bg-[#1E1E1E] rounded-2xl flex items-center justify-center shadow-lg border border-gray-700 ${className}`}
        {...props}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 60 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M40 10L15 45H35L25 70L55 30H35L40 10Z" fill="#FFC107" />
        </svg>
      </div>
    );
  };

  const variantsRoundIcon = tv({
    // Modificamos a base para garantir que o SVG fique centralizado corretamente
    base: "bg-[#FFC107] rounded-full flex items-center justify-center shadow-lg transition-all",
    variants: {
      size: {
        sm: "w-12 h-12",
        md: "w-16 h-16",
        lg: "w-24 h-24",
        xl: "w-32 h-32",
      },
      // Criamos uma variante interna fictícia (ou composta) se quiséssemos,
      // mas podemos resolver o tamanho do SVG diretamente via classes utilitárias baseadas no tamanho do pai.
    },
    defaultVariants: {
      size: "md",
    },
  });

  // Mapeamento simples para o SVG manter a proporção ideal dentro da div
  const svgSizes = {
    sm: "w-6 h-6", // 24px
    md: "w-8 h-8", // 32px
    lg: "w-12 h-12", // 48px
    xl: "w-16 h-16", // 64px
  };

  interface RoundIconProps
    extends
      React.HTMLAttributes<HTMLDivElement>,
      VariantProps<typeof variantsRoundIcon> {}

  const RoundIcon = ({
    className,
    size = "md",
    ...props
  }: RoundIconProps = {}) => {
    return (
      <div className={variantsRoundIcon({ size, className })} {...props}>
        <svg
          // 1. REMOVEMOS width e height fixos em pixels.
          // 2. USAMOS classes do Tailwind que mudam dinamicamente com o objeto svgSizes.
          className={svgSizes[size]}
          viewBox="0 0 60 80" // O viewBox DEVE continuar aqui para manter a proporção do desenho interno!
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M40 10L15 45H35L25 70L55 30H35L40 10Z" fill="#121212" />
        </svg>
      </div>
    );
  };

  const TodosIcons = () => {
    return (
      <section className="max-w-6xl mx-auto mb-20">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-[#FFC107]">Opção A: VOLT</h2>
          <span className="px-3 py-1 text-xs bg-[#FFC107] text-black font-bold rounded-full">
            ENERGIA & VELOCIDADE
          </span>
        </div>
        <p className="mb-8 text-gray-400 max-w-2xl">
          Um visual agressivo e minimalista. O raio simboliza a velocidade da
          requisição. A tipografia é itálica para dar sensação de movimento.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* <!-- Full Logo --> */}
          <div className="col-span-1 md:col-span-2 bg-[#1E1E1E] p-8 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500 mb-4 uppercase tracking-widest">
              Logo Principal
            </span>
            <svg
              width="240"
              height="80"
              viewBox="0 0 240 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M40 10L15 45H35L25 70L55 30H35L40 10Z" fill="#FFC107" />
              <text
                x="70"
                y="52"
                fill="white"
                fontFamily="Inter"
                fontWeight="800"
                fontStyle="italic"
                fontSize="42"
              >
                VOLT
              </text>
            </svg>
          </div>

          {/* <!-- Square Icon --> */}
          <div className="bg-black p-8 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500 mb-4 uppercase tracking-widest">
              App Icon (Quadrado)
            </span>
            <div className="w-24 h-24 bg-[#1E1E1E] rounded-2xl flex items-center justify-center shadow-lg border border-gray-700">
              <svg
                width="48"
                height="48"
                viewBox="0 0 60 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M40 10L15 45H35L25 70L55 30H35L40 10Z"
                  fill="#FFC107"
                />
              </svg>
            </div>
          </div>

          {/* <!-- Round Icon --> */}
          <div className="bg-black p-8 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500 mb-4 uppercase tracking-widest">
              App Icon (Redondo)
            </span>
            <div className="w-24 h-24 bg-[#FFC107] rounded-full flex items-center justify-center shadow-lg">
              <svg
                width="40"
                height="40"
                viewBox="0 0 60 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M40 10L15 45H35L25 70L55 30H35L40 10Z"
                  fill="#121212"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return {
    todosIcons: TodosIcons,
    roundIcon: RoundIcon,
    squareIcon: SquareIcon,
    fullLogo: FullLogo,
  };
};

export default Icons;
