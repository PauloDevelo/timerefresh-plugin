# 07. Documentation and Packaging

meta:
  id: time-refresh-plugin-07
  feature: time-refresh-plugin
  priority: P2
  depends_on: [time-refresh-plugin-06]
  tags: [documentation, packaging]

## Objective

Create comprehensive documentation and finalize the npm package for publishing.

## Context

- README should enable users to install and configure the plugin quickly
- Package metadata should be complete for npm discovery
- License file required for open source distribution
- Package should only include necessary files (no tests, no source maps)

## Deliverables

- `README.md` with installation, configuration, and usage documentation
- `LICENSE` file (MIT license)
- Updated `package.json` with complete metadata
- `.npmignore` or `files` field to control published files
- `CHANGELOG.md` for version history

## Steps

1. Create `README.md` with sections:
   
   ```markdown
   # opencode-time-refresh
   
   > OpenCode plugin that automatically injects current date/time into every message
   
   ## Features
   - Automatic time injection
   - Multiple format options (ISO, locale, custom)
   - Timezone support
   - Configurable prefix/suffix
   
   ## Installation
   npm install opencode-time-refresh
   
   ## Configuration
   Add to your opencode.json:
   {
     "plugin": ["opencode-time-refresh"],
     "timeRefresh": { ... }
   }
   
   ## Configuration Options
   | Option | Type | Default | Description |
   |--------|------|---------|-------------|
   | enabled | boolean | true | ... |
   ...
   
   ## Format Options
   ### ISO Format
   ### Locale Format  
   ### Custom Format
   
   ## Examples
   
   ## API
   
   ## License
   ```

2. Create `LICENSE` file:
   - MIT License
   - Current year and author

3. Update `package.json`:
   - Add repository field
   - Add bugs field
   - Add homepage field
   - Add author field
   - Add keywords for npm search
   - Add files field to whitelist published files
   - Verify all scripts work

4. Create `CHANGELOG.md`:
   ```markdown
   # Changelog
   
   ## [0.1.0] - 2026-01-XX
   
   ### Added
   - Initial release
   - ISO, locale, and custom time formats
   - Timezone support
   - Configurable prefix/suffix
   ```

5. Verify package contents:
   ```bash
   npm pack --dry-run
   ```
   
   Should include:
   - dist/
   - README.md
   - LICENSE
   - CHANGELOG.md
   - package.json
   
   Should NOT include:
   - src/
   - tests/
   - .opencode-workspace/
   - node_modules/
   - coverage/

6. Test local installation:
   ```bash
   npm pack
   npm install ./opencode-time-refresh-0.1.0.tgz
   ```

7. Add npm badges to README:
   - npm version
   - license
   - downloads (after publish)

## Files to Create/Modify

- `README.md` (create)
- `LICENSE` (create)
- `CHANGELOG.md` (create)
- `package.json` (modify - add metadata, files field)

## Dependencies

- Task 06: Unit tests (need passing tests, coverage info)

## Acceptance Criteria

- [ ] README includes clear installation instructions
- [ ] README documents all configuration options with examples
- [ ] README includes usage examples for each format type
- [ ] LICENSE file contains valid MIT license text
- [ ] CHANGELOG documents initial release features
- [ ] package.json has complete metadata (repository, bugs, homepage)
- [ ] package.json files field limits published content
- [ ] `npm pack --dry-run` shows only intended files
- [ ] Package can be installed locally and imported
- [ ] No TypeScript source files in published package
- [ ] No test files in published package

## Validation

```bash
# Check package contents
npm pack --dry-run

# Verify package.json is valid
npm pkg get name version description

# Test local install
npm pack
mkdir /tmp/test-install && cd /tmp/test-install
npm init -y
npm install /path/to/opencode-time-refresh-0.1.0.tgz
node -e "console.log(require('opencode-time-refresh'))"

# Lint README (optional)
npx markdownlint README.md
```

## Dependencies Output

- Package ready for `npm publish`
- Documentation available for users
- Feature complete and ready for release

## Notes

- Consider adding TypeDoc for API documentation
- README examples should be copy-pasteable
- Include troubleshooting section if common issues are known
- Add contributing guidelines if accepting contributions
- Consider adding GitHub Actions for CI/CD (future enhancement)
- npm publish requires npm account and authentication
- Use `npm publish --dry-run` before actual publish
