# 01. Project Initialization

meta:
  id: time-refresh-plugin-01
  feature: time-refresh-plugin
  priority: P1
  depends_on: []
  tags: [setup, infrastructure]

## Objective

Initialize a TypeScript npm package project with proper build tooling, testing framework, and directory structure for the OpenCode time-refresh plugin.

## Context

- This is a greenfield project starting from an empty directory
- Target is an npm package that can be published and installed as an OpenCode plugin
- Using modern TypeScript tooling: tsc for compilation, Vitest for testing
- Package should support both CommonJS and ESM consumers
- Node.js 18+ is the target runtime

## Deliverables

- `package.json` with proper metadata, scripts, and dependencies
- `tsconfig.json` configured for library output (declaration files, strict mode)
- `vitest.config.ts` for test runner configuration
- `src/` directory with placeholder `index.ts`
- `.gitignore` for Node.js projects
- Basic npm scripts: build, test, clean, prepublishOnly

## Steps

1. Create `package.json` with:
   - name: `opencode-time-refresh`
   - version: `0.1.0`
   - description: OpenCode plugin for automatic time injection
   - main: `dist/index.js`
   - types: `dist/index.d.ts`
   - exports for ESM/CJS compatibility
   - scripts: build, test, clean, prepublishOnly
   - keywords: opencode, plugin, time, date, context
   - license: MIT
   - engines: node >=18

2. Create `tsconfig.json` with:
   - target: ES2022
   - module: NodeNext
   - moduleResolution: NodeNext
   - strict: true
   - declaration: true
   - outDir: dist
   - rootDir: src
   - skipLibCheck: true

3. Create `vitest.config.ts` with:
   - test directory: tests/
   - coverage provider: v8
   - coverage thresholds: 80%

4. Create directory structure:
   - `src/index.ts` with placeholder export
   - `tests/` directory (empty for now)

5. Create `.gitignore` with:
   - node_modules/
   - dist/
   - coverage/
   - *.log

6. Install dependencies:
   - devDependencies: typescript, vitest, @vitest/coverage-v8, @types/node

## Files to Create/Modify

- `package.json` (create)
- `tsconfig.json` (create)
- `vitest.config.ts` (create)
- `src/index.ts` (create - placeholder)
- `.gitignore` (create)

## Dependencies

- None (this is the first task)

## Acceptance Criteria

- [ ] `npm install` completes without errors
- [ ] `npm run build` compiles TypeScript to `dist/` directory
- [ ] `npm test` runs Vitest (passes with no tests or placeholder test)
- [ ] `dist/index.js` and `dist/index.d.ts` are generated after build
- [ ] TypeScript strict mode is enabled
- [ ] Package exports are properly configured for both ESM and CJS

## Validation

```bash
# Install dependencies
npm install

# Build should succeed
npm run build

# Check output files exist
ls dist/index.js dist/index.d.ts

# Test runner should work
npm test

# TypeScript should report no errors
npx tsc --noEmit
```

## Dependencies Output

- Project structure ready for type definitions (task 02)
- Build pipeline available for all subsequent tasks
- Test framework configured for task 06

## Notes

- Using NodeNext module resolution for modern Node.js compatibility
- Vitest chosen over Jest for better TypeScript support and speed
- Package uses dual exports (main + types) for broad compatibility
- prepublishOnly script ensures build runs before npm publish
