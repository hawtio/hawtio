/**
 * Additional type definitions for CodeMirror code
 */

/**
 * lib/codemirror/util/foldcode.js definitions
 */
 
 // move these definitions up into ../codemirror.d.ts for now so code compiles again
 /*
declare var CodeMirror: {
    tagRangeFinder: (codeMirror: CodeMirrorEditor, line: number, hideEnd: boolean) => number;
    braceRangeFinder: (codeMirror: CodeMirrorEditor, line: number, hideEnd: boolean) => number;
    indentRangeFinder: (codeMirror: CodeMirrorEditor, line: number) => number;
    newFoldFunction: (rangeFinder?:any, markText?:any, hideEnd?:any) => (codeMirror, line) => void;
}
*/

/**
 * lib/codemirror/util/formatting.js definitions
 */
interface IFormattingPosition {
    line: number;
    ch: number;
}
interface CodeMirrorEditor {
    commentRange: (isComment: boolean, from: number, to: number) => void;
    autoIndentRange: (from: IFormattingPosition, to: IFormattingPosition) => void;
    autoFormatRange: (from: IFormattingPosition, to: IFormattingPosition) => void;
}
