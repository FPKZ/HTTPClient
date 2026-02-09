import { loader } from "@monaco-editor/react";

export const initMonacoThemes = async () => {
    const monaco = await loader.init();
    

    const themas = {
        "customized-requst": {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: 'ffa500', fontStyle: 'italic' },
                { token: 'keyword', foreground: '00ff00' },
                { token: 'identifier', foreground: 'ffffff' },
                { token: 'string', foreground: 'ce9178' },
            ],
            colors: {
                'editor.background': '#000000', // Fundo combinando com sua div
                'editor.foreground': '#d4d4d4',
                'editorLineNumber.foreground': '#444444',
                'editor.selectionBackground': '#333940',
            }
        },
        "code-snippet": {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: 'ffa500', fontStyle: 'italic' },
                { token: 'keyword', foreground: '00ff00' },
                { token: 'identifier', foreground: 'ffffff' },
                { token: 'string', foreground: 'ce9178' },
            ],
            colors: {
                'editor.background': '#1e1e1e', // Fundo combinando com sua div
                'editor.foreground': '#d4d4d4',
                'editorLineNumber.foreground': '#444444',
                'editor.selectionBackground': '#333940',
            }
        }
    }

    Object.entries(themas).forEach(([key, value]) => {
        monaco.editor.defineTheme(key, value);
    })
    // monaco.editor.defineTheme('meuTemaCustomizado', {
    //     base: 'vs-dark',
    //     inherit: true,
    //     rules: [
    //         { token: 'comment', foreground: 'ffa500', fontStyle: 'italic' },
    //         { token: 'keyword', foreground: '00ff00' },
    //         { token: 'identifier', foreground: 'ffffff' },
    //         { token: 'string', foreground: 'ce9178' },
    //     ],
    //     colors: {
    //         'editor.background': '#000000', // Fundo combinando com sua div
    //         'editor.foreground': '#d4d4d4',
    //         'editorLineNumber.foreground': '#444444',
    //         'editor.selectionBackground': '#333940',
    //     }
    // });

    // 2. Ou importar de bibliotecas externas (monaco-themes)
    // try {
    //     const nightOwl = await import('monaco-themes/themes/Night Owl.json');
    //     monaco.editor.defineTheme('night-owl', nightOwl);
        
    //     const cobalt = await import('monaco-themes/themes/Cobalt.json');
    //     monaco.editor.defineTheme('cobalt', cobalt);
    // } catch (error) {
    //     console.error("Erro ao carregar temas do Monaco", error);
    // }
}