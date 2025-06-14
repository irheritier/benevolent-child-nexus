
export const getParentStatusText = (status: string) => {
  const statusMap = {
    'total_orphan': 'Orphelin total',
    'partial_orphan': 'Orphelin partiel',
    'abandoned': 'Abandonné'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};
