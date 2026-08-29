// NOTE: @tanstack/markdown can't replace showdown yet (no extension API for the two below)

import showdown from "showdown";

const ABSOLUTE_HREF = /href=["'](?:https?:)?\/\//i;

/** `[text](/url){target="_blank"}` overrides the default below, in either direction */
const explicittarget: showdown.ShowdownExtension = {
  type: "lang",
  regex: /\[([^\]]*)\]\(([^)\s]+)\)\{target="(_blank|_self)"\}/g,
  replace: (_match: any, text: string, href: string, target: string) =>
    `<a href="${href}" target="${target}"${
      target === "_blank" ? ' rel="noopener noreferrer"' : ""
    }>${text}</a>`,
};

/** only absolute links leave the site, so only they get a new tab */
const targetblank: showdown.ShowdownExtension = {
  type: "output",
  filter: (text: string) =>
    text.replace(/<a\s+([^>]+?)\s*>/g, (match, attrs: string) =>
      /\btarget\s*=/.test(attrs) || !ABSOLUTE_HREF.test(attrs)
        ? match
        : `<a ${attrs} target="_blank" rel="noopener noreferrer">`,
    ),
};

const imagecaptions: showdown.ShowdownExtension = {
  type: "lang",
  regex: /!\[([^\]]*)\]\(([^)]+)\)\{caption="([^"]+)"\}/g,
  replace: (_match: any, alt: string, src: string, caption: string) =>
    `<div class="md-image-container"><img src="${src}" alt="${alt}" class="md-image" /><p class="md-caption">${caption}</p></div>`,
};

const converter = new showdown.Converter({
  tables: true,
  strikethrough: true,
  tasklists: true,
  parseImgDimensions: true,
  headerLevelStart: 2,
  extensions: [explicittarget, imagecaptions, targetblank],
});

export const md = (text: string) => converter.makeHtml(text);
