import {WmsProvider} from '@wms/core';
import {useState} from 'react';
import {Table, TableColumnDef} from '../src';
const App = () => {
  const columns: TableColumnDef<string>[] = [
    {
      accessorFn: row => row,
      id: 'name',
      header: 'Name',
    },
    {
      accessorFn: row => row,
      id: 'name2',
      header: 'Name2',
    },
    {
      accessorFn: row => row,
      id: 'name3',
      header: 'Name3',
    },
    {
      accessorFn: row => row,
      id: 'name4',
      header: 'Name4',
      meta: {
        filterRenderer: ({value, setValue}) => (
          <div className="w-56">
            <div className="flex items-center gap-2">
              <input
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder="Starts with..."
                value={(value as string) ?? ''}
                onChange={e => setValue(e.currentTarget.value)}
              />
              <button
                className="rounded border px-2 py-1 text-xs"
                onClick={() => setValue(undefined)}>
                Clear
              </button>
            </div>
          </div>
        ),
      },
    },
  ];

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const data = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];

  return (
    <WmsProvider>
      <div style={{height: '100vh'}}>
        <Table
          columns={columns}
          data={data}
          pagination={{
            page,
            pageSize,
            onPageChange: setPage,
            total: data.length,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>
    </WmsProvider>
  );
};

export default App;
