// Complete React DevTools disabling for RN 0.81 + React 19 compatibility
// Disable DevTools globally to prevent version conflicts
try {
  const g = globalThis || global;
  
  // 1) Block DevTools hook completely
  const HOOK = '__REACT_DEVTOOLS_GLOBAL_HOOK__';
  Object.defineProperty(g, HOOK, { 
    value: undefined, 
    writable: false, 
    configurable: false, 
    enumerable: false 
  });
  
  // 2) Disable DevTools detection
  g.__REACT_DEVTOOLS_GLOBAL_HOOK__ = undefined;
  
  // 3) Block development tools entirely
  if (typeof g.__DEV__ !== 'undefined') {
    Object.defineProperty(g, '__DEV__', { value: false, writable: false });
  }
  
  // 4) Ensure console is properly configurable
  const origConsole = g.console;
  if (origConsole) {
    ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
      try {
        const fn = origConsole[method]?.bind(origConsole) || (() => {});
        Object.defineProperty(origConsole, method, {
          value: fn,
          writable: true,
          configurable: true,
          enumerable: true
        });
      } catch {}
    });
  }
} catch {}

// Hand off to Expo's default entry
require('expo/AppEntry');
