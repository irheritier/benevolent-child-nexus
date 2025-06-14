
import { Card, CardContent } from '@/components/ui/card';
import { Users, Filter } from 'lucide-react';

interface EmptyStatesProps {
  hasChildren: boolean;
  hasFilteredResults: boolean;
}

export const NoChildrenState = () => (
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

export const NoFilterResultsState = () => (
  <div className="text-center py-8">
    <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
    <p className="text-muted-foreground">
      Aucun enfant ne correspond aux filtres sélectionnés.
    </p>
  </div>
);

const ChildrenTableEmptyStates = ({ hasChildren, hasFilteredResults }: EmptyStatesProps) => {
  if (!hasChildren) {
    return <NoChildrenState />;
  }

  if (!hasFilteredResults) {
    return <NoFilterResultsState />;
  }

  return null;
};

export default ChildrenTableEmptyStates;
