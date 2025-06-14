
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

export const useChildrenTableFilters = (children: Child[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredChildren = useMemo(() => {
    return children.filter(child => {
      const matchesSearch = child.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (child.internal_code && child.internal_code.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesGender = genderFilter === 'all' || child.gender === genderFilter;
      const matchesStatus = statusFilter === 'all' || child.parent_status === statusFilter;
      
      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [children, searchTerm, genderFilter, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    genderFilter,
    setGenderFilter,
    statusFilter,
    setStatusFilter,
    filteredChildren
  };
};
