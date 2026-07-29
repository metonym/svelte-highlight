import { pushSealedChunk } from "../src/stream-sealed-chunks.js";

describe("pushSealedChunk", () => {
  it("appends without allocating a new array", () => {
    const chunks = ["chunk-0"];
    const result = pushSealedChunk(chunks, "chunk-1");
    expect(result).toBe(chunks);
    expect(result).toEqual(["chunk-0", "chunk-1"]);
  });

  it("keeps a single array reference across many seals", () => {
    const chunks: string[] = [];
    let ref = chunks;
    for (let i = 0; i < 1000; i++) {
      ref = pushSealedChunk(ref, `c${i}`);
      expect(ref).toBe(chunks);
    }
    expect(ref.length).toBe(1000);
    expect(ref[0]).toBe("c0");
    expect(ref[999]).toBe("c999");
  });
});
