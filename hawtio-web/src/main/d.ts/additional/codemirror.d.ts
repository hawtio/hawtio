/**
 * Additional type definitions for CodeMirror code
 */

/**
 * lib/codemirror/util/foldcode.js definitions
 */
declare var CodeMirror: {
    tagRangeFinder: (codeMirror: CodeMirrorEditor, line: number, hideEnd: bool) => number;
    braceRangeFinder: (codeMirror: CodeMirrorEditor, line: number, hideEnd: bool) => number;
    indentRangeFinder: (codeMirror: CodeMirrorEditor, line: number) => number;
    newFoldFunction: (rangeFinder?:any, markText?:any, hideEnd?:any) => (codeMirror, line) => void;
}

/**
 * lib/codemirror/util/formatting.js definitions
 */
interface IFormattingPosition {
    line: number;
    ch: number;
}
interface CodeMirrorEditor {
    commentRange: (isComment: bool, from: number, to: number) => void;
    autoIndentRange: (from: IFormattingPosition, to: IFormattingPosition) => void;
    autoFormatRange: (from: IFormattingPosition, to: IFormattingPosition) => void;
}