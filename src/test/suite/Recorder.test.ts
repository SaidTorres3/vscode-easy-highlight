import * as assert from 'assert';
import * as vscode from 'vscode';
import { Recorder } from '../../Recorder';

suite('Recorder Test Suite', () => {
    const decoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#ff0000'
    });

    suite('constructor', () => {
        test('should create empty Recorder when no files provided', () => {
            const recorder = new Recorder();
            assert.deepStrictEqual(recorder.files, {});
        });

        test('should initialize from existing files object', () => {
            const existingFiles = {
                '/path/to/file.ts': {
                    '00100': {
                        range: [
                            { line: 0, character: 0 },
                            { line: 10, character: 0 }
                        ],
                        color: '#ff0000'
                    }
                }
            };
            const recorder = new Recorder(existingFiles);
            assert.ok(recorder.hasFile('/path/to/file.ts'));
            assert.ok(recorder.hasFileRange('/path/to/file.ts', '00100'));
        });

        test('should handle empty files object', () => {
            const recorder = new Recorder({});
            assert.deepStrictEqual(recorder.files, {});
        });
    });

    suite('hasFile', () => {
        test('should return false for non-existent file', () => {
            const recorder = new Recorder();
            assert.strictEqual(recorder.hasFile('non-existent-file'), false);
        });

        test('should return true for existing file', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            assert.strictEqual(recorder.hasFile('/path/to/file.ts'), true);
        });

        test('should return false after file is removed', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            recorder.removeFile('/path/to/file.ts');
            assert.strictEqual(recorder.hasFile('/path/to/file.ts'), false);
        });
    });

    suite('setFile', () => {
        test('should add new file to recorder', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            assert.ok(recorder.hasFile('/path/to/file.ts'));
        });

        test('should overwrite existing file', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', { old: 'data' });
            recorder.setFile('/path/to/file.ts', { new: 'data' });
            assert.deepStrictEqual(recorder.getFileRanges('/path/to/file.ts'), { new: 'data' });
        });

        test('should handle multiple files', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file1.ts', {});
            recorder.setFile('/path/to/file2.ts', {});
            assert.ok(recorder.hasFile('/path/to/file1.ts'));
            assert.ok(recorder.hasFile('/path/to/file2.ts'));
        });
    });

    suite('getFileRanges', () => {
        test('should return empty object for non-existent file', () => {
            const recorder = new Recorder();
            assert.deepStrictEqual(recorder.getFileRanges('non-existent'), {});
        });

        test('should return ranges for existing file', () => {
            const recorder = new Recorder();
            const ranges = { rangeKey: 'rangeValue' };
            recorder.setFile('/path/to/file.ts', ranges);
            assert.deepStrictEqual(recorder.getFileRanges('/path/to/file.ts'), ranges);
        });

        test('should return all ranges for file with multiple highlights', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            const range1 = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(1, 0));
            const range2 = new vscode.Range(new vscode.Position(5, 0), new vscode.Position(6, 0));
            recorder.addFileRange('/path/to/file.ts', 'key1', range1, decoration, '#ff0000');
            recorder.addFileRange('/path/to/file.ts', 'key2', range2, decoration, '#00ff00');
            
            const ranges = recorder.getFileRanges('/path/to/file.ts');
            assert.ok('key1' in ranges);
            assert.ok('key2' in ranges);
        });
    });

    suite('hasFileRange', () => {
        test('should return false for non-existent file', () => {
            const recorder = new Recorder();
            assert.strictEqual(recorder.hasFileRange('non-existent', 'range'), false);
        });

        test('should return false for non-existent range in existing file', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            assert.strictEqual(recorder.hasFileRange('/path/to/file.ts', 'non-existent'), false);
        });

        test('should return true for existing range', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(1, 0));
            recorder.addFileRange('/path/to/file.ts', 'testKey', range, decoration, '#ff0000');
            assert.strictEqual(recorder.hasFileRange('/path/to/file.ts', 'testKey'), true);
        });
    });

    suite('getFileRange', () => {
        test('should return undefined for non-existent file', () => {
            const recorder = new Recorder();
            assert.strictEqual(recorder.getFileRange('non-existent', 'range'), undefined);
        });

        test('should return undefined for non-existent range', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            assert.strictEqual(recorder.getFileRange('/path/to/file.ts', 'non-existent'), undefined);
        });

        test('should return highlight for existing range', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(1, 0));
            recorder.addFileRange('/path/to/file.ts', 'testKey', range, decoration, '#ff0000');
            
            const highlight = recorder.getFileRange('/path/to/file.ts', 'testKey');
            assert.ok(highlight);
            assert.strictEqual(highlight!.color, '#ff0000');
            assert.deepStrictEqual(highlight!.range, range);
        });
    });

    suite('addFileRange', () => {
        test('should not add range to non-existent file', () => {
            const recorder = new Recorder();
            const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(1, 0));
            recorder.addFileRange('non-existent', 'key', range, decoration, '#ff0000');
            assert.strictEqual(recorder.hasFile('non-existent'), false);
        });

        test('should add range to existing file', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(1, 0));
            recorder.addFileRange('/path/to/file.ts', 'testKey', range, decoration, '#ff0000');
            assert.ok(recorder.hasFileRange('/path/to/file.ts', 'testKey'));
        });

        test('should overwrite existing range with same key', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            const range1 = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(1, 0));
            const range2 = new vscode.Range(new vscode.Position(5, 0), new vscode.Position(6, 0));
            recorder.addFileRange('/path/to/file.ts', 'testKey', range1, decoration, '#ff0000');
            recorder.addFileRange('/path/to/file.ts', 'testKey', range2, decoration, '#00ff00');
            
            const highlight = recorder.getFileRange('/path/to/file.ts', 'testKey');
            assert.strictEqual(highlight?.color, '#00ff00');
            assert.deepStrictEqual(highlight?.range, range2);
        });

        test('should store range, decoration, and color correctly', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            const range = new vscode.Range(new vscode.Position(10, 5), new vscode.Position(20, 15));
            const testDecoration = vscode.window.createTextEditorDecorationType({
                backgroundColor: '#abcdef'
            });
            recorder.addFileRange('/path/to/file.ts', 'testKey', range, testDecoration, '#abcdef');
            
            const highlight = recorder.getFileRange('/path/to/file.ts', 'testKey');
            assert.ok(highlight);
            assert.strictEqual(highlight!.range.start.line, 10);
            assert.strictEqual(highlight!.range.start.character, 5);
            assert.strictEqual(highlight!.range.end.line, 20);
            assert.strictEqual(highlight!.range.end.character, 15);
            assert.strictEqual(highlight!.color, '#abcdef');
            assert.strictEqual(highlight!.decoration, testDecoration);
        });
    });

    suite('removeFileRange', () => {
        test('should safely handle non-existent file', () => {
            const recorder = new Recorder();
            // Should not throw
            recorder.removeFileRange('non-existent', 'range');
            assert.ok(true);
        });

        test('should safely handle non-existent range', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            // Should not throw
            recorder.removeFileRange('/path/to/file.ts', 'non-existent');
            assert.ok(true);
        });

        test('should remove existing range', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(1, 0));
            recorder.addFileRange('/path/to/file.ts', 'testKey', range, decoration, '#ff0000');
            recorder.removeFileRange('/path/to/file.ts', 'testKey');
            assert.strictEqual(recorder.hasFileRange('/path/to/file.ts', 'testKey'), false);
        });

        test('should not affect other ranges when removing one', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            const range1 = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(1, 0));
            const range2 = new vscode.Range(new vscode.Position(5, 0), new vscode.Position(6, 0));
            recorder.addFileRange('/path/to/file.ts', 'key1', range1, decoration, '#ff0000');
            recorder.addFileRange('/path/to/file.ts', 'key2', range2, decoration, '#00ff00');
            recorder.removeFileRange('/path/to/file.ts', 'key1');
            
            assert.strictEqual(recorder.hasFileRange('/path/to/file.ts', 'key1'), false);
            assert.strictEqual(recorder.hasFileRange('/path/to/file.ts', 'key2'), true);
        });
    });

    suite('removeFile', () => {
        test('should safely handle non-existent file', () => {
            const recorder = new Recorder();
            // Should not throw
            recorder.removeFile('non-existent');
            assert.ok(true);
        });

        test('should remove existing file', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            recorder.removeFile('/path/to/file.ts');
            assert.strictEqual(recorder.hasFile('/path/to/file.ts'), false);
        });

        test('should remove file and all its ranges', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file.ts', {});
            const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(1, 0));
            recorder.addFileRange('/path/to/file.ts', 'testKey', range, decoration, '#ff0000');
            recorder.removeFile('/path/to/file.ts');
            
            assert.strictEqual(recorder.hasFile('/path/to/file.ts'), false);
            assert.strictEqual(recorder.hasFileRange('/path/to/file.ts', 'testKey'), false);
        });

        test('should not affect other files when removing one', () => {
            const recorder = new Recorder();
            recorder.setFile('/path/to/file1.ts', {});
            recorder.setFile('/path/to/file2.ts', {});
            recorder.removeFile('/path/to/file1.ts');
            
            assert.strictEqual(recorder.hasFile('/path/to/file1.ts'), false);
            assert.strictEqual(recorder.hasFile('/path/to/file2.ts'), true);
        });
    });

    suite('integration scenarios', () => {
        test('should handle complete workflow of adding and removing highlights', () => {
            const recorder = new Recorder();
            
            // Add file
            recorder.setFile('/path/to/file.ts', {});
            assert.ok(recorder.hasFile('/path/to/file.ts'));
            
            // Add multiple highlights
            const range1 = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(5, 0));
            const range2 = new vscode.Range(new vscode.Position(10, 0), new vscode.Position(15, 0));
            const range3 = new vscode.Range(new vscode.Position(20, 0), new vscode.Position(25, 0));
            
            recorder.addFileRange('/path/to/file.ts', 'key1', range1, decoration, '#ff0000');
            recorder.addFileRange('/path/to/file.ts', 'key2', range2, decoration, '#00ff00');
            recorder.addFileRange('/path/to/file.ts', 'key3', range3, decoration, '#0000ff');
            
            // Verify all added
            assert.strictEqual(Object.keys(recorder.getFileRanges('/path/to/file.ts')).length, 3);
            
            // Remove one highlight
            recorder.removeFileRange('/path/to/file.ts', 'key2');
            assert.strictEqual(Object.keys(recorder.getFileRanges('/path/to/file.ts')).length, 2);
            assert.ok(!recorder.hasFileRange('/path/to/file.ts', 'key2'));
            
            // Remove entire file
            recorder.removeFile('/path/to/file.ts');
            assert.ok(!recorder.hasFile('/path/to/file.ts'));
        });

        test('should handle multiple files with highlights', () => {
            const recorder = new Recorder();
            
            // Set up multiple files
            recorder.setFile('/path/to/file1.ts', {});
            recorder.setFile('/path/to/file2.ts', {});
            
            // Add highlights to each
            const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(5, 0));
            recorder.addFileRange('/path/to/file1.ts', 'key1', range, decoration, '#ff0000');
            recorder.addFileRange('/path/to/file2.ts', 'key1', range, decoration, '#00ff00');
            
            // Verify independence
            assert.strictEqual(recorder.getFileRange('/path/to/file1.ts', 'key1')?.color, '#ff0000');
            assert.strictEqual(recorder.getFileRange('/path/to/file2.ts', 'key1')?.color, '#00ff00');
            
            // Remove from one file
            recorder.removeFileRange('/path/to/file1.ts', 'key1');
            assert.ok(!recorder.hasFileRange('/path/to/file1.ts', 'key1'));
            assert.ok(recorder.hasFileRange('/path/to/file2.ts', 'key1'));
        });
    });
});
