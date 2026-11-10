// Minimal, safe Markdown renderer (headings, lists, bold, paragraphs).
// Builds React elements directly — no raw HTML injection.

function inline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

export default function Markdown({ text }) {
  const lines = String(text ?? "").split("\n");
  const blocks = [];
  let list = null;
  let para = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join(" ") });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    let m;
    if (!trimmed) {
      flushPara();
      flushList();
    } else if ((m = trimmed.match(/^(#{1,4})\s+(.*)$/))) {
      flushPara();
      flushList();
      blocks.push({ type: m[1].length <= 2 ? "h2" : "h3", text: m[2] });
    } else if ((m = trimmed.match(/^[-*•]\s+(?:\[[ xX]\]\s+)?(.*)$/))) {
      flushPara();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(m[1]);
    } else if ((m = trimmed.match(/^\d+[.)]\s+(.*)$/))) {
      flushPara();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(m[1]);
    } else if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(trimmed);
    }
  }
  flushPara();
  flushList();

  return (
    <div className="plan-output">
      {blocks.map((b, i) => {
        if (b.type === "h2") return <h2 key={i}>{inline(b.text, i)}</h2>;
        if (b.type === "h3") return <h3 key={i}>{inline(b.text, i)}</h3>;
        if (b.type === "ul" || b.type === "ol") {
          const Tag = b.type;
          return (
            <Tag key={i}>
              {b.items.map((item, j) => (
                <li key={j}>{inline(item, `${i}-${j}`)}</li>
              ))}
            </Tag>
          );
        }
        return <p key={i}>{inline(b.text, i)}</p>;
      })}
    </div>
  );
}
