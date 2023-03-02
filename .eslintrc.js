module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
		ecmaVersion: 2022,
	},
	plugins: ['@typescript-eslint/eslint-plugin', 'security'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:security/recommended',
		'plugin:prettier/recommended',
	],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: ['.eslintrc.js'],
	rules: {
		'prettier/prettier': 'error',
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'no-unused-vars': ['warn', { argsIgnorePattern: '_{0,}|opts' }],
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{ argsIgnorePattern: '_{0,}|opts|options' },
		],
		'sort-imports': [
			'warn',
			{
				ignoreDeclarationSort: true,
				ignoreCase: true,
			},
		],
		'@typescript-eslint/require-await': 'warn',
		'@typescript-eslint/no-misused-promises': [
			'error',
			{
				checksVoidReturn: false,
			},
		],
	},
};
