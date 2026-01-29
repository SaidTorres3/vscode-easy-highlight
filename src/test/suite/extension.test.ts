import * as assert from 'assert';
import * as vscode from 'vscode';

/**
 * Extension Integration Test Suite
 * Tests the extension activation and command registration
 */
suite('Extension Integration Test Suite', () => {
	vscode.window.showInformationMessage('Start Extension Integration Tests.');

	suite('Extension Activation', () => {
		test('Extension should be present', () => {
			const extension = vscode.extensions.getExtension('BrandonBlaschke.easy-highlight');
			assert.ok(extension, 'Extension should be available');
		});

		test('Extension should activate', async () => {
			const extension = vscode.extensions.getExtension('BrandonBlaschke.easy-highlight');
			if (extension) {
				await extension.activate();
				assert.ok(extension.isActive, 'Extension should be active');
			}
		});
	});

	suite('Command Registration', () => {
		test('Highlight command should be registered', async () => {
			const commands = await vscode.commands.getCommands(true);
			assert.ok(
				commands.includes('easy-highlight.Highlight'),
				'Highlight command should be registered'
			);
		});

		test('Highlight Color command should be registered', async () => {
			const commands = await vscode.commands.getCommands(true);
			assert.ok(
				commands.includes('easy-highlight.HighlightColor'),
				'Highlight Color command should be registered'
			);
		});

		test('Remove Highlight command should be registered', async () => {
			const commands = await vscode.commands.getCommands(true);
			assert.ok(
				commands.includes('easy-highlight.RemoveHighlight'),
				'Remove Highlight command should be registered'
			);
		});

		test('Remove All Highlights command should be registered', async () => {
			const commands = await vscode.commands.getCommands(true);
			assert.ok(
				commands.includes('easy-highlight.RemoveAllHighlights'),
				'Remove All Highlights command should be registered'
			);
		});
	});

	suite('Configuration', () => {
		test('Configuration section should exist', () => {
			const config = vscode.workspace.getConfiguration('easy-highlight');
			assert.ok(config, 'Configuration section should exist');
		});

		test('highlightColor setting should have default value', () => {
			const config = vscode.workspace.getConfiguration('easy-highlight');
			const highlightColor = config.get<string>('highlightColor');
			assert.ok(highlightColor, 'highlightColor setting should have a value');
			assert.ok(
				highlightColor?.startsWith('#'),
				'highlightColor should be a hex color'
			);
		});

		test('Default color should be valid hex', () => {
			const config = vscode.workspace.getConfiguration('easy-highlight');
			const highlightColor = config.get<string>('highlightColor');
			// Default is #fdff322f
			const hexRegex = /^#[0-9A-Fa-f]{6,8}$/;
			assert.ok(
				hexRegex.test(highlightColor || ''),
				`highlightColor "${highlightColor}" should be a valid hex color`
			);
		});
	});
});