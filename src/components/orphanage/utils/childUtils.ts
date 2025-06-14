
import { Badge } from '@/components/ui/badge';
import { getParentStatusText } from './parentStatusUtils';

export const calculateAge = (birthDate: string | null, estimatedAge: number | null) => {
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

export const getGenderBadge = (gender: string) => {
  return (
    <Badge variant="outline" className={gender === 'M' ? 'text-blue-600 border-blue-200' : 'text-pink-600 border-pink-200'}>
      {gender === 'M' ? 'Garçon' : 'Fille'}
    </Badge>
  );
};

export const getParentStatusBadge = (status: string) => {
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
