import { defineConfig } from "astro/config";

const SITE_URL = 'https://motiuorg.github.io';

export default defineConfig({
  site: SITE_URL,
  base: '/Regenerant-Catalunya-Maps',
  output: "static",
  outDir: "./dist",
  build: { format: "directory" },
  // The design system ships Astro components + CSS as source; make sure Vite
  // processes it from node_modules during SSR as well as in the client build.
  vite: {
    ssr: { noExternal: ["@motiu/design"] },
  },
});
