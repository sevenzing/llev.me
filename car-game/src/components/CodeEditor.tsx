import MonacoEditor, { type OnMount } from "@monaco-editor/react";
import type { GameState } from "@/types/game";
import * as gameDeclarationRaw from "@/types/public/game.d.ts?raw";
import * as gameHelpersDeclarationRaw from "@/types/public/gameHelpers.d.ts?raw";

interface CodeEditorProps {
    userCode: string;
    handleCodeChange: (value: string | undefined) => void;
    gameState: GameState;
}

export const CodeEditor = ({userCode, handleCodeChange, gameState}: CodeEditorProps) => {
    // inside your React component
    const handleEditorMount: OnMount = (_editor, monaco) => {
        // Set compiler options (optional but recommended)
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          noEmit: true,
          strict: true,
        });

        const gameDeclaration = prepareRawDeclaration(gameDeclarationRaw.default);
        const gameHelpersDeclaration = prepareRawDeclaration(gameHelpersDeclarationRaw.default);
    
        // Inject game-specific type definitions and helper functions
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
            gameDeclaration,
          "file:///game.d.ts"
        );
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
            gameHelpersDeclaration,
          "file:///gameHelpers.d.ts"
        );
      };
  return (
    <MonacoEditor
        height="100%"
        defaultLanguage="typescript"
        theme="vs-dark"
        value={userCode}
        onChange={handleCodeChange}
        options={{
            fontSize: 16,
            minimap: { enabled: false },
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly: gameState.isRunning,
        }}
        onMount={handleEditorMount}
    />
  );
};



const BLACKLIST = [
  "export type { Context, MoveDirection };",
  "import type { Context } from '@/types/public/game';",
]

const REPLACE_MAP = {
  "export declare function": "declare function",
}

const prepareRawDeclaration = (gameDeclaration: string) => {
    const lines = gameDeclaration.split("\n");
    const filteredLines = lines.filter(lineIsRemovable).map(line => {
      for (const [pattern, replacement] of Object.entries(REPLACE_MAP)) {
        if (line.startsWith(pattern)) {
          return line.replace(pattern, replacement);
        }
      }
      return line;
    });
    return filteredLines.join("\n");
}


const lineIsRemovable = (line: string) => {
    return !BLACKLIST.some(prefix => line.startsWith(prefix));
}