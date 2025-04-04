import { createPlugin } from 'ember-cli-plugin';

export default createPlugin({
  name: 'file-explorer-keyboard-navigation',
  description: 'A plugin for file explorer keyboard navigation',
  version: '1.0.0',
  authors: [
    {
      name: 'Your Name',
      email: 'your.email@example.com',
    },
  ],
  licenses: [
    {
      type: 'MIT',
      title: 'MIT License',
      url: 'https://opensource.org/licenses/MIT',
    },
  ],
  plugins: [
    {
      id: 'update-first-char-map',
      name: 'Update first char map plugin',
      description: 'Plugin to update the first char map',
      version: '1.0.0',
      authors: [
        {
          name: 'Your Name',
          email: 'your.email@example.com',
        },
      ],
      licenses: [
        {
          type: 'MIT',
          title: 'MIT License',
          url: 'https://opensource.org/licenses/MIT',
        },
      ],
    },
  ],
});