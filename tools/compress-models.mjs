// Builds compact viewer meshes from the STL files: models/<name>.stl -> models/view/<name>.mesh.gz
// Run from the repo root:  node tools/compress-models.mjs
//
// Format (little-endian, then gzipped):
//   'NMSH' | u32 vertexCount | u32 triangleCount | f32 min[3] | f32 max[3]
//   u16 positions[vertexCount*3]  (quantised within min..max)
//   pad to 4 bytes
//   i32 indexDeltas[triangleCount*3]  (index[i] - index[i-1])
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { gzipSync, constants } from 'node:zlib';

const dir = 'models', out = join(dir, 'view');
mkdirSync(out, { recursive: true });

for (const f of readdirSync(dir).filter(f => f.endsWith('.stl'))) {
  const buf = readFileSync(join(dir, f));
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const triCount = dv.getUint32(80, true);
  if (84 + 50 * triCount !== buf.length) throw new Error(`${f}: not a binary STL`);

  // Merge identical vertices, numbering them in first-use order.
  const ids = new Map(), verts = [], index = new Uint32Array(triCount * 3);
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let t = 0; t < triCount; t++) {
    for (let k = 0; k < 3; k++) {
      const o = 84 + t * 50 + 12 + k * 12;
      const key = buf.toString('latin1', o, o + 12);
      let id = ids.get(key);
      if (id === undefined) {
        id = verts.length / 3;
        ids.set(key, id);
        for (let a = 0; a < 3; a++) {
          const v = dv.getFloat32(o + a * 4, true);
          verts.push(v);
          if (v < min[a]) min[a] = v;
          if (v > max[a]) max[a] = v;
        }
      }
      index[t * 3 + k] = id;
    }
  }
  const vCount = verts.length / 3;

  const posBytes = vCount * 6, pad = (4 - ((36 + posBytes) % 4)) % 4;
  const raw = Buffer.alloc(36 + posBytes + pad + triCount * 12);
  raw.write('NMSH', 0, 'latin1');
  raw.writeUInt32LE(vCount, 4);
  raw.writeUInt32LE(triCount, 8);
  for (let a = 0; a < 3; a++) {
    raw.writeFloatLE(min[a], 12 + a * 4);
    raw.writeFloatLE(max[a], 24 + a * 4);
  }
  for (let i = 0; i < verts.length; i++) {
    const a = i % 3, span = max[a] - min[a] || 1;
    raw.writeUInt16LE(Math.round((verts[i] - min[a]) / span * 65535), 36 + i * 2);
  }
  let o = 36 + posBytes + pad, prev = 0;
  for (const id of index) { raw.writeInt32LE(id - prev, o); o += 4; prev = id; }

  const gz = gzipSync(raw, { level: constants.Z_BEST_COMPRESSION });
  const name = basename(f, '.stl');
  writeFileSync(join(out, `${name}.mesh.gz`), gz);
  console.log(`${name.padEnd(26)} ${(buf.length / 1048576).toFixed(1).padStart(5)} MB -> ${(gz.length / 1048576).toFixed(2)} MB  (${vCount} verts, ${triCount} tris)`);
}
