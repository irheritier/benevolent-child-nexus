
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import ChildrenTableFilters from './ChildrenTableFilters';
import ChildrenTableEmptyStates from './ChildrenTableEmptyStates';
import ChildrenTableRow from './ChildrenTableRow';
import { useChildrenTableFilters } from './hooks/useChildrenTableFilters';

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

interface ChildrenTableProps {
  children: Child[];
  onEdit: (child: Child) => void;
  onDelete: (childId: string) => void;
  onViewDetails: (child: Child) => void;
}

const ChildrenTable = ({ children, onEdit, onDelete, onViewDetails }: ChildrenTableProps) => {
  const {
    searchTerm,
    setSearchTerm,
    genderFilter,
    setGenderFilter,
    statusFilter,
    setStatusFilter,
    filteredChildren
  } = useChildrenTableFilters(children);

  if (children.length === 0) {
    return <ChildrenTableEmptyStates hasChildren={false} hasFilteredResults={false} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Liste des enfants ({filteredChildren.length})
        </CardTitle>
        
        <ChildrenTableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          genderFilter={genderFilter}
          onGenderChange={setGenderFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom complet</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Âge</TableHead>
                <TableHead>Statut parental</TableHead>
                <TableHead>Code interne</TableHead>
                <TableHead>Date d'entrée</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChildren.map((child) => (
                <ChildrenTableRow
                  key={child.id}
                  child={child}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        <ChildrenTableEmptyStates 
          hasChildren={children.length > 0} 
          hasFilteredResults={filteredChildren.length > 0} 
        />
      </CardContent>
    </Card>
  );
};

export default ChildrenTable;
