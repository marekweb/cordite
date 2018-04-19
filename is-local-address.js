const ALLOWED_LOCAL_ADDRESSES = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

module.exports = function isLocalAddress(ip) {
  return ALLOWED_LOCAL_ADDRESSES.includes(ip);
}
