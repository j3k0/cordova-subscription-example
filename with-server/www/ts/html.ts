export type HTMLContent = ((string | undefined | null)[]) | string | undefined | null;

export type HTMLAttributes = {
  className?: string;
  onclick?: VoidFunction | ((ev: Event) => void) | string;
  src?: string;
  style?: string;
  type?: string;
  id?: string;
  value?: string;
}

const ATTRIBUTE_NAMES: { [key: string]: string } = {
  className: "class",
}

/**
 * Unsafe mini html library
 */
export class HTML {
  static tag(tag: string, content: HTMLContent, attributes?: HTMLAttributes) {
    if (content === null) return '';
    const attrString = attributes
      ? Object.keys(attributes)
        .map(key => `${ATTRIBUTE_NAMES[key] || key}="${cleanAttribute((attributes as any)[key] ?? '')}"`)
        .join(' ')
      : '';
    return `<${tag}${attrString.length > 0 ? ' ' + attrString : ''}>${HTML.toString(content)}</${tag}>`;
  }

  static pre(lines: HTMLContent) { return HTML.tag('pre', lines); }
  static div(lines: HTMLContent, attributes?: HTMLAttributes) { return HTML.tag('div', lines, attributes); }
  static span(lines: HTMLContent, attributes?: HTMLAttributes) { return HTML.tag('span', lines, attributes); }
  static p(lines: HTMLContent, attributes?: HTMLAttributes) { return HTML.tag('p', lines, attributes); }
  static b(lines: HTMLContent, attributes?: HTMLAttributes) { return HTML.tag('b', lines, attributes); }
  static h1(lines: HTMLContent, attributes?: HTMLAttributes) { return HTML.tag('h1', lines, attributes); }
  static h2(lines: HTMLContent, attributes?: HTMLAttributes) { return HTML.tag('h2', lines, attributes); }
  static center(lines: HTMLContent, attributes?: HTMLAttributes) { return HTML.tag('center', lines, attributes); }
  static button(lines: HTMLContent, attributes?: HTMLAttributes) { return HTML.tag('button', lines, attributes); }
  static img(lines: HTMLContent, attributes?: HTMLAttributes) { return HTML.tag('img', lines, attributes); }
  static input(lines: HTMLContent, attributes?: HTMLAttributes) { return HTML.tag('input', lines, attributes); }
  static label(lines: HTMLContent, attributes?: HTMLAttributes) { return HTML.tag('label', lines, attributes); }
  static form(lines: HTMLContent, attributes?: HTMLAttributes) { return HTML.tag('form', lines, attributes); }

  static toString(lines: HTMLContent) {
    if (lines === null || lines === undefined) return '';
    if (typeof lines === 'string') return lines;
    return lines.filter(l => l !== null).join('\n');
  }
}

function cleanAttribute(s: string | VoidFunction): string {
  if (typeof s === 'string') {
    return s.replace(/"/g, `'`);
  }
  else { // Function
    return cleanAttribute('(' + s + ')()');
  }
}