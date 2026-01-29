import * as vscode from 'vscode';
import { Recorder } from '../Recorder';

/**
 * Test helper utilities for Easy Highlight extension tests
 */

/**
 * Creates a mock TextDocumentContentChangeEvent for testing
 * @param startLine - Starting line number
 * @param startChar - Starting character position
 * @param endLine - Ending line number
 * @param endChar - Ending character position
 * @param text - The text being inserted
 * @param rangeLength - Length of the range being replaced (0 for insertions)
 * @returns A mock TextDocumentContentChangeEvent
 */
export function createMockChangeEvent(
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

/**
 * Creates a vscode Range from simple number inputs
 * @param startLine - Starting line
 * @param startChar - Starting character
 * @param endLine - Ending line
 * @param endChar - Ending character
 * @returns A vscode.Range object
 */
export function createRange(
    startLine: number,
    startChar: number,
    endLine: number,
    endChar: number
): vscode.Range {
    return new vscode.Range(
        new vscode.Position(startLine, startChar),
        new vscode.Position(endLine, endChar)
    );
}

/**
 * Creates a test decoration type
 * @param color - Background color for the decoration
 * @returns A TextEditorDecorationType
 */
export function createTestDecoration(color: string = '#ff0000'): vscode.TextEditorDecorationType {
    return vscode.window.createTextEditorDecorationType({
        backgroundColor: color
    });
}

/**
 * Creates a pre-populated Recorder for testing
 * @param filePath - The file path to initialize
 * @param highlights - Array of highlight configurations
 * @returns A configured Recorder instance
 */
export function createTestRecorder(
    filePath: string,
    highlights: Array<{
        key: string;
        startLine: number;
        startChar: number;
        endLine: number;
        endChar: number;
        color: string;
    }>
): Recorder {
    const recorder = new Recorder();
    recorder.setFile(filePath, {});
    
    for (const highlight of highlights) {
        const range = createRange(
            highlight.startLine,
            highlight.startChar,
            highlight.endLine,
            highlight.endChar
        );
        const decoration = createTestDecoration(highlight.color);
        recorder.addFileRange(filePath, highlight.key, range, decoration, highlight.color);
    }
    
    return recorder;
}

/**
 * Asserts that a range matches expected values
 * @param range - The range to check
 * @param expectedStartLine - Expected start line
 * @param expectedStartChar - Expected start character
 * @param expectedEndLine - Expected end line
 * @param expectedEndChar - Expected end character
 */
export function assertRangeEquals(
    range: vscode.Range,
    expectedStartLine: number,
    expectedStartChar: number,
    expectedEndLine: number,
    expectedEndChar: number
): void {
    if (range.start.line !== expectedStartLine) {
        throw new Error(`Expected start line ${expectedStartLine}, got ${range.start.line}`);
    }
    if (range.start.character !== expectedStartChar) {
        throw new Error(`Expected start character ${expectedStartChar}, got ${range.start.character}`);
    }
    if (range.end.line !== expectedEndLine) {
        throw new Error(`Expected end line ${expectedEndLine}, got ${range.end.line}`);
    }
    if (range.end.character !== expectedEndChar) {
        throw new Error(`Expected end character ${expectedEndChar}, got ${range.end.character}`);
    }
}

/**
 * Wait for a specified number of milliseconds
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the timeout
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets the number of highlights in a recorder for a given file
 * @param recorder - The recorder instance
 * @param filePath - The file path to check
 * @returns Number of highlights
 */
export function getHighlightCount(recorder: Recorder, filePath: string): number {
    return Object.keys(recorder.getFileRanges(filePath)).length;
}

/**
 * Default test file path used across tests
 */
export const DEFAULT_TEST_FILE_PATH = '/test/file.ts';

/**
 * Default highlight colors for testing
 */
export const TEST_COLORS = {
    RED: '#ff0000',
    GREEN: '#00ff00',
    BLUE: '#0000ff',
    YELLOW: '#ffff00',
    DEFAULT: '#fdff322f'
} as const;
