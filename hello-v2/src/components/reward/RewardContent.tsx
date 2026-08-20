import Markdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";

/**
 * The encode-reward CLI's single-line prompt can't take real newlines, so
 * content uses literal "\n" as a line-break marker — turn those into real
 * newlines before handing off to react-markdown. `remark-breaks` then
 * treats single newlines as `<br>` instead of requiring a blank line.
 */
function normalize(text: string): string {
  return text.replace(/\\n/g, "\n");
}

const components: Components = {
  p: ({ node, ...rest }) => <p className="m-0" {...rest} />,
  code: ({ node, ...rest }) => (
    <code className="rounded bg-cream/10 px-1.5 py-0.5 font-mono text-[0.85em] text-grape" {...rest} />
  ),
  strong: ({ node, ...rest }) => <strong className="font-semibold text-cream" {...rest} />,
};

export function RewardContent({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className}>
      <Markdown remarkPlugins={[remarkBreaks]} components={components}>
        {normalize(text)}
      </Markdown>
    </div>
  );
}
