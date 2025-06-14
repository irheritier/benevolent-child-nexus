import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  UserCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { calculateAge, getGenderBadge, getParentStatusBadge } from '../utils/childUtils';

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

interface ChildrenTableRowProps {
  child: Child;
  onEdit: (child: Child) => void;
  onDelete: (childId: string) => void;
  onViewDetails: (child: Child) => void;
}

const ChildrenTableRow = ({ child, onEdit, onDelete, onViewDetails }: ChildrenTableRowProps) => {
  return (
    <TableRow key={child.id}>
      <TableCell>
        <div className="flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">{child.full_name}</span>
        </div>
      </TableCell>
      <TableCell>
        {getGenderBadge(child.gender)}
      </TableCell>
      <TableCell>
        <span className="text-sm">
          {calculateAge(child.birth_date, child.estimated_age)} ans
        </span>
      </TableCell>
      <TableCell>
        {getParentStatusBadge(child.parent_status)}
      </TableCell>
      <TableCell>
        <span className="text-sm font-mono text-muted-foreground">
          {child.internal_code || '—'}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="w-3 h-3" />
          {child.entry_date 
            ? format(new Date(child.entry_date), 'dd/MM/yyyy', { locale: fr })
            : '—'
          }
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(child)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(child)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(child.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ChildrenTableRow;
