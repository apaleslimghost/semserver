const got = require('got');

module.exports = registry => (service, version) => (path, options = {}) => got(
	`${registry}/${service}/${version}/${path}`,
	options
);
