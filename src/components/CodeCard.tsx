import { h, Fragment } from '../jsx';

interface CodeCardProps {
  file: string;
  variable: string;
  fields: [string, string][];
}

export function CodeCard({ file, variable, fields }: CodeCardProps): Node {
  return (
    <figure class="code-card">
      <figcaption class="code-head">
        <span class="code-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>{file}</span>
      </figcaption>
      <pre><code>
        <span class="tok-kw">const</span> <span class="tok-var">{variable}</span> = {'{\n'}
        {fields.map(([key, value]) => (
          <>{'  '}<span class="tok-prop">{key}</span>: <span class="tok-str">"{value}"</span>{',\n'}</>
        ))}
        {'};'}
      </code></pre>
    </figure>
  );
}
