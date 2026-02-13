export const monacoRegistry = {
  editors: new Map(),
  activeEditor: null,

  register(editor) {
    const domNode = editor.getDomNode();
    if (domNode) {
      this.editors.set(domNode, editor);
    }
  },

  unregister(editor) {
    const domNode = editor.getDomNode();
    if (domNode) {
      this.editors.delete(domNode);
    }
  },

  setActive(editor) {
    this.activeEditor = editor;
  },

  getActive() {
    return this.activeEditor;
  },

  getForElement(el) {
    if (!el) return null;

    const container = el.closest(".monaco-editor");
    if (!container) return null;

    return this.editors.get(container) || null;
  },

  layoutAll() {
    this.editors.forEach((editor) => {
      editor.layout();
    });
  },
};
