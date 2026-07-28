export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.last_page <= 1) return null;

  const { current_page, last_page, total, per_page } = pagination;
  const from = (current_page - 1) * per_page + 1;
  const to   = Math.min(current_page * per_page, total);

  const pages = [];
  const range = 2;
  for (let i = Math.max(1, current_page - range); i <= Math.min(last_page, current_page + range); i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, flexWrap: 'wrap', gap: 12 }}>
      <span style={{ fontSize: 13, color: 'var(--navy-400)' }}>
        Mostrando {from}–{to} de {total} registros
      </span>
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
        >←</button>

        {pages[0] > 1 && (
          <>
            <button className="pagination-btn" onClick={() => onPageChange(1)}>1</button>
            {pages[0] > 2 && <span style={{ color: 'var(--navy-500)', padding: '0 4px' }}>…</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            className={`pagination-btn ${p === current_page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >{p}</button>
        ))}

        {pages[pages.length - 1] < last_page && (
          <>
            {pages[pages.length - 1] < last_page - 1 && <span style={{ color: 'var(--navy-500)', padding: '0 4px' }}>…</span>}
            <button className="pagination-btn" onClick={() => onPageChange(last_page)}>{last_page}</button>
          </>
        )}

        <button
          className="pagination-btn"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
        >→</button>
      </div>
    </div>
  );
}
