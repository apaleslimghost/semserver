const merge = require('lodash.merge');

const registry = {};

exports.addToRegistry = ({service, version, endpoint}) => {
	merge(registry, {
		[service]: {
			[version]: endpoint,
		},
	});

	return Promise.resolve({service, version, endpoint});
};

exports.getService = service => {
	if(!registry[service]) throw new Error(`Service ${service} is not in registry`);
	return Promise.resolve(registry[service])
};

exports.resolveRegistry = ({service, version}) => exports.getService(service).then(service => {
	const versions = Object.keys(service);
	const match = semver.maxSatisfying(versions, version);
	if(!semver.validRange(version)) throw new Error(`${version} is not a valid semver range`);
	if(!match) throw new Error(`No compatible version for ${service}@${version}. Available versions: ${versions.join(', ')}`);
	return Promise.resolve(registry[service][match]);
});;
