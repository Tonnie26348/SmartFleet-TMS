import { defineConfig } from "nitro";

export default defineConfig({
  externals: {
    external: ["@vercel/nft", "nf3"],
  },
});
