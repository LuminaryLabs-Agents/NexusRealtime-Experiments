export const OUTLINE_SOBEL_KIT_VERSION = "0.1.0";

export function createOutlineSobelKit(config = {}) {
  return {
    id: "outline-sobel-kit",
    version: OUTLINE_SOBEL_KIT_VERSION,
    domain: "outline-sobel",
    provides: ["outline:sobel", "outline:edge-pass", "outline:normal-edge"],
    thickness: config.thickness ?? 1.25,
    edgeStrength: config.edgeStrength ?? 0.58,
    createPass() {
      return { id: "sobel-outline-pass", pass: "post", reads: ["normal", "color"], writes: ["color"], uniforms: { thickness: this.thickness, edgeStrength: this.edgeStrength } };
    }
  };
}

export default createOutlineSobelKit;
