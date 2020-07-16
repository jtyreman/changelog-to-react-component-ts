#!/usr/bin/env node
'use strict';

const {argv} = require('yargs').options({
  markdownChangelogPath: {
    default: 'CHANGELOG.md',
    describe: 'The path to the changelog file formatted in Markdown.',
  },
  outputDirectoryPath: {
    default: 'src/components/changelog',
    describe:
      'The path of the directory where the component will be created.',
  },
});

const {convertChangelog} = require('.');

convertChangelog(argv);
