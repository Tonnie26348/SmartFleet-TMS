#!/bin/sh
# Patch nf3 to resolve @vercel/nft ESM/CJS interop error on Netlify
TARGET_FILE="node_modules/nf3/dist/_chunks/trace.mjs"

if [ -f "$TARGET_FILE" ]; then
  echo "Patching $TARGET_FILE..."
  # Replace the named import with a default import and destructuring
  sed -i 's/import { nodeFileTrace } from "@vercel\/nft";/import nft from "@vercel\/nft"; const { nodeFileTrace } = nft;/g' "$TARGET_FILE"
  echo "Patch applied successfully."
else
  echo "Target file $TARGET_FILE not found, skipping patch."
fi
