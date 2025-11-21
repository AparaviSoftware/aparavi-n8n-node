module.exports = {
	root: true,
	extends: ['eslint:recommended'],
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	rules: {
		'no-unused-vars': 'warn',
		'no-console': 'off',
	},
};
