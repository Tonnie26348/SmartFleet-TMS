// Shim to fix Nitro/nf3 build error on Netlify
// Providing a mock named export to satisfy the ESM importer
export const nodeFileTrace = () => {
  return {
    trace: () => ({}),
  };
};

export default {
  nodeFileTrace,
};
