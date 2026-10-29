import { useId, useLayoutEffect, useRef, useState } from 'react';
import { MathView } from '../ui';
import { Modal } from '../Modal';

function SymbolButton({
  symbol,
  definition,
  descriptionId,
  onSelect,
}: {
  symbol: string;
  definition: string;
  descriptionId: string;
  onSelect: () => void;
}) {
  const rendered = useRef<HTMLSpanElement>(null);
  const [label, setLabel] = useState(symbol);
  useLayoutEffect(() => {
    // KaTeX's visual text is hidden from accessibility APIs. Include that exact text
    // in the button name so voice input and screen readers can identify the same symbol.
    setLabel(rendered.current?.querySelector('.katex-html')?.textContent || symbol);
  }, [symbol]);
  return (
    <button
      className="symbol-trigger"
      title={definition}
      aria-label={label + '. Explain symbol'}
      aria-describedby={descriptionId}
      onClick={onSelect}
    >
      <span ref={rendered}>
        <MathView inline math={symbol} />
      </span>
    </button>
  );
}
export function SymbolDefinitions({ symbols }: { symbols: [string, string][] }) {
  const definitionId = useId();
  const [selected, setSelected] = useState<[string, string] | null>(null);
  return (
    <>
      <dl className="symbol-list">
        {symbols.map(([symbol, definition], index) => (
          <div key={symbol}>
            <dt>
              <SymbolButton
                symbol={symbol}
                definition={definition}
                descriptionId={definitionId + index}
                onSelect={() => setSelected([symbol, definition])}
              />
            </dt>
            <dd id={definitionId + index}>{definition}</dd>
          </div>
        ))}
      </dl>
      {selected && (
        <Modal title="Read the symbol" onClose={() => setSelected(null)}>
          <div className="symbol-explanation">
            <MathView math={selected[0]} />
            <p>{selected[1]}</p>
            <p className="small-note">
              The same symbol has the same meaning in this lesson's equations and calculations.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
