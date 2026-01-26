import React, { useState } from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import {
  Copy,
  Scissors,
  ClipboardPaste,
  Search,
  ExternalLink,
  Star,
  Image as ImageIcon,
  Download,
  Info,
  Code,
} from "lucide-react";
import { cn } from "../lib/utils";

/**
 * GlobalContextMenu
 * Wrapper global que fornece menu de contexto dinâmico baseado no elemento clicado.
 */
export default function GlobalContextMenu({ children }) {
  const [targetDetails, setTargetDetails] = useState({
    isEditable: false,
    selectionText: "",
    linkURL: "",
    srcURL: "",
    mediaType: "none",
    tagName: "",
  });

  const isDev = window.electronAPI?.isDev;

  // Atualiza detalhes do alvo ao abrir o menu
  const handleOpenChange = (open) => {
    if (open) {
      // Pequeno delay ou lógica síncrona para pegar a seleção atual
      // const selection = window.getSelection()?.toString() || "";
      // Para pegar o elemento exato que recebeu o evento 'contextmenu',
      // precisariamos interceptar o evento antes.
      // O Radix captura o evento. Mas podemos usar um listener global de 'contextmenu'
      // em captura para pegar o target antes do Radix abrir, ou tentar inferir.
      // Melhor abordagem: usar um ref ou state global temporário atualizado no onContextMenu do wrapper.
    }
  };

  // Referência temporária para o último evento de context menu
  const lastEventRef = React.useRef(null);

  const handleContextMenu = (e) => {
    const target = e.target;
    const selection = window.getSelection()?.toString() || "";
    const isEditable =
      target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA";

    // Procura link pai
    const linkElement = target.closest("a");
    const linkURL = linkElement ? linkElement.href : "";

    // Mídia
    const srcURL = target.src || "";
    const mediaType = target.tagName === "IMG" ? "image" : "none";

    lastEventRef.current = { target, e };

    setTargetDetails({
      isEditable,
      selectionText: selection,
      linkURL,
      srcURL,
      mediaType,
      tagName: target.tagName,
    });
  };

  const menuItems = [];

  // 1. Ações de Input (Cortar/Copiar/Colar)
  if (targetDetails.isEditable) {
    menuItems.push(
      {
        label: "Recortar",
        icon: <Scissors size={14} />,
        onClick: () => document.execCommand("cut"), // Fallback, ou usar Clipboard API se possível
        shortcut: "Ctrl+X",
      },
      {
        label: "Copiar",
        icon: <Copy size={14} />,
        onClick: () => document.execCommand("copy"),
        shortcut: "Ctrl+C",
      },
      // eslint-disable-next-line react-hooks/refs
      {
        label: "Colar",
        icon: <ClipboardPaste size={14} />,
        onClick: async () => {
          try {
            const text = await navigator.clipboard.readText();
            // Tenta inserir no cursor
            if (lastEventRef.current?.target) {
              const el = lastEventRef.current.target;
              const val = el.value;
              const start = el.selectionStart;
              const end = el.selectionEnd;
              if (start !== undefined && end !== undefined) {
                el.value = val.slice(0, start) + text + val.slice(end);
                el.selectionStart = el.selectionEnd = start + text.length;
                // Dispara evento de input para React/frameworks detectarem mudança
                const event = new Event("input", { bubbles: true });
                el.dispatchEvent(event);
              }
            }
          } catch (err) {
            console.error("Failed to read clipboard", err);
          }
        },
        shortcut: "Ctrl+V",
      },
      // { separator: true },
    );
  } else if (targetDetails.selectionText) {
    // 2. Ações de Seleção de Texto
    menuItems.push(
      {
        label: "Copiar",
        icon: <Copy size={14} />,
        onClick: () =>
          navigator.clipboard.writeText(targetDetails.selectionText),
        shortcut: "Ctrl+C",
      },
      // {
      //   label: `Pesquisar "${targetDetails.selectionText.slice(0, 15)}${targetDetails.selectionText.length > 15 ? "..." : ""}"`,
      //   icon: <Search size={14} />,
      //   onClick: () =>
      //     window.open(
      //       `https://www.google.com/search?q=${encodeURIComponent(targetDetails.selectionText)}`,
      //       "_blank",
      //     ),
      // },
      // { separator: true },
    );
  }

  // 3. Ações de Link
  // if (targetDetails.linkURL) {
  //   menuItems.push(
  //     {
  //       label: "Abrir Link",
  //       icon: <ExternalLink size={14} />,
  //       onClick: () => window.open(targetDetails.linkURL, "_blank"),
  //     },
  //     {
  //       label: "Copiar Endereço do Link",
  //       icon: <Copy size={14} />,
  //       onClick: () => navigator.clipboard.writeText(targetDetails.linkURL),
  //     },
  //     {
  //       label: "Adicionar aos Favoritos",
  //       icon: <Star size={14} />,
  //       onClick: () =>
  //         console.log("Favoritar (implementar lógica):", targetDetails.linkURL),
  //     },
  //     // { separator: true },
  //   );
  // }

  // 4. Ações de Imagem
  if (targetDetails.mediaType === "image") {
    menuItems.push(
      {
        label: "Salvar Imagem Como...",
        icon: <Download size={14} />,
        onClick: () => {
          const a = document.createElement("a");
          a.href = targetDetails.srcURL;
          a.download = targetDetails.srcURL.split("/").pop() || "image";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        },
      },
      {
        label: "Copiar Endereço da Imagem",
        icon: <Copy size={14} />,
        onClick: () => navigator.clipboard.writeText(targetDetails.srcURL),
      },
      // { separator: true },
    );
  }

  // 5. Ações Gerais / Dev
  menuItems
    .push
    //    {
    //        label: "Sobre o App",
    //        icon: <Info size={14} />,
    //        onClick: () => console.log("Versão 1.0.0"), // Poderia abrir modal
    //    }
    ();

  if (isDev) {
    menuItems.push(
      { separator: true },
      {
        label: "Inspecionar Elemento",
        icon: <Code size={14} />,
        onClick: () => {
          // IPC para abrir devtools
          window.electronAPI.toggleDevTools();
        },
      },
    );
  }

  // Se não houver itens, o menu pode não abrir ou mostrar apenas "Sobre"
  if (menuItems.length === 0 && !isDev) {
    menuItems.push({
      label: "HTTPClient v1.0",
      icon: <Info size={14} />,
      disabled: true,
    });
  }

  return (
    <ContextMenuPrimitive.Root onOpenChange={handleOpenChange}>
      <ContextMenuPrimitive.Trigger
        onContextMenu={handleContextMenu}
        className="h-full w-full"
      >
        {children}
      </ContextMenuPrimitive.Trigger>

      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
          className="min-w-[180px] bg-zinc-900 border border-zinc-700! p-1 rounded-sm shadow-2xl z-50!"
          alignOffset={5}
        >
          {menuItems.map((item, index) => {
            if (item.separator) {
              return (
                <ContextMenuPrimitive.Separator
                  key={`sep-${index}`}
                  className="h-px bg-zinc-700! m-1"
                />
              );
            }

            return (
              <ContextMenuPrimitive.Item
                key={index}
                disabled={item.disabled}
                onSelect={(e) => {
                  if (!item.disabled && item.onClick) item.onClick(e);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs! font-semibold text-zinc-300 outline-none cursor-pointer hover:bg-zinc-800 rounded transition-colors",
                  item.disabled && "opacity-50 cursor-not-allowed",
                  item.className,
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto text-[10px] text-zinc-500 font-semibold tracking-widest pl-4">
                    {item.shortcut}
                  </span>
                )}
              </ContextMenuPrimitive.Item>
            );
          })}
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  );
}
