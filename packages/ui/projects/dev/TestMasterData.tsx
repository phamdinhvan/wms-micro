import React from 'react';
import {Group, Stack, Text, Title} from '@mantine/core';
import {useGetUsers} from '@wms/core';

export function TestMasterData() {
  // Test useGetUsers hook
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useGetUsers({
    contextKey: 'test-context', // Optional contextKey filter
  });

  // Test another useGetUsers hook without contextKey
  const {
    data: genericData,
    isLoading: genericLoading,
    error: genericError,
  } = useGetUsers(); // No contextKey

  // Test without contextKey
  const {
    data: noContextData,
    isLoading: noContextLoading,
    error: noContextError,
  } = useGetUsers(); // No contextKey filter

  return (
    <Stack gap="lg" p="md">
      <Title order={2}>Master Data API Test</Title>

      {/* Test useGetUsers with contextKey */}
      <Stack gap="sm">
        <Title order={4}>useGetUsers (with contextKey)</Title>
        {usersLoading && <Text>Loading users...</Text>}
        {usersError && <Text c="red">Error: {usersError.message}</Text>}
        {usersData && (
          <div>
            <Text>Success: {usersData.success ? 'true' : 'false'}</Text>
            <Text>Status Code: {usersData.statusCode}</Text>
            <Text>Users Count: {usersData.data?.length || 0}</Text>
            {usersData.data?.slice(0, 3).map(user => (
              <Group key={user.id} gap="sm">
                <Text size="sm">ID: {user.id}</Text>
                <Text size="sm">Name: {user.name}</Text>
                <Text size="sm">Email: {user.email}</Text>
              </Group>
            ))}
          </div>
        )}
      </Stack>

      {/* Test useGetUsers without contextKey */}
      <Stack gap="sm">
        <Title order={4}>useGetUsers (no contextKey)</Title>
        {noContextLoading && <Text>Loading users...</Text>}
        {noContextError && <Text c="red">Error: {noContextError.message}</Text>}
        {noContextData && (
          <div>
            <Text>Success: {noContextData.success ? 'true' : 'false'}</Text>
            <Text>Status Code: {noContextData.statusCode}</Text>
            <Text>Users Count: {noContextData.data?.length || 0}</Text>
          </div>
        )}
      </Stack>

      {/* Test generic useGetMasterData */}
      <Stack gap="sm">
        <Title order={4}>useGetMasterData (generic)</Title>
        {genericLoading && <Text>Loading generic data...</Text>}
        {genericError && <Text c="red">Error: {genericError.message}</Text>}
        {genericData && (
          <div>
            <Text>Success: {genericData.success ? 'true' : 'false'}</Text>
            <Text>Status Code: {genericData.statusCode}</Text>
            <Text>Data Count: {genericData.data?.length || 0}</Text>
          </div>
        )}
      </Stack>

      {/* API URLs being called */}
      <Stack gap="sm">
        <Title order={4}>API URLs</Title>
        <Text size="sm">
          <strong>With contextKey:</strong> /external/users?contextKey=test-context
        </Text>
        <Text size="sm">
          <strong>Without contextKey:</strong> /external/users
        </Text>
      </Stack>
    </Stack>
  );
}
