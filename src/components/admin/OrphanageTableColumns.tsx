import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle, Clock, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";

interface Orphanage {
  id: string;
  name: string;
  province: string;
  city: string;
  province_id: string;
  city_id: string;
  address?: string;
  contact_person: string;
  phone?: string;
  email?: string;
  description?: string;
  child_capacity?: number;
  children_total?: number;
  boys_count?: number;
  girls_count?: number;
  schooling_rate?: number;
  annual_disease_rate?: number;
  meals_per_day?: number;
  legal_status?: 'pending' | 'verified' | 'rejected';
  created_at?: string;
  updated_at?: string;
  documents?: any;
  photo_url?: string;
  location_gps?: any;
  dhis2_orgunit_id?: string;
  created_by?: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />En attente</Badge>;
    case 'verified':
      return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" />Validé</Badge>;
    case 'rejected':
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Rejeté</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const createOrphanageColumns = (
  onViewDetails: (orphanage: Orphanage) => void
): ColumnDef<Orphanage>[] => [
  {
    accessorKey: "name",
    header: "Nom du centre",
    cell: ({ row }) => (
      <div className="font-medium text-slate-800 dark:text-slate-200">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "province",
    header: "Localisation",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
        <MapPin className="w-3 h-3" />
        {row.getValue("province")}, {row.original.city}
      </div>
    ),
  },
  {
    accessorKey: "contact_person",
    header: "Contact",
    cell: ({ row }) => (
      <div className="text-slate-600 dark:text-slate-400">
        {row.getValue("contact_person")}
      </div>
    ),
  },
  {
    accessorKey: "child_capacity",
    header: "Capacité",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
        <Users className="w-3 h-3" />
        {row.getValue("child_capacity") || 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: "legal_status",
    header: "Statut",
    cell: ({ row }) => getStatusBadge(row.getValue("legal_status")),
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-slate-600 dark:text-slate-400">
        {new Date(row.getValue("created_at")).toLocaleDateString('fr-FR')}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(row.original)}
          className="flex items-center gap-1 border-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
        >
          <Eye className="w-3 h-3" />
          Voir
        </Button>
      </motion.div>
    ),
  },
];