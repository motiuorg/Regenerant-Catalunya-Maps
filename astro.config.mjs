import { defineConfig } from "astro/config";

const SITE_URL = 'https://refibcn.github.io';

export default defineConfig({
  site: SITE_URL,
  base: '/rc2',
  output: "static",
  outDir: "./dist",
  build: { format: "directory" },
});
