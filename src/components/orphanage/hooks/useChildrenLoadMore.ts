import { useState, useMemo } from 'react';

interface Child {
  id: string;
  full_name: string;
  gender: string;
  birth_date: string | null;
  estimated_age: number | null;
  entry_date: string | null;
  parent_status: string;
  internal_code: string | null;
  created_at: string;
}

export const useChildrenLoadMore = (children: Child[], itemsPerLoad: number = 10) => {
  const [loadedCount, setLoadedCount] = useState(itemsPerLoad);

  const visibleChildren = useMemo(() => {
    return children.slice(0, loadedCount);
  }, [children, loadedCount]);

  const hasMore = children.length > loadedCount;

  const loadMore = () => {
    setLoadedCount(prev => Math.min(prev + itemsPerLoad, children.length));
  };

  const resetLoadMore = () => {
    setLoadedCount(itemsPerLoad);
  };

  return {
    visibleChildren,
    hasMore,
    loadMore,
    resetLoadMore,
    totalItems: children.length,
    loadedCount
  };
};