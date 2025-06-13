
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Calendar,
  UserCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getGenderBadge = (gender: string) => {
    return (
      <Badge variant="outline" className={gender === 'M' ? 'text-blue-600 border-blue-200' : 'text-pink-600 border-pink-200'}>
        {gender === 'M' ? 'Garçon' : 'Fille'}
      </Badge>
    );
  };

  const getParentStatusText = (status: string) => {
    const statusMap = {
      'total_orphan': 'Orphelin total',
      'partial_orphan': 'Orphelin partiel',
      'abandoned': 'Abandonné'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getParentStatusBadge = (status: string) => {
    const colorMap = {
      'total_orphan': 'bg-red-100 text-red-800 border-red-200',
      'partial_orphan': 'bg-orange-100 text-orange-800 border-orange-200',
      'abandoned': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    
    return (
      <Badge className={colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'}>
        {getParentStatusText(status)}
      </Badge>
    );
  };

  const filteredChildren = children.filter(child => {
    const matchesSearch = child.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (child.internal_code && child.internal_code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGender = genderFilter === 'all' || child.gender === genderFilter;
    const matchesStatus = statusFilter === 'all' || child.parent_status === statusFilter;
    
    return matchesSearch && matchesGender && matchesStatus;
  });

  const calculateAge = (birthDate: string | null, estimatedAge: number | null) => {
    if (birthDate) {
      const today = new Date();
      const birth = new Date(birthDate);
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1;
      }
      return age;
    }
    return estimatedAge;
  };

  if (children.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun enfant enregistré</h3>
            <p className="text-muted-foreground">
              Commencez par ajouter des enfants à votre centre d'accueil.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Liste des enfants ({filteredChildren.length})
        </CardTitle>
        
        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par nom ou code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrer par genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les genres</SelectItem>
              <SelectItem value="M">Garçons</SelectItem>
              <SelectItem value="F">Filles</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredChildren.length === 0 && children.length > 0 && (
          <div className="text-center py-8">
            <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              Aucun enfant ne correspond aux filtres sélectionnés.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChildrenTable;
