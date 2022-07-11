#!/usr/bin/env node
'use strict';

const {argv} = require('yargs').options({
  markdownChangelogPath: {
    default: 'CHANGELOG.md',
    describe: 'The path to the changelog file formatted in Markdown.',
  },
  outputDirectoryPath: {
    default: 'src/components/Changelog',
    describe:
      'The path of the directory where the component will be created.',
  },
  regenerateCss: {
    default: true,
    describe: "Whether to re-create the CSS file. Set to false if using custom markdown css."
  }
});

const {convertChangelog} = require('.');

convertChangelog(argv);
