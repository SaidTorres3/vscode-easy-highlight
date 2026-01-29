import * as assert from 'assert';
import * as vscode from 'vscode';
import * as utils from '../../utils';

suite('Utils Test Suite', () => {

    suite('generateRangeKey', () => {
        test('should generate key for same line positions', () => {
            const key = utils.generateRangeKey(
                new vscode.Position(5, 10),
                new vscode.Position(5, 20)
            );
            assert.strictEqual(key, '510520');
        });

        test('should generate key for different line positions', () => {
            const key = utils.generateRangeKey(
                new vscode.Position(0, 0),
                new vscode.Position(10, 0)
            );
            assert.strictEqual(key, '00100');
        });

        test('should generate key for positions in hundreds', () => {
            const key = utils.generateRangeKey(
                new vscode.Position(110, 15),
                new vscode.Position(110, 17)
            );
            assert.strictEqual(key, '1101511017');
        });

        test('should generate key for large line and character numbers', () => {
            const key = utils.generateRangeKey(
                new vscode.Position(1000, 500),
                new vscode.Position(2000, 600)
            );
            assert.strictEqual(key, '10005002000600');
        });

        test('should generate unique keys for different positions', () => {
            const key1 = utils.generateRangeKey(
                new vscode.Position(1, 2),
                new vscode.Position(3, 4)
            );
            const key2 = utils.generateRangeKey(
                new vscode.Position(12, 3),
                new vscode.Position(4, 0)
            );
            assert.notStrictEqual(key1, key2);
        });
    });

    suite('modifyRange', () => {
        const decoration = vscode.window.createTextEditorDecorationType({});
        
        suite('positions outside range', () => {
            test('should return original range when positions are before range', () => {
                const range = new vscode.Range(
                    new vscode.Position(50, 0),
                    new vscode.Position(60, 5)
                );
                const result = utils.modifyRange(
                    new vscode.Position(40, 0),
                    new vscode.Position(49, 1),
                    range,
                    decoration
                );
                assert.deepStrictEqual(result, { newRange1: range, newRange2: undefined });
            });

            test('should return original range when positions are after range', () => {
                const range = new vscode.Range(
                    new vscode.Position(50, 0),
                    new vscode.Position(60, 5)
                );
                const result = utils.modifyRange(
                    new vscode.Position(60, 6),
                    new vscode.Position(61, 0),
                    range,
                    decoration
                );
                assert.deepStrictEqual(result, { newRange1: range, newRange2: undefined });
            });

            test('should return original range when positions exactly at range boundaries', () => {
                const range = new vscode.Range(
                    new vscode.Position(50, 0),
                    new vscode.Position(60, 5)
                );
                // Start exactly at range start
                const result = utils.modifyRange(
                    new vscode.Position(45, 0),
                    new vscode.Position(50, 0),
                    range,
                    decoration
                );
                assert.deepStrictEqual(result, { newRange1: range, newRange2: undefined });
            });
        });

        suite('positions touching range', () => {
            test('should trim range when positions touch start', () => {
                const range = new vscode.Range(
                    new vscode.Position(50, 0),
                    new vscode.Position(60, 5)
                );
                const result = utils.modifyRange(
                    new vscode.Position(40, 0),
                    new vscode.Position(50, 1),
                    range,
                    decoration
                );
                const expectedRange = new vscode.Range(
                    new vscode.Position(50, 1),
                    new vscode.Position(60, 5)
                );
                assert.deepStrictEqual(result, { newRange1: expectedRange, newRange2: undefined });
            });

            test('should trim range when positions touch end', () => {
                const range = new vscode.Range(
                    new vscode.Position(50, 0),
                    new vscode.Position(60, 5)
                );
                const result = utils.modifyRange(
                    new vscode.Position(60, 4),
                    new vscode.Position(61, 0),
                    range,
                    decoration
                );
                const expectedRange = new vscode.Range(
                    new vscode.Position(50, 0),
                    new vscode.Position(60, 4)
                );
                assert.deepStrictEqual(result, { newRange1: expectedRange, newRange2: undefined });
            });
        });

        suite('positions inside range', () => {
            test('should split range when positions are inside', () => {
                const range = new vscode.Range(
                    new vscode.Position(50, 0),
                    new vscode.Position(60, 5)
                );
                const result = utils.modifyRange(
                    new vscode.Position(55, 0),
                    new vscode.Position(55, 10),
                    range,
                    decoration
                );
                const expectedRange1 = new vscode.Range(
                    new vscode.Position(50, 0),
                    new vscode.Position(55, 0)
                );
                const expectedRange2 = new vscode.Range(
                    new vscode.Position(55, 10),
                    new vscode.Position(60, 5)
                );
                assert.deepStrictEqual(result, { newRange1: expectedRange1, newRange2: expectedRange2 });
            });

            test('should split single-line range when positions are inside', () => {
                const range = new vscode.Range(
                    new vscode.Position(10, 0),
                    new vscode.Position(10, 50)
                );
                const result = utils.modifyRange(
                    new vscode.Position(10, 10),
                    new vscode.Position(10, 20),
                    range,
                    decoration
                );
                const expectedRange1 = new vscode.Range(
                    new vscode.Position(10, 0),
                    new vscode.Position(10, 10)
                );
                const expectedRange2 = new vscode.Range(
                    new vscode.Position(10, 20),
                    new vscode.Position(10, 50)
                );
                assert.deepStrictEqual(result, { newRange1: expectedRange1, newRange2: expectedRange2 });
            });
        });

        suite('positions encompassing range', () => {
            test('should return undefined when positions encompass entire range', () => {
                const testDecoration = vscode.window.createTextEditorDecorationType({});
                const range = new vscode.Range(
                    new vscode.Position(50, 0),
                    new vscode.Position(60, 5)
                );
                const result = utils.modifyRange(
                    new vscode.Position(40, 0),
                    new vscode.Position(70, 0),
                    range,
                    testDecoration
                );
                assert.strictEqual(result, undefined);
            });
        });

        suite('start inside, end ahead', () => {
            test('should trim to start position when start is inside and end is ahead', () => {
                const range = new vscode.Range(
                    new vscode.Position(50, 0),
                    new vscode.Position(60, 5)
                );
                const result = utils.modifyRange(
                    new vscode.Position(55, 3),
                    new vscode.Position(65, 0),
                    range,
                    decoration
                );
                const expectedRange = new vscode.Range(
                    new vscode.Position(50, 0),
                    new vscode.Position(55, 3)
                );
                assert.deepStrictEqual(result, { newRange1: expectedRange, newRange2: undefined });
            });
        });
    });

    suite('getConfigColor', () => {
        test('should return a color string', () => {
            const color = utils.getConfigColor();
            assert.ok(typeof color === 'string');
            assert.ok(color.startsWith('#'));
        });

        test('should return default color when no config is set', () => {
            const color = utils.getConfigColor();
            // Default color from utils.ts is '#fdff322f'
            assert.ok(color.length > 0);
        });
    });
});
