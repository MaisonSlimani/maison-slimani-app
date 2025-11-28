TASK: Perform a comprehensive cleanup of the project. Remove everything that is unused.

1. Scope:
   - Scan all project files including JavaScript, TypeScript, HTML, CSS, JSON, and config files.
   - Exclude node_modules, build/dist folders, and any files specified in .gitignore.
   - Detect all unused files, variables, functions, classes, imports, and constants.

2. File Cleanup:
   - Identify files that are not imported, required, or referenced anywhere in the project.
   - Delete all unused files permanently.

3. Code Cleanup:
   - Remove all unused:
     - Variables
     - Constants
     - Functions
     - Classes
     - Imports
     - Exports
   - Remove any dead code blocks or unreachable code.
   - Remove empty functions or empty classes.

4. Refactoring:
   - Update references in other files after removing unused imports or files to avoid broken code.
   - Simplify code where possible after removal.

5. Safety:
   - Backup files before deleting, if possible, but permanent removal is allowed.
   - Do not touch files inside node_modules or external dependencies.
   - Maintain project functionality for all remaining code.

6. Output:
   - Show a report of removed files, variables, and functions.
   - Apply all removals automatically without waiting for manual approval.

7. Verification:
   - Ensure project builds/compiles without errors after cleanup.
   - Ensure that tests (if present) still pass.
   - Fix any import or reference errors caused by removal automatically.

END TASK
