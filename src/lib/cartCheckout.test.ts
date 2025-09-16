import { describe, it, expect } from 'vitest';

// Reproduit la fonction interne sha256 (copie locale pour test pur)
async function sha256(str: string) {
  const data = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function normalize(items: {id:string;quantity:number}[], promo?: string) {
  const sorted = [...items].sort((a,b)=> a.id.localeCompare(b.id));
  return JSON.stringify({ items: sorted, promo: promo || null });
}

describe('cart hash integrity', () => {
  it('stable for same items order-insensitive', async () => {
    const a = normalize([{id:'b',quantity:1},{id:'a',quantity:2}], 'START10');
    const b = normalize([{id:'a',quantity:2},{id:'b',quantity:1}], 'START10');
    const ha = await sha256(a);
    const hb = await sha256(b);
    expect(ha).toBe(hb);
  });

  it('changes when promo differs', async () => {
    const base = [{id:'pack-pro',quantity:1}];
    const h1 = await sha256(normalize(base,'START10'));
    const h2 = await sha256(normalize(base,'BOOST20'));
    expect(h1).not.toBe(h2);
  });

  it('changes when quantity differs', async () => {
    const h1 = await sha256(normalize([{id:'pack-pro',quantity:1}]));
    const h2 = await sha256(normalize([{id:'pack-pro',quantity:2}]));
    expect(h1).not.toBe(h2);
  });
});
