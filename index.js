const express = require('express');
const semver = require('semver');

const app = express();

const port = process.env.PORT || 7888;

app.all('/:service/:version/*', (req, res, next) => {
	const {service, version, 0: path} = req.params;

	res.json({service, version, path});
});

app.listen(port, () => console.log(`⛭ listening on port ${port}`));
