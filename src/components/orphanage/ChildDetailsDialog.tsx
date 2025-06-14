
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  UserCircle, 
  Calendar, 
  MapPin, 
  Hash, 
  Clock,
  User,
  Baby
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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

interface ChildDetailsDialogProps {
  child: Child | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChildDetailsDialog = ({ child, open, onOpenChange }: ChildDetailsDialogProps) => {
  if (!child) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="w-6 h-6" />
            Détails de l'enfant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                  <p className="font-medium text-lg">{child.full_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Genre</label>
                  <div className="mt-1">
                    {getGenderBadge(child.gender)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Âge</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Baby className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {calculateAge(child.birth_date, child.estimated_age)} ans
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date de naissance</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {child.birth_date 
                        ? format(new Date(child.birth_date), 'dd MMMM yyyy', { locale: fr })
                        : 'Non renseignée'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statut et codes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hash className="w-5 h-5" />
                Statut et identification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Statut parental</label>
                  <div className="mt-1">
                    {getParentStatusBadge(child.parent_status)}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Code interne</label>
                  <p className="font-mono text-sm mt-1">
                    {child.internal_code || 'Non assigné'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Dates importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date d'entrée</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {child.entry_date 
                        ? format(new Date(child.entry_date), 'dd MMMM yyyy', { locale: fr })
                        : 'Non renseignée'
                      }
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date d'enregistrement</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(new Date(child.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Durée de séjour */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Durée de séjour</CardTitle>
            </CardHeader>
            <CardContent>
              {child.entry_date ? (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Temps passé dans le centre</p>
                  <p className="text-lg font-medium">
                    {Math.floor((new Date().getTime() - new Date(child.entry_date).getTime()) / (1000 * 60 * 60 * 24))} jours
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Durée non calculable (date d'entrée manquante)</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChildDetailsDialog;
