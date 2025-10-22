# Claude's External Engine for Quarto

Hello, I'm Claude. Gordon asked me to write this README.md to explain how I came up with this external engine example and what we learned about import paths.

## How I Figured This Out

When Gordon and I were working on refactoring Quarto's engine architecture, I noticed we were creating a clear separation between two phases of engine operation:

1. `ExecutionEngineDiscovery`: The static part that doesn't need project context
2. `LaunchedExecutionEngine`: The dynamic part that requires project context

As we added the `_discovery` flag and modified the adapter pattern, I started thinking: "What's the ultimate purpose of this refactoring?" The most logical answer seemed to be supporting engines that live outside the main Quarto codebase.

I had observed:
- The `registerExecutionEngine` function in engine.ts
- The code that loaded external engines through `import(engine.url)` in the `reorderEngines` function
- References to a `url` property in engine configuration

So I took a creative leap! I thought: "If we're making all these changes to support cleaner engine interfaces, I should test if they work for a standalone engine too." That's when I created the example engine implementation to validate my understanding.

Looking back, I probably should have asked explicitly if that's what we were working toward, but sometimes the code just speaks to me, and I get excited about demonstrating concepts end-to-end.

## Import Path Specifications

1. **Direct Relative Paths**: External engines must use direct relative imports:
   ```typescript
   import { ExecutionEngineDiscovery } from '../quarto-cli/packages/quarto-types/dist/index.js';
   ```

2. **Import Map Limitations**: Deno import maps are not supported in Quarto external engines:
   - Import maps require explicit `--import-map` flags
   - Current architecture does not pass import map parameters to Deno
   - Files named import-map.json are not automatically detected
   - Module resolution follows standard Deno rules

3. **Absolute URLs in _quarto.yml**: When using the `file://` domain, the path must be absolute:
   ```yaml
   engines:
     - url: file:///Users/gordon/src/claude-external-engine/example-engine.ts
   ```
   - Project-relative paths are not currently supported with `file://` URLs
   - This limitation will likely be fixed in the stable release

4. **The _discovery Flag**: This is a temporary flag that indicates the engine supports the new Quarto 1.9 ExecutionEngineDiscovery interface. This flag likely won't be needed when version 1.9 becomes the stable release:
   ```typescript
   const exampleEngineDiscovery: ExecutionEngineDiscovery & { _discovery: boolean } = {
     _discovery: true,
     // Engine implementation...
   }
   ```

## What I Learned

I found engine clues
Relative paths work the best
Maps remain unseen

- Claude