const baseURL = "http://localhost:8001";

const Table = ({ headers, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td
                  key={`${index}-${header.key}`}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                    header.className || ""
                  }`}
                >
                  {header.key === "avatar" ? (
                    row.avatar ? (
                      <img
                        src={`${baseURL}${row.avatar}`}
                        alt={row.name || "avatar"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <img
                        src="/images/default-avatar.png"
                        alt="default avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )
                  ) : (
                    row[header.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
