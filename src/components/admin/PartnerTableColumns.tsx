import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle, Clock, Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface PartnerRequest {
  id: string;
  organization_name: string;
  organization_type: string;
  contact_person: string;
  email: string;
  phone: string;
  description: string;
  purpose: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />En attente</Badge>;
    case 'approved':
      return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" />Approuvé</Badge>;
    case 'rejected':
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Rejeté</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getOrganizationTypeLabel = (type: string) => {
  const types: { [key: string]: string } = {
    'ong': 'ONG',
    'universite': 'Université',
    'institut_recherche': 'Institut de recherche',
    'organisme_gouvernemental': 'Organisme gouvernemental',
    'organisation_internationale': 'Organisation internationale',
    'autre': 'Autre'
  };
  return types[type] || type;
};

export const createPartnerColumns = (
  onViewDetails: (partner: PartnerRequest) => void
): ColumnDef<PartnerRequest>[] => [
  {
    accessorKey: "organization_name",
    header: "Organisation",
    cell: ({ row }) => (
      <div className="font-medium text-slate-800 dark:text-slate-200">
        {row.getValue("organization_name")}
      </div>
    ),
  },
  {
    accessorKey: "organization_type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
        <Building2 className="w-3 h-3" />
        {getOrganizationTypeLabel(row.getValue("organization_type"))}
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
    accessorKey: "purpose",
    header: "Objectif",
    cell: ({ row }) => (
      <div className="text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
        {row.getValue("purpose")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
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
          className="flex items-center gap-1 border-2 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/20"
        >
          <Eye className="w-3 h-3" />
          Voir
        </Button>
      </motion.div>
    ),
  },
];