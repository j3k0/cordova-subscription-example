const ATTRIBUTE_NAMES = {
    className: "class",
};
/**
 * Unsafe mini html library
 */
export class HTML {
    static tag(tag, content, attributes) {
        if (content === null)
            return '';
        const attrString = attributes
            ? Object.keys(attributes)
                .map(key => { var _a; return `${ATTRIBUTE_NAMES[key] || key}="${cleanAttribute((_a = attributes[key]) !== null && _a !== void 0 ? _a : '')}"`; })
                .join(' ')
            : '';
        return `<${tag}${attrString.length > 0 ? ' ' + attrString : ''}>${HTML.toString(content)}</${tag}>`;
    }
    static pre(lines) { return HTML.tag('pre', lines); }
    static div(lines, attributes) { return HTML.tag('div', lines, attributes); }
    static span(lines, attributes) { return HTML.tag('span', lines, attributes); }
    static p(lines, attributes) { return HTML.tag('p', lines, attributes); }
    static b(lines, attributes) { return HTML.tag('b', lines, attributes); }
    static h1(lines, attributes) { return HTML.tag('h1', lines, attributes); }
    static h2(lines, attributes) { return HTML.tag('h2', lines, attributes); }
    static center(lines, attributes) { return HTML.tag('center', lines, attributes); }
    static button(lines, attributes) { return HTML.tag('button', lines, attributes); }
    static img(lines, attributes) { return HTML.tag('img', lines, attributes); }
    static toString(lines) {
        if (lines === null)
            return '';
        if (typeof lines === 'string')
            return lines;
        return lines.filter(l => l !== null).join('\n');
    }
}
function cleanAttribute(s) {
    return s.replace(/"/g, `'`);
}
