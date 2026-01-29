import * as path from 'path';

import { runTests, downloadAndUnzipVSCode } from '@vscode/test-electron';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// Use stable version, with retry logic
		let vscodeExecutablePath: string | undefined;
		
		try {
			console.log('Downloading VS Code for testing...');
			vscodeExecutablePath = await downloadAndUnzipVSCode('stable');
			console.log('VS Code downloaded successfully');
		} catch (downloadErr) {
			console.warn('Failed to download VS Code, will try with default settings');
			console.warn(downloadErr);
		}

		// Download VS Code, unzip it and run the integration test
		await runTests({ 
			extensionDevelopmentPath, 
			extensionTestsPath,
			vscodeExecutablePath,
			launchArgs: [
				'--disable-extensions', // Disable other extensions to speed up tests
				'--disable-gpu' // Disable GPU for headless environments
			]
		});
	} catch (err) {
		console.error('Failed to run tests');
		console.error(err);
		process.exit(1);
	}
}

main();
