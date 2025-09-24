// No-op stub to skip RN devtools setup that conflicts with Expo Go / Metro in RN 0.81
// Export an empty function or object depending on how it's required
function noop() {}
noop.install = noop;
noop.uninstall = noop;
module.exports = noop;
module.exports.default = noop;