const { src, dest } = require('gulp');

function buildIcons() {
	return src('nodes/**/*.{png,svg}')
		.pipe(dest('dist/nodes/'));
}

function copyPipelines() {
	return src('predefinedPipelines/**/*.json')
		.pipe(dest('dist/predefinedPipelines'));
}

exports['build:icons'] = buildIcons;
exports['copy:pipelines'] = copyPipelines;