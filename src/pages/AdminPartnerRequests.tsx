
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Check, X, Eye, Mail, Phone, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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

const AdminPartnerRequests = () => {
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PartnerRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadRequests();
  }, []);

  const checkAuthAndLoadRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/auth');
        return;
      }

      // Vérifier le rôle admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userData?.role !== 'admin') {
        navigate('/admin/auth');
        return;
      }

      await loadRequests();
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/admin/auth');
    }
  };

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes partenaires.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (request: PartnerRequest) => {
    setIsProcessing(true);
    try {
      // Mettre à jour uniquement le statut de la demande
      const { error: updateError } = await supabase
        .from('partner_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getSession()).data.session?.user.id
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast({
        title: "Demande approuvée",
        description: `La demande de ${request.organization_name} a été approuvée`,
      });

      await loadRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la demande.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = async (request: PartnerRequest) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une raison de rejet.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('partner_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getSession()).data.session?.user.id,
          rejection_reason: rejectionReason
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: "Demande rejetée",
        description: "La demande a été rejetée avec succès.",
      });

      await loadRequests();
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejetée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au tableau de bord
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Gestion des partenaires
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune demande partenaire pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.organization_name}</CardTitle>
                      <CardDescription>
                        {getOrganizationTypeLabel(request.organization_type)} • 
                        Demandé {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: fr })}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{request.email}</span>
                    </div>
                    {request.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{request.phone}</span>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">
                        <strong>Contact:</strong> {request.contact_person}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Objectif:</strong> {request.purpose}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{request.organization_name}</DialogTitle>
                          <DialogDescription>
                            Détails de la demande d'accès partenaire
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Description du projet</Label>
                            <p className="text-sm text-gray-600 mt-1">
                              {request.description || 'Aucune description fournie'}
                            </p>
                          </div>
                          {request.status === 'rejected' && request.rejection_reason && (
                            <div>
                              <Label>Raison du rejet</Label>
                              <p className="text-sm text-red-600 mt-1">{request.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                        {request.status === 'pending' && (
                          <DialogFooter className="flex-col gap-4">
                            <div className="w-full">
                              <Label htmlFor="rejection">Raison de rejet (optionnel)</Label>
                              <Textarea
                                id="rejection"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Expliquez pourquoi cette demande est rejetée..."
                              />
                            </div>
                            <div className="flex gap-2 w-full">
                              <Button
                                onClick={() => handleApproveRequest(request)}
                                disabled={isProcessing}
                                className="flex-1"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approuver
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleRejectRequest(request)}
                                disabled={isProcessing}
                                className="flex-1"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Rejeter
                              </Button>
                            </div>
                          </DialogFooter>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPartnerRequests;
