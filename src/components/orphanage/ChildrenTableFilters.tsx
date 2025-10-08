
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
  translations: any;
}

const ChildrenTableFilters = ({
  searchTerm,
  onSearchChange,
  genderFilter,
  onGenderChange,
  statusFilter,
  onStatusChange,
  translations
}: ChildrenTableFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={translations.filters.search}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={genderFilter} onValueChange={onGenderChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={translations.filters.gender.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{translations.filters.gender.all}</SelectItem>
          <SelectItem value="M">{translations.filters.gender.boy}</SelectItem>
          <SelectItem value="F">{translations.filters.gender.girl}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder={translations.filters.status.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{translations.filters.status.all}</SelectItem>
          <SelectItem value="total_orphan">{translations.filters.status.total_orphan}</SelectItem>
          <SelectItem value="partial_orphan">{translations.filters.status.partial_orphan}</SelectItem>
          <SelectItem value="abandoned">{translations.filters.status.abandoned}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChildrenTableFilters;
