import {Task} from '@wms/core';

export const calculateNewOrderIdOfTwoStatusOrders = (
  before?: Task['sortOrder'],
  after?: Task['sortOrder'],
): number => {
  const beforeNum = Number(before);
  const afterNum = Number(after);

  const hasBefore = Number.isFinite(beforeNum);
  const hasAfter = Number.isFinite(afterNum);

  if (!hasBefore && hasAfter) return afterNum - 1;
  if (hasBefore && !hasAfter) return beforeNum + 1;
  if (!hasBefore && !hasAfter) return new Date().valueOf();
  return (beforeNum + afterNum) / 2;
};
