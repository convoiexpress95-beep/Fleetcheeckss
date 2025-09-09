// Copies the built marketplace app into public/marketplace so it can be served same-origin.
// This avoids iframe cross-origin auth issues and CSP/X-Frame-Options problems.
import fs from 'fs';
import path from 'path';

const root = process.cwd();
// Ancienne référence supprimée: dossier drive-connect-suite-main retiré
const src = path.join(root, 'dist');
const dest = path.join(root, 'public', 'marketplace');

function rimraf(p) {
  if (fs.existsSync(p)) {
    for (const entry of fs.readdirSync(p)) {
      const cur = path.join(p, entry);
      if (fs.lstatSync(cur).isDirectory()) rimraf(cur);
      else fs.unlinkSync(cur);
    }
    fs.rmdirSync(p);
  }
}

function copyDir(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from)) {
    const srcPath = path.join(from, entry);
    const destPath = path.join(to, entry);
    const stat = fs.lstatSync(srcPath);
    if (stat.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

if (!fs.existsSync(src)) {
  console.warn('[copy-marketplace] build introuvable => saut (aucun échec). Path:', src);
  process.exit(0);
}

rimraf(dest);
copyDir(src, dest);
console.log('Copied marketplace dist to', dest);
