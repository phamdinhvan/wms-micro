import {Title} from '@mantine/core';
import {ListProjects} from '../../src';

interface ProjectListPageProps {
  contextKey?: string;
  paths?: {
    create?: string;
    edit?: string;
    view?: string;
    list?: string;
    gantt?: string;
  };
}

export function ProjectListPage({contextKey, paths}: ProjectListPageProps) {
  const handleGanttProject = (projectId: string) => {
    console.log('🎯 Navigate to Gantt for project:', projectId);
    // Simulate navigation to gantt page
    const ganttUrl = `/simulation/gantt?projectId=${projectId}`;
    console.log('🔗 Gantt URL:', ganttUrl);
    // In a real app, you would use your router here
    // navigate(ganttUrl);
  };

  return (
    <div className="wms-h-full wms-grid wms-grid-rows-[auto_1fr] wms-gap-4 wms-overflow-hidden">
      <div>
        <Title order={2} mb="md">
          Project List
        </Title>
      </div>
      <div className="wms-min-h-0 wms-overflow-hidden">
        <ListProjects 
          contextKey={contextKey} 
          paths={paths}
          onGanttProject={handleGanttProject}
          showGanttButton={true}
        />
      </div>
    </div>
  );
}
