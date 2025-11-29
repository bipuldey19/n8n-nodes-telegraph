/**
 * Converts Markdown text to Telegraph Node format
 * Supports: headings, bold, italic, strikethrough, links, code, blockquotes, lists, images, horizontal rules
 */

type TelegraphNode = string | {
	tag: string;
	attrs?: { [key: string]: string };
	children?: TelegraphNode[];
};

export function markdownToTelegraph(markdown: string): TelegraphNode[] {
	const lines = markdown.split('\n');
	const result: TelegraphNode[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// Skip empty lines
		if (line.trim() === '') {
			i++;
			continue;
		}

		// Horizontal rule
		if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
			result.push({ tag: 'hr' });
			i++;
			continue;
		}

		// Headings
		const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
		if (headingMatch) {
			const level = headingMatch[1].length;
			const text = headingMatch[2];
			// Telegraph only supports h3 and h4
			const tag = level <= 3 ? 'h3' : 'h4';
			result.push({ tag, children: parseInline(text) });
			i++;
			continue;
		}

		// Code block (fenced)
		if (line.trim().startsWith('```')) {
			const codeLines: string[] = [];
			i++; // Skip opening ```
			while (i < lines.length && !lines[i].trim().startsWith('```')) {
				codeLines.push(lines[i]);
				i++;
			}
			i++; // Skip closing ```
			result.push({ tag: 'pre', children: [codeLines.join('\n')] });
			continue;
		}

		// Blockquote
		if (line.trim().startsWith('>')) {
			const quoteLines: string[] = [];
			while (i < lines.length && lines[i].trim().startsWith('>')) {
				quoteLines.push(lines[i].replace(/^>\s?/, ''));
				i++;
			}
			result.push({ tag: 'blockquote', children: parseInline(quoteLines.join(' ')) });
			continue;
		}

		// Unordered list
		if (/^[*\-+]\s+/.test(line.trim())) {
			const listItems: TelegraphNode[] = [];
			while (i < lines.length && /^[*\-+]\s+/.test(lines[i].trim())) {
				const itemText = lines[i].replace(/^[*\-+]\s+/, '');
				listItems.push({ tag: 'li', children: parseInline(itemText) });
				i++;
			}
			result.push({ tag: 'ul', children: listItems });
			continue;
		}

		// Ordered list
		if (/^\d+\.\s+/.test(line.trim())) {
			const listItems: TelegraphNode[] = [];
			while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
				const itemText = lines[i].replace(/^\d+\.\s+/, '');
				listItems.push({ tag: 'li', children: parseInline(itemText) });
				i++;
			}
			result.push({ tag: 'ol', children: listItems });
			continue;
		}

		// Image (standalone)
		const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
		if (imageMatch) {
			const alt = imageMatch[1];
			const src = imageMatch[2];
			const figure: TelegraphNode = {
				tag: 'figure',
				children: [{ tag: 'img', attrs: { src } }],
			};
			if (alt) {
				(figure as { tag: string; children: TelegraphNode[] }).children.push({
					tag: 'figcaption',
					children: [alt],
				});
			}
			result.push(figure);
			i++;
			continue;
		}

		// Regular paragraph
		const paragraphLines: string[] = [];
		while (
			i < lines.length &&
			lines[i].trim() !== '' &&
			!/^(#{1,6}\s|```|>|\*\s|-\s|\+\s|\d+\.\s|!\[|---)/.test(lines[i])
		) {
			paragraphLines.push(lines[i]);
			i++;
		}
		if (paragraphLines.length > 0) {
			result.push({ tag: 'p', children: parseInline(paragraphLines.join(' ')) });
		}
	}

	return result;
}

/**
 * Parse inline markdown elements (bold, italic, links, code, etc.)
 */
function parseInline(text: string): TelegraphNode[] {
	const result: TelegraphNode[] = [];
	let remaining = text;

	while (remaining.length > 0) {
		// Bold + Italic (***text*** or ___text___)
		let match = remaining.match(/^(\*{3}|_{3})(.+?)\1/);
		if (match) {
			result.push({
				tag: 'strong',
				children: [{ tag: 'em', children: [match[2]] }],
			});
			remaining = remaining.slice(match[0].length);
			continue;
		}

		// Bold (**text** or __text__)
		match = remaining.match(/^(\*{2}|_{2})(.+?)\1/);
		if (match) {
			result.push({ tag: 'strong', children: parseInline(match[2]) });
			remaining = remaining.slice(match[0].length);
			continue;
		}

		// Italic (*text* or _text_)
		match = remaining.match(/^(\*|_)(.+?)\1/);
		if (match) {
			result.push({ tag: 'em', children: parseInline(match[2]) });
			remaining = remaining.slice(match[0].length);
			continue;
		}

		// Strikethrough (~~text~~)
		match = remaining.match(/^~~(.+?)~~/);
		if (match) {
			result.push({ tag: 's', children: parseInline(match[1]) });
			remaining = remaining.slice(match[0].length);
			continue;
		}

		// Inline code (`code`)
		match = remaining.match(/^`([^`]+)`/);
		if (match) {
			result.push({ tag: 'code', children: [match[1]] });
			remaining = remaining.slice(match[0].length);
			continue;
		}

		// Link [text](url)
		match = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
		if (match) {
			result.push({
				tag: 'a',
				attrs: { href: match[2] },
				children: parseInline(match[1]),
			});
			remaining = remaining.slice(match[0].length);
			continue;
		}

		// Image ![alt](src) - inline
		match = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
		if (match) {
			result.push({
				tag: 'img',
				attrs: { src: match[2] },
			});
			remaining = remaining.slice(match[0].length);
			continue;
		}

		// Plain text - find next special character or end
		const nextSpecial = remaining.search(/[*_~`[!]/);
		if (nextSpecial === -1) {
			// No more special characters, add rest as text
			result.push(remaining);
			break;
		} else if (nextSpecial === 0) {
			// Special character that didn't match any pattern, treat as text
			result.push(remaining[0]);
			remaining = remaining.slice(1);
		} else {
			// Add text before special character
			result.push(remaining.slice(0, nextSpecial));
			remaining = remaining.slice(nextSpecial);
		}
	}

	// Merge adjacent strings
	return mergeStrings(result);
}

/**
 * Merge adjacent string nodes
 */
function mergeStrings(nodes: TelegraphNode[]): TelegraphNode[] {
	const result: TelegraphNode[] = [];
	let currentString = '';

	for (const node of nodes) {
		if (typeof node === 'string') {
			currentString += node;
		} else {
			if (currentString) {
				result.push(currentString);
				currentString = '';
			}
			result.push(node);
		}
	}

	if (currentString) {
		result.push(currentString);
	}

	return result;
}

/**
 * Converts HTML to Telegraph Node format
 * Supports basic HTML tags
 */
export function htmlToTelegraph(html: string): TelegraphNode[] {
	const result: TelegraphNode[] = [];
	
	// Simple regex-based HTML parser
	// Remove doctype, html, head, body tags
	const content = html
		.replace(/<!DOCTYPE[^>]*>/gi, '')
		.replace(/<\/?html[^>]*>/gi, '')
		.replace(/<head>[\s\S]*?<\/head>/gi, '')
		.replace(/<\/?body[^>]*>/gi, '')
		.trim();

	// Split by block-level tags
	const blockRegex = /<(h[1-6]|p|pre|blockquote|ul|ol|figure|hr|aside)([^>]*)>([\s\S]*?)<\/\1>|<(hr|br)\s*\/?>/gi;
	
	let lastIndex = 0;
	let match;

	while ((match = blockRegex.exec(content)) !== null) {
		// Check for text before this match
		if (match.index > lastIndex) {
			const textBefore = content.slice(lastIndex, match.index).trim();
			if (textBefore) {
				result.push({ tag: 'p', children: parseHtmlInline(textBefore) });
			}
		}

		if (match[4]) {
			// Self-closing tag (hr, br)
			if (match[4].toLowerCase() === 'hr') {
				result.push({ tag: 'hr' });
			}
		} else {
			const tag = match[1].toLowerCase();
			const innerContent = match[3];

			if (tag === 'hr') {
				result.push({ tag: 'hr' });
			} else if (tag.startsWith('h')) {
				// Convert h1-h6 to h3 or h4
				const level = parseInt(tag[1]);
				const telegraphTag = level <= 3 ? 'h3' : 'h4';
				result.push({ tag: telegraphTag, children: parseHtmlInline(innerContent) });
			} else if (tag === 'ul' || tag === 'ol') {
				const items = parseListItems(innerContent);
				result.push({ tag, children: items });
			} else if (tag === 'figure') {
				result.push(parseFigure(innerContent));
			} else if (tag === 'pre') {
				// Strip inner code tags if present
				const codeContent = innerContent.replace(/<\/?code[^>]*>/gi, '');
				result.push({ tag: 'pre', children: [decodeHtmlEntities(codeContent)] });
			} else {
				result.push({ tag, children: parseHtmlInline(innerContent) });
			}
		}

		lastIndex = match.index + match[0].length;
	}

	// Check for remaining content
	if (lastIndex < content.length) {
		const remaining = content.slice(lastIndex).trim();
		if (remaining) {
			result.push({ tag: 'p', children: parseHtmlInline(remaining) });
		}
	}

	return result.length > 0 ? result : [{ tag: 'p', children: [html] }];
}

function parseHtmlInline(html: string): TelegraphNode[] {
	const result: TelegraphNode[] = [];
	const inlineRegex = /<(strong|b|em|i|u|s|strike|del|code|a)([^>]*)>([\s\S]*?)<\/\1>|<(br|img)([^>]*)\/?>/gi;
	
	let lastIndex = 0;
	let match;

	while ((match = inlineRegex.exec(html)) !== null) {
		// Text before this match
		if (match.index > lastIndex) {
			const text = decodeHtmlEntities(html.slice(lastIndex, match.index));
			if (text) result.push(text);
		}

		if (match[4]) {
			// Self-closing tag
			if (match[4].toLowerCase() === 'img') {
				const srcMatch = match[5].match(/src=["']([^"']+)["']/i);
				if (srcMatch) {
					result.push({ tag: 'img', attrs: { src: srcMatch[1] } });
				}
			}
		} else {
			const tag = match[1].toLowerCase();
			const attrs = match[2];
			const inner = match[3];

			// Map HTML tags to Telegraph tags
			const tagMap: { [key: string]: string } = {
				strong: 'strong',
				b: 'b',
				em: 'em',
				i: 'i',
				u: 'u',
				s: 's',
				strike: 's',
				del: 's',
				code: 'code',
				a: 'a',
			};

			const telegraphTag = tagMap[tag] || tag;
			const node: TelegraphNode = { tag: telegraphTag, children: parseHtmlInline(inner) };

			if (tag === 'a') {
				const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
				if (hrefMatch) {
					(node as { tag: string; attrs: { href: string }; children: TelegraphNode[] }).attrs = { href: hrefMatch[1] };
				}
			}

			result.push(node);
		}

		lastIndex = match.index + match[0].length;
	}

	// Remaining text
	if (lastIndex < html.length) {
		const text = decodeHtmlEntities(html.slice(lastIndex));
		if (text) result.push(text);
	}

	return mergeStrings(result);
}

function parseListItems(html: string): TelegraphNode[] {
	const items: TelegraphNode[] = [];
	const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
	let match;

	while ((match = liRegex.exec(html)) !== null) {
		items.push({ tag: 'li', children: parseHtmlInline(match[1]) });
	}

	return items;
}

function parseFigure(html: string): TelegraphNode {
	const figure: TelegraphNode = { tag: 'figure', children: [] };
	const children = (figure as { tag: string; children: TelegraphNode[] }).children;

	const imgMatch = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
	if (imgMatch) {
		children.push({ tag: 'img', attrs: { src: imgMatch[1] } });
	}

	const captionMatch = html.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
	if (captionMatch) {
		children.push({ tag: 'figcaption', children: parseHtmlInline(captionMatch[1]) });
	}

	return figure;
}

function decodeHtmlEntities(text: string): string {
	return text
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ')
		.replace(/<br\s*\/?>/gi, '\n');
}
