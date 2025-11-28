TASK: Perform full code cleanup on the selected project.

1. Scope:
   - Include all files in the project folder.
   - Focus on JavaScript/TypeScript, HTML, CSS, and JSON files.
   - Exclude node_modules and build/dist folders.

2. Formatting:
   - Apply consistent code formatting according to the project’s linter/formatter settings.
   - If no settings are present, use standard conventions:
     - 2-space indentation
     - Semicolons at the end of statements
     - Single quotes for strings
     - Space before function parentheses
   - Ensure proper spacing, line breaks, and indentation throughout.

3. Linting:
   - Remove all unused variables, imports, and functions.
   - Fix common linting errors and warnings.
   - Simplify redundant expressions.
   - Replace `var` with `const` or `let` as appropriate.
   - Ensure arrow functions are used consistently where suitable.

4. Code Simplification & Refactoring:
   - Identify and simplify overly complex functions.
   - Break large functions into smaller helper functions if necessary.
   - Replace nested callbacks with async/await syntax.
   - Optimize loops and conditional statements for readability.

5. Imports & Dependencies:
   - Remove unused imports.
   - Sort imports alphabetically and group by type (external, internal, relative).
   - Consolidate repeated imports if possible.

6. Security & Best Practices:
   - Ensure no hardcoded secrets or passwords.
   - Suggest safer alternatives for potentially unsafe code patterns.
   - Add comments for any non-obvious logic that could confuse future developers.

7. Output:
   - Show a preview of all changes.
   - Wait for approval before applying changes.
   - If applying automatically, create a backup copy of all modified files.

8. Verification:
   - Ensure the code still compiles/builds without errors.
   - Do not remove or modify test files without explicit instruction.
   - Maintain existing functionality.

END TASK
