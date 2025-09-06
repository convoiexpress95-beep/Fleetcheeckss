const fs = require('fs');
const path = require('path');

function toLF(p) {
  if (!fs.existsSync(p)) return;
  const buf = fs.readFileSync(p);
  const str = buf.toString('utf8').replace(/\r\n/g, '\n');
  fs.writeFileSync(p, str, 'utf8');
  console.log(`normalized LF: ${p}`);
}

const root = path.join(__dirname, '..');
const files = [
  path.join(root, 'android', 'gradlew'),
  path.join(root, 'android', 'build.gradle'),
  path.join(root, 'android', 'settings.gradle'),
  path.join(root, 'android', 'gradle', 'wrapper', 'gradle-wrapper.properties'),
];
files.forEach(toLF);

try {
  fs.chmodSync(path.join(root, 'android', 'gradlew'), 0o755);
  console.log('chmod +x applied to android/gradlew');
} catch (e) {
  console.warn('chmod failed (ignored):', e.message);
}
