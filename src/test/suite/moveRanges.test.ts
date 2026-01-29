import * as assert from 'assert';
import * as vscode from 'vscode';
import * as utils from '../../utils';
import { Recorder } from '../../Recorder';

/**
 * Test suite for the moveRanges function in utils.ts
 * This function handles updating highlight positions when text changes occur
 */
suite('moveRanges Test Suite', () => {
    let recorder: Recorder;
    const testFilePath = '/test/file.ts';
    const decoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: '#ff0000'
    });

    setup(() => {
        // Fresh recorder for each test
        recorder = new Recorder();
        recorder.setFile(testFilePath, {});
    });

    /**
     * Helper to create a mock TextDocumentContentChangeEvent
     */
    function createChangeEvent(
        startLine: number,
        startChar: number,
        endLine: number,
        endChar: number,
        text: string,
        rangeLength: number = 0
    ): vscode.TextDocumentContentChangeEvent {
        return {
            range: new vscode.Range(
                new vscode.Position(startLine, startChar),
                new vscode.Position(endLine, endChar)
            ),
            rangeOffset: 0,
            rangeLength: rangeLength,
            text: text
        };
    }

    suite('changes above highlight', () => {
        test('should not modify highlight when change is above it', () => {
            // Highlight at lines 50-60
            const range = new vscode.Range(
                new vscode.Position(50, 0),
                new vscode.Position(60, 10)
            );
            recorder.addFileRange(testFilePath, 'key1', range, decoration, '#ff0000');
            
            // Change at line 10 (above highlight)
            const changeEvent = createChangeEvent(10, 0, 10, 5, 'hello', 5);
            utils.moveRanges(changeEvent, testFilePath, recorder);
            
            const highlight = recorder.getFileRange(testFilePath, 'key1');
            assert.ok(highlight);
            assert.strictEqual(highlight!.range.start.line, 50);
            assert.strictEqual(highlight!.range.end.line, 60);
        });
    });

    suite('inserting new lines below highlight', () => {
        test('should move highlight down when new lines inserted before it', () => {
            // Highlight at lines 10-15
            const range = new vscode.Range(
                new vscode.Position(10, 5),
                new vscode.Position(15, 10)
            );
            const rangeKey = utils.generateRangeKey(range.start, range.end);
            recorder.addFileRange(testFilePath, rangeKey, range, decoration, '#ff0000');
            
            // Insert 2 new lines at line 5 (before highlight)
            const changeEvent = createChangeEvent(5, 0, 5, 0, '\n\n', 0);
            utils.moveRanges(changeEvent, testFilePath, recorder);
            
            // Highlight should have moved down by 2 lines
            const ranges = recorder.getFileRanges(testFilePath);
            const keys = Object.keys(ranges);
            assert.strictEqual(keys.length, 1);
            
            const movedHighlight = ranges[keys[0]];
            assert.strictEqual(movedHighlight.range.start.line, 12);
            assert.strictEqual(movedHighlight.range.end.line, 17);
        });

        test('should move highlight up when lines deleted before it', () => {
            // Highlight at lines 20-25
            const range = new vscode.Range(
                new vscode.Position(20, 5),
                new vscode.Position(25, 10)
            );
            const rangeKey = utils.generateRangeKey(range.start, range.end);
            recorder.addFileRange(testFilePath, rangeKey, range, decoration, '#ff0000');
            
            // Delete 2 lines at lines 10-12 (before highlight)
            const changeEvent = createChangeEvent(10, 0, 12, 0, '', 20);
            utils.moveRanges(changeEvent, testFilePath, recorder);
            
            // Highlight should have moved up by 2 lines
            const ranges = recorder.getFileRanges(testFilePath);
            const keys = Object.keys(ranges);
            assert.strictEqual(keys.length, 1);
            
            const movedHighlight = ranges[keys[0]];
            assert.strictEqual(movedHighlight.range.start.line, 18);
            assert.strictEqual(movedHighlight.range.end.line, 23);
        });
    });

    suite('changes on same line as highlight', () => {
        test('should bump highlight when text added before it on same line', () => {
            // Single line highlight at line 10, characters 20-30
            const range = new vscode.Range(
                new vscode.Position(10, 20),
                new vscode.Position(10, 30)
            );
            const rangeKey = utils.generateRangeKey(range.start, range.end);
            recorder.addFileRange(testFilePath, rangeKey, range, decoration, '#ff0000');
            
            // Insert 5 characters at the beginning of line 10
            const changeEvent = createChangeEvent(10, 0, 10, 0, 'hello', 0);
            utils.moveRanges(changeEvent, testFilePath, recorder);
            
            // Highlight should shift right by 5 characters
            const ranges = recorder.getFileRanges(testFilePath);
            const keys = Object.keys(ranges);
            assert.strictEqual(keys.length, 1);
            
            const movedHighlight = ranges[keys[0]];
            assert.strictEqual(movedHighlight.range.start.character, 25);
            assert.strictEqual(movedHighlight.range.end.character, 35);
        });
    });

    suite('changes within single-line highlight', () => {
        test('should expand highlight when text added inside it', () => {
            // Single line highlight at line 10, characters 10-20
            const range = new vscode.Range(
                new vscode.Position(10, 10),
                new vscode.Position(10, 20)
            );
            const rangeKey = utils.generateRangeKey(range.start, range.end);
            recorder.addFileRange(testFilePath, rangeKey, range, decoration, '#ff0000');
            
            // Insert 3 characters inside the highlight (at character 15)
            const changeEvent = createChangeEvent(10, 15, 10, 15, 'abc', 0);
            utils.moveRanges(changeEvent, testFilePath, recorder);
            
            // Highlight should expand by 3 characters
            const ranges = recorder.getFileRanges(testFilePath);
            const keys = Object.keys(ranges);
            assert.strictEqual(keys.length, 1);
            
            const movedHighlight = ranges[keys[0]];
            assert.strictEqual(movedHighlight.range.start.character, 10);
            assert.strictEqual(movedHighlight.range.end.character, 23);
        });
    });

    suite('changes within multi-line highlight', () => {
        test('should adjust end line when new line added in middle of highlight', () => {
            // Multi-line highlight from line 10 to line 20
            const range = new vscode.Range(
                new vscode.Position(10, 0),
                new vscode.Position(20, 10)
            );
            const rangeKey = utils.generateRangeKey(range.start, range.end);
            recorder.addFileRange(testFilePath, rangeKey, range, decoration, '#ff0000');
            
            // Insert new line in middle of highlight (at line 15)
            const changeEvent = createChangeEvent(15, 0, 15, 0, '\n', 0);
            utils.moveRanges(changeEvent, testFilePath, recorder);
            
            // Highlight end should move down by 1
            const ranges = recorder.getFileRanges(testFilePath);
            const keys = Object.keys(ranges);
            assert.strictEqual(keys.length, 1);
            
            const movedHighlight = ranges[keys[0]];
            assert.strictEqual(movedHighlight.range.start.line, 10);
            assert.strictEqual(movedHighlight.range.end.line, 21);
        });
    });

    suite('edge cases', () => {
        test('should handle empty file path gracefully', () => {
            const changeEvent = createChangeEvent(0, 0, 0, 0, 'test', 0);
            // Should not throw
            utils.moveRanges(changeEvent, 'non-existent-file', recorder);
            assert.ok(true);
        });

        test('should handle file with no highlights', () => {
            recorder.setFile('/empty/file.ts', {});
            const changeEvent = createChangeEvent(0, 0, 0, 0, 'test', 0);
            // Should not throw
            utils.moveRanges(changeEvent, '/empty/file.ts', recorder);
            assert.ok(true);
        });

        test('should preserve highlight color when moving', () => {
            const customColor = '#abcdef';
            const range = new vscode.Range(
                new vscode.Position(10, 0),
                new vscode.Position(15, 0)
            );
            const rangeKey = utils.generateRangeKey(range.start, range.end);
            recorder.addFileRange(testFilePath, rangeKey, range, decoration, customColor);
            
            // Insert new line before highlight
            const changeEvent = createChangeEvent(5, 0, 5, 0, '\n', 0);
            utils.moveRanges(changeEvent, testFilePath, recorder);
            
            // Check color is preserved
            const ranges = recorder.getFileRanges(testFilePath);
            const keys = Object.keys(ranges);
            const movedHighlight = ranges[keys[0]];
            assert.strictEqual(movedHighlight.color, customColor);
        });

        test('should handle multiple highlights when making changes', () => {
            // Add multiple highlights
            const range1 = new vscode.Range(
                new vscode.Position(10, 0),
                new vscode.Position(15, 0)
            );
            const range2 = new vscode.Range(
                new vscode.Position(30, 0),
                new vscode.Position(35, 0)
            );
            const range3 = new vscode.Range(
                new vscode.Position(50, 0),
                new vscode.Position(55, 0)
            );
            
            recorder.addFileRange(testFilePath, 'key1', range1, decoration, '#ff0000');
            recorder.addFileRange(testFilePath, 'key2', range2, decoration, '#00ff00');
            recorder.addFileRange(testFilePath, 'key3', range3, decoration, '#0000ff');
            
            // Insert new lines at line 20 (between first and second highlight)
            const changeEvent = createChangeEvent(20, 0, 20, 0, '\n\n\n', 0);
            utils.moveRanges(changeEvent, testFilePath, recorder);
            
            // First highlight should be unchanged, others should move down
            const ranges = recorder.getFileRanges(testFilePath);
            const highlights = Object.values(ranges);
            
            // We should still have 3 highlights
            assert.strictEqual(highlights.length, 3);
            
            // Find highlights by color to verify correct movement
            const redHighlight = highlights.find(h => h.color === '#ff0000');
            const greenHighlight = highlights.find(h => h.color === '#00ff00');
            const blueHighlight = highlights.find(h => h.color === '#0000ff');
            
            assert.ok(redHighlight);
            assert.ok(greenHighlight);
            assert.ok(blueHighlight);
            
            // Red should be unchanged (before the change)
            assert.strictEqual(redHighlight!.range.start.line, 10);
            
            // Green and blue should have moved down by 3 lines
            assert.strictEqual(greenHighlight!.range.start.line, 33);
            assert.strictEqual(blueHighlight!.range.start.line, 53);
        });
    });
});
