
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import ChildrenTableFilters from './ChildrenTableFilters';
import ChildrenTableEmptyStates from './ChildrenTableEmptyStates';
import ChildrenTableRow from './ChildrenTableRow';
import ChildrenTablePagination from './ChildrenTablePagination';
import ChildrenCard from './ChildrenCard';
import { useChildrenTableFilters } from './hooks/useChildrenTableFilters';
import { useChildrenPagination } from './hooks/useChildrenPagination';
import { useChildrenLoadMore } from './hooks/useChildrenLoadMore';
import { useEffect } from 'react';

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

  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedChildren,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    resetToFirstPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    totalItems
  } = useChildrenPagination(filteredChildren, 5);

  const {
    visibleChildren,
    hasMore,
    loadMore,
    resetLoadMore,
    loadedCount
  } = useChildrenLoadMore(filteredChildren, 10);

  // Reset to first page when filters change
  useEffect(() => {
    resetToFirstPage();
    resetLoadMore();
  }, [searchTerm, genderFilter, statusFilter, resetToFirstPage, resetLoadMore]);

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
        {filteredChildren.length === 0 ? (
          <ChildrenTableEmptyStates 
            hasChildren={children.length > 0} 
            hasFilteredResults={filteredChildren.length > 0} 
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
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
                    {paginatedChildren.map((child) => (
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
              
              <ChildrenTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onPageChange={goToPage}
                onPageSizeChange={changePageSize}
                onNextPage={goToNextPage}
                onPreviousPage={goToPreviousPage}
              />
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
              <div className="grid gap-3">
                {visibleChildren.map((child) => (
                  <ChildrenCard
                    key={child.id}
                    child={child}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewDetails={onViewDetails}
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={loadMore}
                    className="w-full sm:w-auto"
                  >
                    Charger plus ({loadedCount}/{filteredChildren.length})
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChildrenTable;
