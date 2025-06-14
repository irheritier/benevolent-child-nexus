
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const PartnerRequest = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    contactPerson: '',
    email: '',
    phone: '',
    description: '',
    purpose: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const createPartnerRequestNotification = async (requestData: any) => {
    try {
      // Créer une notification pour l'administrateur
      await supabase.rpc('create_notification', {
        target_user_id: null, // Pour tous les admins
        notification_type: 'partner_request_pending',
        notification_title: 'Nouvelle demande partenaire',
        notification_message: `${requestData.organization_name} a soumis une demande d'accès partenaire et attend validation.`,
        notification_entity_id: requestData.id,
        notification_entity_type: 'partner_request',
        notification_priority: 'high'
      });
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('partner_requests')
        .insert({
          organization_name: formData.organizationName,
          organization_type: formData.organizationType,
          contact_person: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          description: formData.description,
          purpose: formData.purpose
        })
        .select()
        .single();

      if (error) throw error;

      // Créer la notification
      if (data) {
        await createPartnerRequestNotification(data);
      }

      toast({
        title: "Demande envoyée avec succès",
        description: "Nous examinerons votre demande et vous contacterons bientôt.",
      });

      // Reset form
      setFormData({
        organizationName: '',
        organizationType: '',
        contactPerson: '',
        email: '',
        phone: '',
        description: '',
        purpose: ''
      });
    } catch (error) {
      console.error('Error submitting partner request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Demande d'accès partenaire
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Demande d'accès aux données</CardTitle>
            <CardDescription>
              Remplissez ce formulaire pour demander l'accès aux données des orphelinats.
              Votre demande sera examinée par notre équipe administrative.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Nom de l'organisation *</Label>
                  <Input
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationType">Type d'organisation *</Label>
                  <Select 
                    value={formData.organizationType} 
                    onValueChange={(value) => handleInputChange('organizationType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ong">ONG</SelectItem>
                      <SelectItem value="universite">Université</SelectItem>
                      <SelectItem value="institut_recherche">Institut de recherche</SelectItem>
                      <SelectItem value="organisme_gouvernemental">Organisme gouvernemental</SelectItem>
                      <SelectItem value="organisation_internationale">Organisation internationale</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Personne de contact *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Objectif d'utilisation *</Label>
                  <Select 
                    value={formData.purpose} 
                    onValueChange={(value) => handleInputChange('purpose', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez l'objectif" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recherche">Recherche académique</SelectItem>
                      <SelectItem value="analyse_statistique">Analyse statistique</SelectItem>
                      <SelectItem value="programme_aide">Programme d'aide</SelectItem>
                      <SelectItem value="evaluation_politique">Évaluation de politique</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description du projet</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  placeholder="Décrivez votre projet et comment vous comptez utiliser les données..."
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Envoi en cours...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer la demande
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerRequest;
