export default function DataTable({ columns = [], data = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-4 py-3 font-medium">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                className="px-4 py-8 text-center text-slate-500"
                colSpan={columns.length}
              >
                No data
              </td>
            </tr>
          )}
          {data.map((row, idx) => (
            <tr key={idx} className="border-t">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
