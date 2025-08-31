// Fake sharp implementation for @xenova/transformers compatibility
export default function sharp(input, options) {
  return {
    metadata: () => Promise.resolve({ 
      width: options?.raw?.width || 1, 
      height: options?.raw?.height || 1, 
      channels: options?.raw?.channels || 3 
    }),
    rotate: () => sharp(input, options),
    raw: () => sharp(input, options),
    toBuffer: (opts) => Promise.resolve({ 
      data: input || new Uint8Array(0), 
      info: { 
        width: options?.raw?.width || 1, 
        height: options?.raw?.height || 1, 
        channels: options?.raw?.channels || 3 
      } 
    }),
    extend: (extendOptions) => sharp(input, options),
    extract: (extractOptions) => sharp(input, options)
  };
}