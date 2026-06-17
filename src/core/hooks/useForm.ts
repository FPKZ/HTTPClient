import { useState } from "react";

/**
 * Hook genérico para gerenciamento de formulários com suporte a transformações e validações.
 * @param {Object} initialState - Valor inicial do formulário.
 * @param {Object} config - Configurações de transformers (máscaras) e validators.
 * @returns {Object} utilitários de formulário.
 * 
 * @example
 * const { formValue, erros, handleChange, validate, resetForm } = useForm(
 *   { nome: "", email: "" },
 *   {
 *     transformers: {
 *       nome: (val) => val.toUpperCase() // Exemplo: Tira máscara ou formata as letras
 *     },
 *     validators: {
 *       nome: (val) => val.length < 3 ? "O nome deve ter no mínimo 3 letras" : null,
 *       email: (val) => !val.includes("@") ? "E-mail inválido" : null
 *     }
 *   }
 * );
 * 
 * const handleSubmit = (e) => {
 *   e.preventDefault();
 *   if (validate()) {
 *     console.log("Validação passou! Enviando:", formValue);
 *   }
 * };
 */
export function useForm(initialState: any, config = {}) {
  const [formValue, setFormValue] = useState(initialState);
  const [erros, setErros] = useState<any>({});
  const [validated, setValidated] = useState(false);

  const { transformers = {}, validators = {} }: any = config;

  /**
   * Define o valor de um campo remotamente sem acionar evento via DOM.
   * @param {string} name - O nome do campo do state.
   * @param {any} rawValue - O valor do campo a ser processado.
   */
  const setFieldValue = (name: string, rawValue: any) => {
    let newValue = rawValue;

    // Aplica transformações (como máscaras) se existirem para o campo
    if (transformers[name]) {
      newValue = transformers[name](newValue);
    } else if (name === "email" && typeof newValue === "string") {
      // Comportamento padrão para email
      newValue = newValue.trim();
    }

    setFormValue((prev: any) => ({
      ...prev,
      [name]: newValue,
    }));

    // Limpa o erro do campo ao interagir (opcional, melhora UX)
    if (erros[name]) {
      setErros((prevErrs: any) => {
        const newErrs = { ...prevErrs };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  /**
   * Manipulador universal de mudanças em campos de formulário.
   * Você pode passar o Evento HTML nativo ou passar o nome do campo como string: handleChange("nome", "meu Valor")
   * @param {Event|string} e - Evento de mudança do input ou string do nome do campo.
   * @param {any} [manualValue] - O valor a ser setado caso o primeiro seja string.
   */
  const handleChange = (e: Event | string, manualValue?: any) => {
    if (typeof e === "string") {
      return setFieldValue(e, manualValue);
    }

    const { name, value, type, files }: any = e.target;
    const newValue = type === "file" ? files[0] : value;
    
    setFieldValue(name, newValue);
  };

  /**
   * Executa validações configuradas.
   * @returns {boolean} Se o formulário é válido.
   */
  const validate = (): boolean => {
    let newErrors: any = {};

    // Validação baseada na config de validators
    Object.keys(validators).forEach((field: string) => {
      const value = formValue[field];
      const error = validators[field](value, formValue);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErros(newErrors);
    setValidated(true);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Reseta o formulário para o estado inicial ou vazio.
   */
  const resetForm = (newState = initialState) => {
    setFormValue(newState);
    setErros({});
    setValidated(false);
  };

  return {
    formValue,
    setFormValue,
    erros,
    setErros,
    validated,
    setValidated,
    handleChange,
    validate,
    resetForm,
  };
}
