import dynamic from 'next/dynamic';

module.exports = new Proxy({}, {
  get: function(obj, prop) {
    return prop === '__esModule' ? true : dynamic(
      async () => (await import('@ionic/react'))[prop],
      { ssr: false }
    );
  }
});