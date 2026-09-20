import "./evidencechain.css";

export interface EvidenceChainNode {
  label: string;
  detail?: string;
  present: boolean;
}

/** Citizen Reports -> Civic Issue -> Priority/Exposure -> MPLADS Work ->
 * Verification Signal. Every node is always rendered (an absent match or
 * signal is real information, not something to hide) but visually marked
 * present/absent so the chain reads honestly at a glance. */
export function EvidenceChain({ nodes }: { nodes: EvidenceChainNode[] }) {
  return (
    <ol className="evidence-chain">
      {nodes.map((node, i) => (
        <li key={i} className={`evidence-chain__node ${node.present ? "" : "evidence-chain__node--absent"}`}>
          <span className="evidence-chain__rail" aria-hidden="true">
            <span className="evidence-chain__dot" />
            {i < nodes.length - 1 && <span className="evidence-chain__line" />}
          </span>
          <span className="evidence-chain__body">
            <span className="evidence-chain__label">{node.label}</span>
            {node.detail && <span className="evidence-chain__detail">{node.detail}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
