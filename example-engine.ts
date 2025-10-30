/*
 * example-engine.ts
 *
 * Copyright (C) 2023 Posit Software, PBC
 */

// Import types from bundled types
import type {
  ExecutionEngineDiscovery,
  ExecutionEngineInstance,
  ExecutionTarget,
  ExecuteOptions,
  DependenciesOptions,
  PostProcessOptions,
  MappedString,
  EngineProjectContext,
  QuartoAPI,
} from './types/quarto-types.d.ts';

let quarto: QuartoAPI;

/**
 * Example engine that handles .example files
 * This demonstrates how to implement an external engine that can be loaded by URL
 */
const exampleEngineDiscovery: ExecutionEngineDiscovery & { _discovery: boolean } = {
  _discovery: true,

  init: (quartoAPI: QuartoAPI) => {
    quarto = quartoAPI;
  },

  name: 'example',
  defaultExt: '.example',
  defaultYaml: () => ['example:'],
  defaultContent: () => ['# Example Engine\n\n```{example}\nHello, World!\n```'],
  validExtensions: () => ['.example'],
  claimsFile: (_file, ext) => ext.toLowerCase() === '.example',
  claimsLanguage: (language) => language === 'example',
  canFreeze: false,
  generatesFigures: false,

  /**
   * Launch the engine with a project context
   */
  launch: (context: EngineProjectContext): ExecutionEngineInstance => {
    return {
      name: exampleEngineDiscovery.name,
      canFreeze: exampleEngineDiscovery.canFreeze,

      markdownForFile(file: string): Promise<MappedString> {
        return Promise.resolve(quarto.mappedString.fromFile(file));
      },

      target: (file: string, _quiet?: boolean, markdown?: MappedString) => {
        const md = markdown ?? quarto.mappedString.fromFile(file);
        const target: ExecutionTarget = {
          source: file,
          input: file,
          markdown: md,
          metadata: quarto.markdownRegex.extractYaml(md.value),
        };
        return Promise.resolve(target);
      },

      partitionedMarkdown: (file: string) => {
        return Promise.resolve(
          quarto.markdownRegex.partition(Deno.readTextFileSync(file)),
        );
      },

      execute: (options: ExecuteOptions) => {
        // Process the markdown to transform example code blocks
        let markdown = options.target.markdown.value;

        // Simple regex to find and transform example code blocks
        // In a real engine, you'd use a proper parser
        const regex = /```{example}([\s\S]*?)```/g;
        markdown = markdown.replace(regex, (match, content) => {
          return `<div class="example-output">${content.trim()}</div>`;
        });

        return Promise.resolve({
          engine: 'example',
          markdown,
          supporting: [],
          filters: [],
        });
      },

      dependencies: (_options: DependenciesOptions) => {
        return Promise.resolve({
          includes: {},
        });
      },

      postprocess: (_options: PostProcessOptions) => Promise.resolve(),
    };
  }
};

// Export the engine discovery object as the default export
export default exampleEngineDiscovery;