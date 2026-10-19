// Global stylesheets are imported for their side effects only (e.g. app/layout.tsx).
// TypeScript 6 checks side-effect imports by default (noUncheckedSideEffectImports),
// so CSS files need a module declaration to resolve.
declare module "*.css";
