import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { generateCodeSnippet, supportedLanguages } from "../lib/codeGenerator";
import useTabStore from "../store/useTabStore";
import { buildFinalRequest } from "../utils/collectionUtils";

/**
 * Hook useCodeSnippets
 * Centraliza a lógica de geração de snippets de código, gerenciamento de variáveis e UI adaptativa.
 */
export function useCodeSnippets({ request }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [useSelectMode, setUseSelectMode] = useState(false);
  const [useRealValues, setUseRealValues] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hideSnippetsList, setHideSnippetsList] = useState(false);

  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const previousCategoryRef = useRef(activeCategory);

  const collection = useTabStore((state) => state.collection);
  const globalsFromStore = useTabStore((state) => state.globals);

  // Calcula variáveis ativas (Globais + Ambiente)
  const activeVariables = useMemo(() => {
    const globals = globalsFromStore || [];
    const envs = collection?.environments || [];
    const activeEnvId = collection?.activeEnvironmentId;
    const envVariables =
      envs.find((env) => env.id === activeEnvId)?.variables || [];
    return [...globals, ...envVariables];
  }, [collection, globalsFromStore]);

  const [debouncedRequest, setDebouncedRequest] = useState(request);

  // Debounce para evitar regeneração excessiva durante digitação
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedRequest(request);
    }, 200);
    return () => clearTimeout(handler);
  }, [request]);

  const preparedRequest = useMemo(() => {
    if (!debouncedRequest) return null;
    return buildFinalRequest(debouncedRequest, activeVariables, {
      useValues: useRealValues,
    });
  }, [debouncedRequest, activeVariables, useRealValues]);

  // Metadados dos snippets (estático do lib/codeGenerator)
  const snippetsMetadata = useMemo(() => {
    const list = [];
    let idCounter = 1;

    supportedLanguages.forEach((lang) => {
      lang.variants.forEach((variant) => {
        list.push({
          id: idCounter++,
          title: `${lang.label} - ${variant.label}`,
          category: lang.id,
          language: variant.mode,
          variantId: variant.id,
        });
      });
    });

    return list;
  }, []);

  const categories = useMemo(() => {
    const availableCategories = supportedLanguages
      .filter((lang) => snippetsMetadata.some((s) => s.category === lang.id))
      .map((lang) => ({
        id: lang.id,
        label: lang.label,
        count: snippetsMetadata.filter((s) => s.category === lang.id).length,
      }));

    return [
      { id: "all", label: "Todos", count: snippetsMetadata.length },
      ...availableCategories,
    ];
  }, [snippetsMetadata]);

  const filteredSnippets = useMemo(() => {
    return snippetsMetadata.filter((snippet) => {
      const matchesCategory =
        activeCategory === "all" || snippet.category === activeCategory;
      const matchesSearch = snippet.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [snippetsMetadata, activeCategory, searchQuery]);

  const copyToClipboard = useCallback((code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // Resize Observer para o Header (alternar entre botões e select)
  useEffect(() => {
    if (!headerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const shouldUseSelect = width < 500;
        setUseSelectMode(shouldUseSelect);

        if (shouldUseSelect) {
          setActiveCategory((current) => {
            if (current === "all") {
              const firstCategory = categories.find((cat) => cat.id !== "all");
              return firstCategory ? firstCategory.id : current;
            }
            return current;
          });
        }
      }
    });

    resizeObserver.observe(headerRef.current);
    return () => resizeObserver.disconnect();
  }, [categories]);

  // Resize Observer para o Content (ocultar lista lateral se muito estreito)
  useEffect(() => {
    if (!contentRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const shouldHide = width < 600;
        setHideSnippetsList(shouldHide);

        if (shouldHide && !selectedSnippet && filteredSnippets.length > 0) {
          setSelectedSnippet(filteredSnippets[0]);
        }
      }
    });

    resizeObserver.observe(contentRef.current);
    return () => resizeObserver.disconnect();
  }, [filteredSnippets, selectedSnippet]);

  // Sincroniza seleção ao trocar categoria
  useEffect(() => {
    if (previousCategoryRef.current !== activeCategory) {
      previousCategoryRef.current = activeCategory;
      if (filteredSnippets.length > 0) {
        const isStillInList =
          selectedSnippet &&
          filteredSnippets.some((s) => s.id === selectedSnippet.id);
        if (!isStillInList) setSelectedSnippet(filteredSnippets[0]);
      }
    }
  }, [activeCategory, filteredSnippets, selectedSnippet]);

  // Sincroniza seleção inicial ou ao trocar de requisição
  useEffect(() => {
    if (snippetsMetadata.length > 0) {
      setSelectedSnippet((current) => {
        if (!current) return snippetsMetadata[0];
        const matching = snippetsMetadata.find(
          (s) => s.category === current.category && s.title === current.title,
        );
        return (
          matching ||
          snippetsMetadata.find((s) => s.category === current.category) ||
          snippetsMetadata[0]
        );
      });
    } else {
      setSelectedSnippet(null);
    }
  }, [snippetsMetadata]);

  // Gera o código do snippet selecionado
  const activeCode = useMemo(() => {
    if (!preparedRequest || !selectedSnippet) return "";
    try {
      return generateCodeSnippet(
        preparedRequest,
        selectedSnippet.category,
        selectedSnippet.variantId,
      );
    } catch (error) {
      return `// Erro ao gerar code: ${error.message}`;
    }
  }, [preparedRequest, selectedSnippet]);

  return {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    selectedSnippet,
    setSelectedSnippet,
    useSelectMode,
    useRealValues,
    setUseRealValues,
    copied,
    hideSnippetsList,
    headerRef,
    contentRef,
    categories,
    filteredSnippets,
    activeCode,
    copyToClipboard,
  };
}

export default useCodeSnippets;
