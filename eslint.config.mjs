// @ts-check
// Allows us to bring in the recommended core rules from eslint itself
import js from "@eslint/js";
// Allows us to use the typed utility for our config, and to bring in the recommended rules for TypeScript projects from typescript-eslint
import { config, configs } from 'typescript-eslint';

// Export our config array, which is composed together thanks to the typed utility function from typescript-eslint
export default config(
  { ignores: [ 'coverage/**' ] },
  {
    // Everything in this config object targets our TypeScript files
    files: [ '**/*.ts' ],
    extends: [
      // Apply the recommended core rules
      js.configs.recommended,
      // Apply the recommended TypeScript rules
      ...configs.recommended,
      // Optionally apply stylistic rules from typescript-eslint that improve code consistency
      ...configs.stylistic
    ]
  },
  {
    files: [ '**/*.spec.ts' ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
);
