'use strict';
const path = require('path');
const fs = require('fs-extra');
const highlightJs = require('highlight.js');
const markdownIt = require('markdown-it');

const gitHubCssFilePath = require.resolve('github-markdown-css');
const highlightCssFilePath = require.resolve('highlight.js/styles/github.css');

const { markdownItChangelogPlugin } = require('./markdown-it-changelog-plugin');
const { sanitizeHtmlLikeGitHub } = require('./sanitize-html-like-github');
const convert = require('./html-to-tsx');

const srcDirectoryPath = __dirname;
const indexHtmlFilename = 'ChangelogMarkdown.tsx';

const createMarkdownRenderer = (h1TitleCb) => {
  const markdownRenderer = markdownIt({
    highlight: (code, language) =>
      `<pre class="hljs"><code>${
        language && highlightJs.getLanguage(language)
          ? highlightJs.highlight(language, code, true).value
          : markdownRenderer.utils.escapeHtml(code)
      }</code></pre>`,
    html: true,
    linkify: true,
    typographer: true,
  }).use(markdownItChangelogPlugin, { h1TitleCb });
  return markdownRenderer;
};

const convertChangelog = ({ markdownChangelogPath, outputDirectoryPath, regenerateCss }) =>
  Promise.all([
    fs.readFile(markdownChangelogPath),
    fs.readFile(path.join(srcDirectoryPath, indexHtmlFilename)),
    Promise.all(
      [gitHubCssFilePath, highlightCssFilePath].map((cssFilePath) =>
        fs.readFile(cssFilePath).then(String)
      )
    )
      .then((cssContents) => cssContents.join(`\n\n`))
      .then((cssContent) => {
              if (regenerateCss === true) {
                  fs.outputFile(path.join(outputDirectoryPath, 'style.css'), cssContent)
              }
          }
      ),
  ])
    .then(([markdownBuffer, htmlBuffer]) =>
      [markdownBuffer, htmlBuffer].map(String)
    )
    .then(([markdown, htmlTemplate]) => {
      const replacements = { content: null };
      replacements.content = sanitizeHtmlLikeGitHub(
        createMarkdownRenderer((h1Title) => {
          replacements.title = h1Title;
        }).render(markdown)
      );
      return Object.keys(replacements).reduce(
        (html, key) => {
          const jsxHtml = convert(replacements[key]);
          return html.replace(`{/* ${key} */}`, jsxHtml);
        },

        htmlTemplate
      );
    })
    .then((html) => {
      fs.outputFile(path.join(outputDirectoryPath, indexHtmlFilename), html);
    });

module.exports = { convertChangelog };
