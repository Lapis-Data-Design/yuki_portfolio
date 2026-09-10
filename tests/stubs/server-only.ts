// Stand-in for the `server-only` package during test runs. The real
// package throws unless imported through Next's own build pipeline, which
// Vitest doesn't use. This stub does nothing on purpose — its only job is
// to let `import "server-only";` in lib/auth.ts resolve without throwing
// when tests import that file. The real protection stays in place for the
// actual Next.js app build, where the genuine `server-only` package is
// still installed and still imported normally.
export {};