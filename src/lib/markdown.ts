// TODO: maybe switch to @tanstack/markdown in the future when it matures

import showdown from "showdown";

const targetblank: showdown.ShowdownExtension = {
  type: "output",
  regex: "<a(?=.*?href=[\"'](?:https?://|//))(.*?)>",
  replace: (_match: any, content: string) => {
    return '<a target="_blank"' + content + ">";
  },
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
  extensions: [targetblank, imagecaptions],
});

export const md = (text: string) => converter.makeHtml(text);
