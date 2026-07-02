// Works around an upstream bug in nf3 (a nitro dependency) where a vendored,
// minified copy of the CommonJS package @vercel/nft is imported using an ESM
// named import. Node's cjs-module-lexer fails to statically detect the
// `nodeFileTrace` export in that minified build, which crashes `vite build`
// during the nitro server bundling step with:
//   SyntaxError: Named export 'nodeFileTrace' not found ...
// This rewrites the offending import to the default-import form Node
// suggests, matching how @vercel/nft actually exposes it at runtime.
const fs = require("node:fs");
const path = require("node:path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  "nf3",
  "dist",
  "_chunks",
  "trace.mjs",
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

const source = fs.readFileSync(target, "utf8");
const broken = 'import { nodeFileTrace } from "@vercel/nft";';
const fixed =
  'import __vercelNft from "@vercel/nft";\nconst { nodeFileTrace } = __vercelNft;';

if (!source.includes(broken)) {
  process.exit(0);
}

fs.writeFileSync(target, source.replace(broken, fixed));
console.log("Patched node_modules/nf3/dist/_chunks/trace.mjs (@vercel/nft named export workaround)");
