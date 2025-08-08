
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scale, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NutritionRecord {
  id: string;
  date: string;
  weight_kg: number;
  height_cm: number;
  bmi: number;
  nutrition_status: string;
  created_at: string;
}

interface NutritionHistoryProps {
  childId: string;
  childName: string;
  onAddRecord: () => void;
}

const NutritionHistory = ({ childId, childName, onAddRecord }: NutritionHistoryProps) => {
  const [records, setRecords] = useState<NutritionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNutritionRecords();
  }, [childId]);

  const loadNutritionRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_records')
        .select('*')
        .eq('child_id', childId)
        .order('date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données nutritionnelles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNutritionStatusBadge = (status: string) => {
    switch (status) {
      case 'severely_malnourished':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Malnutrition sévère</Badge>;
      case 'malnourished':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Malnutrition modérée</Badge>;
      case 'normal':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Normal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getWeightTrend = (currentWeight: number, index: number) => {
    if (index === records.length - 1) return null; // Premier enregistrement
    
    const previousWeight = records[index + 1].weight_kg;
    const difference = currentWeight - previousWeight;
    
    if (difference > 0.5) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (difference < -0.5) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Chargement des données nutritionnelles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Scale className="w-5 h-5" />
            <span className="break-words">Suivi nutritionnel - {childName}</span>
          </CardTitle>
          <Button onClick={onAddRecord} size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle mesure
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8">
            <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune donnée nutritionnelle</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par enregistrer les premières mesures de {childName}.
            </p>
            <Button onClick={onAddRecord}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter des données
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Résumé des dernières mesures */}
            {records.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Dernier poids</label>
                  <p className="text-base sm:text-lg font-semibold">{records[0].weight_kg} kg</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Dernière taille</label>
                  <p className="text-base sm:text-lg font-semibold">{records[0].height_cm} cm</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">IMC actuel</label>
                  <p className="text-base sm:text-lg font-semibold">{records[0].bmi?.toFixed(1) || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Statut</label>
                  <div className="mt-1">
                    {getNutritionStatusBadge(records[0].nutrition_status)}
                  </div>
                </div>
              </div>
            )}

            {/* Historique détaillé */}
            <div className="space-y-3">
              <h4 className="font-medium">Historique des mesures</h4>
              {records.map((record, index) => (
                <div key={record.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        {format(new Date(record.date), 'PPP', { locale: fr })}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {format(new Date(record.created_at), 'PPp', { locale: fr })}
                      </p>
                    </div>
                    <div className="order-first sm:order-last">
                      {getNutritionStatusBadge(record.nutrition_status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Poids:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{record.weight_kg} kg</span>
                        {getWeightTrend(record.weight_kg, index)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Taille:</span>
                      <span className="text-sm text-muted-foreground">{record.height_cm} cm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">IMC:</span>
                      <span className="text-sm text-muted-foreground">{record.bmi?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NutritionHistory;
