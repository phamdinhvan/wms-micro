'use client';
import {DateUtils, Task, WmsProvider} from '@wms/core';
import type {TableColumnDef} from '@wms/table';
import {Table} from '@wms/table';
import {useState} from 'react';

export function List() {
  const columns: TableColumnDef<Task>[] = [
    {
      id: 'key',
      header: 'Key',
      accessorFn: row => row.key,
      meta: {sticky: true, width: 200},
      size: 200,
      minSize: 200,
    },
    {
      id: 'name',
      header: 'Name',
      accessorFn: row => row.name,
      size: 300,
      minSize: 300,
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: row => row.status,
      meta: {
        filterRenderer: ({value, setValue}) => (
          <input
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        ),
      },
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorFn: row => row.priority,
    },
    {
      id: 'assignee',
      header: 'Assignee',
      accessorFn: row => row.assignee?.email ?? '-',
    },
    {
      id: 'progress',
      header: 'Progress',
      accessorFn: row => row.progress,
      cell: row => (
        <p className="wms-text-right">{row.getValue() as string}%</p>
      ),
    },
    {
      id: 'startDate',
      header: 'Start',
      accessorFn: row => row.startDate,
      size: 120,
      minSize: 120,
    },
    {
      id: 'endDate',
      header: 'End',
      accessorFn: row => row.endDate,
      size: 120,
      minSize: 120,
    },
  ];

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Generate mock tasks
  const mkDate = (d: Date) => DateUtils.formatDate(d);
  const today = new Date();
  const priorities: Array<string> = ['low', 'medium', 'high'];
  const statuses = ['Backlog', 'In Progress', 'Review', 'Done'];

  const data: Task[] = Array.from({length: 1000}).map((_, i) => {
    const start = new Date(today);
    start.setDate(today.getDate() - (i % 10));
    const end = new Date(start);
    end.setDate(start.getDate() + 5 + (i % 7));
    const progress = (i * 7) % 101;
    const item: Task = {
      id: `TASK-${i + 1}`,
      sortOrder: i + 1,
      projectId: 'PRJ-1',
      projectKey: 'PRJ',
      projectName: 'Demo Project',
      projectIcon: null,
      parentId: null,
      key: `PRJ-${i + 1}`,
      name: `Implement feature #${i + 1}`,
      workDays: 5 + (i % 3),
      status: statuses[i % statuses.length],
      assignee:
        i % 4 === 0 ? null : {id: `user-${i}`, email: `user${i}@example.com`},
      reporter: {id: `reporter-${i}`, email: `reporter${i}@example.com`},
      progress,
      priority: priorities[i % priorities.length],
      timeTracking: {
        originalEstimate: `${(i % 5) + 1}d`,
        remainingEstimate: `${(i % 3) + 1}d`,
        timeSpent: `${i % 8}h`,
      },
      description: 'Mock task for list view.',
      created: mkDate(new Date(today.getTime() - i * 86400000)),
      updated: mkDate(new Date(today.getTime() - (i % 5) * 86400000)),
      resolution: null,
      startDate: mkDate(start),
      endDate: mkDate(end),
    };
    return item;
  });
  return (
    <WmsProvider>
      <div className="wms-p-8">
        <Table
          columns={columns}
          data={data.slice((page - 1) * pageSize, page * pageSize)}
          pagination={{
            page,
            pageSize,
            onPageChange: setPage,
            total: data.length,
            onPageSizeChange: setPageSize,
          }}
          defaultColumnMinSize={40}
        />
      </div>
    </WmsProvider>
  );
}
