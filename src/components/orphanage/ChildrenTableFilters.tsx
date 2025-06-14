
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface ChildrenTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  genderFilter: string;
  onGenderChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

const ChildrenTableFilters = ({
  searchTerm,
  onSearchChange,
  genderFilter,
  onGenderChange,
  statusFilter,
  onStatusChange
}: ChildrenTableFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Rechercher par nom ou code..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={genderFilter} onValueChange={onGenderChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrer par genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les genres</SelectItem>
          <SelectItem value="M">Garçons</SelectItem>
          <SelectItem value="F">Filles</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="total_orphan">Orphelin total</SelectItem>
          <SelectItem value="partial_orphan">Orphelin partiel</SelectItem>
          <SelectItem value="abandoned">Abandonné</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChildrenTableFilters;
