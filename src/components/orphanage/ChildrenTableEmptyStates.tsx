
import { Card, CardContent } from '@/components/ui/card';
import { Users, Filter } from 'lucide-react';

interface EmptyStatesProps {
  hasChildren: boolean;
  hasFilteredResults: boolean;
  translations: any;
}

export const NoChildrenState = ({ translations }: { translations: any }) => (
  <Card>
    <CardContent className="py-8">
      <div className="text-center">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{translations.empty.noChildren}</h3>
        <p className="text-muted-foreground">
          {translations.empty.noChildrenDesc}
        </p>
      </div>
    </CardContent>
  </Card>
);

export const NoFilterResultsState = ({ translations }: { translations: any }) => (
  <div className="text-center py-8">
    <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
    <p className="text-muted-foreground">
      {translations.empty.noResults}
    </p>
  </div>
);

const ChildrenTableEmptyStates = ({ hasChildren, hasFilteredResults, translations }: EmptyStatesProps) => {
  if (!hasChildren) {
    return <NoChildrenState translations={translations} />;
  }

  if (!hasFilteredResults) {
    return <NoFilterResultsState translations={translations} />;
  }

  return null;
};

export default ChildrenTableEmptyStates;
