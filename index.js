const express = require('express');
const semver = require('semver');
const merge = require('lodash.merge');
const bodyParser = require('body-parser');
const url = require('url');

const app = express();

const port = process.env.PORT || 7888;

const registry = {};

const addToRegistry = ({service, version, endpoint}) => {
	merge(registry, {
		[service]: {
			[version]: endpoint,
		},
	});

	return Promise.resolve({service, version, endpoint});
};

const resolveRegistry = ({service, version}) => {
	if(!registry[service]) throw new Error(`Service ${service} is not in registry`);
	const versions = Object.keys(registry[service]);
	const match = semver.maxSatisfying(versions, version);
	if(!semver.validRange(version)) throw new Error(`${version} is not a valid semver range`);
	if(!match) throw new Error(`No compatible version for ${service}@${version}. Available versions: ${versions.join(', ')}`);
	return Promise.resolve(registry[service][match]);
};

app.post('/:service/:version', bodyParser.urlencoded({extended: false}), (req, res, next) => {
	const {service, version} = req.params;
	const {endpoint} = req.body;
	addToRegistry({service, version, endpoint})
		.then(o => res.json(o))
		.catch(next);
});

app.all('/:service/:version/*', (req, res, next) => {
	const {service, version, 0: path} = req.params;

	resolveRegistry({service, version}).then(endpoint => {
		res.redirect(
			semver.valid(version) ? 308 : 307, // permanent redirect for exact version
			url.resolve(endpoint, path)
		);
	}).catch(next);
});

app.listen(port, () => console.log(`⛭ listening on port ${port}`));
