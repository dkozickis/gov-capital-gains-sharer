import { useRef, useState } from 'react';
import { Transaction } from '@i-just-got-paid/etrade-to-eds';

const dateFormatter = new Intl.DateTimeFormat('lv-LV', {
  dateStyle: 'short',
});

const focusClasses =
  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';

const ResultTable = ({ transactions }: { transactions: Transaction[] }) => (
  <table className="table-fixed mt-8 text-right">
    <thead>
      <tr className="text-xs">
        <th className="w-28 p-2 pb-0">(1) Ienākuma gūšanas diena</th>
        <th className="w-32 p-2 pb-0">
          (3) Ieņēmumi no kapitāla aktīva atsavināšanas
        </th>
        <th className="w-28 p-2 pb-0">(4) Saņemtā ieņēmumu daļa</th>
        <th className="w-32 p-2 pb-0">
          (5) Izdevumi, kas saistīti ar kapitāla aktīva iegādi
        </th>
      </tr>
    </thead>
    <tbody>
      {transactions.map(
        ({ dateSold, dateAcquired, costBasis, totalProceeds }, index) => (
          <tr key={`${dateAcquired}-${dateSold}-${index}`}>
            <td className="p-2 border-b font-mono">
              {dateFormatter.format(new Date(dateSold))}
            </td>
            <td className="p-2 border-b font-mono">{totalProceeds}</td>
            <td className="p-2 border-b font-mono">{totalProceeds}</td>
            <td className="p-2 border-b font-mono">{costBasis}</td>
          </tr>
        )
      )}
    </tbody>
  </table>
);

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Transaction[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex justify-center items-center h-screen flex-col">
      <form
        method="post"
        action="/api/process"
        encType="multipart/form-data"
        className="w-96"
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);

          const body = new FormData(event.currentTarget);
          body.append('file', fileInputRef.current.files[0]);

          fetch('/api/process', {
            method: 'POST',
            body,
          })
            .then(async (response) => {
              const result: Transaction[] = await response.json();
              setResult(result);
            })
            .catch(() => alert('Something went wrong :shrug:'))
            .finally(() => {
              setLoading(false);
            });
        }}
      >
        <label
          htmlFor="file"
          className="inline-block mb-2 text-xl font-medium text-gray-700"
        >
          Drop your ETrade export here
        </label>
        <input
          className={[
            `block w-full px-2 py-1.5 text-xl text-gray-700`,
            `border-8 border-solid border-orange-500 rounded-xl`,
            'hover:border-orange-600',
            focusClasses,
            'mb-2',
          ].join(' ')}
          id="file"
          type="file"
          accept=".xlsx"
          required={true}
          ref={fileInputRef}
        />
        <button
          type="submit"
          className={[
            'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500',
            'hover:bg-orange-600',
            focusClasses,
            'disabled:bg-pgray-500',
          ].join(' ')}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Process'}
        </button>
      </form>

      {result ? <ResultTable transactions={result} /> : null}
    </div>
  );
};

export default Index;
