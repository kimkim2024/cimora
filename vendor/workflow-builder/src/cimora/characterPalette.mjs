export function getPaletteRows(form) {
 if (Array.isArray(form.paletteRows)) return form.paletteRows;
 return form.palette ? [{id:'legacy-palette',attribute:'Clothes',color:form.palette}] : [];
}
export function withPalettePrompt(prompt, rows) {
 const base = prompt.replace(/\n*\[Palette\][\s\S]*?\[\/Palette\]/g, '').trimEnd();
 const lines = rows.filter(row => row.attribute.trim() && /^#[0-9a-f]{6}$/i.test(row.color))
  .map(row => `${row.attribute.trim().replace(/[\r\n\[\]]/g, ' ')}: use color ${row.color.toUpperCase()}.`);
 return lines.length ? `${base}${base?'\n\n':''}[Palette]\n${lines.join('\n')}\n[/Palette]` : base;
}

// Remove only a matching block inserted by the previous live-sync implementation.
export function normalizeCharacterForm(form) {
 if (form.palettePromptVersion === 2) return form;
 const block = withPalettePrompt('', getPaletteRows(form));
 const prompt = block && form.prompt.endsWith(block) ? form.prompt.slice(0, -block.length).trimEnd() : form.prompt;
 return {...form, prompt, palettePromptVersion:2};
}
