import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { calculateAge, getGenderBadge, getParentStatusBadge } from './utils/childUtils';

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

interface ChildrenCardProps {
  child: Child;
  onEdit: (child: Child) => void;
  onDelete: (childId: string) => void;
  onViewDetails: (child: Child) => void;
}

const ChildrenCard = ({ child, onEdit, onDelete, onViewDetails }: ChildrenCardProps) => {
  const age = calculateAge(child.birth_date, child.estimated_age);
  const entryDate = child.entry_date ? new Date(child.entry_date).toLocaleDateString('fr-FR') : '-';

  return (
    <Card className="relative">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{child.full_name}</h3>
            {child.internal_code && (
              <p className="text-xs text-muted-foreground mt-1">Code: {child.internal_code}</p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(child)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(child)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(child.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Genre:</span>
            <div className="mt-1">{getGenderBadge(child.gender)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Âge:</span>
            <p className="font-medium mt-1">{age ? `${age} ans` : '-'}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <span className="text-muted-foreground text-sm">Statut parental:</span>
            <div className="mt-1">{getParentStatusBadge(child.parent_status)}</div>
          </div>
          
          <div>
            <span className="text-muted-foreground text-sm">Date d'entrée:</span>
            <p className="font-medium text-sm">{entryDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildrenCard;