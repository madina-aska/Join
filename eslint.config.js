// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
	{
		ignores: [
			"dist/**/*",
			"node_modules/**/*",
			"tmp/**/*",
			"out-tsc/**/*",
			"bazel-out/**/*",
			".idea/**/*",
			".project",
			".classpath",
			".c9/**/*",
			"*.launch",
			".settings/**/*",
			"*.sublime-workspace",
			".history/**/*",
			".angular/cache/**/*",
			".sass-cache/**/*",
			"connect.lock",
			"coverage/**/*",
			"libpeerconnection.log",
			"testem.log",
			"typings/**/*",
			".DS_Store",
			"Thumbs.db",
			"*.md",
		],
	},
	{
		files: ["**/*.ts"],
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.recommended,
			...tseslint.configs.stylistic,
			...angular.configs.tsRecommended,
		],
		processor: angular.processInlineTemplates,
		rules: {
			"@angular-eslint/directive-selector": [
				"error",
				{
					type: "attribute",
					prefix: "app",
					style: "camelCase",
				},
			],
			"@angular-eslint/component-selector": [
				"error",
				{
					type: "element",
					prefix: "app",
					style: "kebab-case",
				},
			],
		},
	},
	{
		files: ["**/*.html"],
		extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
		rules: {},
	},
);
