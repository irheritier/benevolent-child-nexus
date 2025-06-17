
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
import { Send, Users, Shield, Globe, Building2, GraduationCap, Search } from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { useLanguage } from '@/hooks/useLanguage';

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
  const { language, setLanguage } = useLanguage();

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

  const getOrganizationIcon = (type: string) => {
    switch (type) {
      case 'ong':
        return <Users className="w-5 h-5" />;
      case 'universite':
        return <GraduationCap className="w-5 h-5" />;
      case 'institut_recherche':
        return <Search className="w-5 h-5" />;
      case 'organisme_gouvernemental':
        return <Shield className="w-5 h-5" />;
      case 'organisation_internationale':
        return <Globe className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        adminLoginText="Connexion Partenaire"
      />

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Devenir Partenaire
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Rejoignez notre réseau de partenaires pour accéder aux données et contribuer à la protection des enfants vulnérables
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-blue-100 dark:border-blue-900/30 hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Accès Sécurisé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Accédez aux données avec des protocoles de sécurité renforcés
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 dark:border-purple-900/30 hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">Impact Global</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Contribuez à un impact positif sur la protection de l'enfance
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 dark:border-green-900/30 hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">Recherche Avancée</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Outils d'analyse et de recherche pour vos projets
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Form Card */}
        <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-t-lg border-b">
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              Demande d'Accès Partenaire
            </CardTitle>
            <CardDescription className="text-base">
              Remplissez ce formulaire pour demander l'accès aux données des orphelinats.
              Votre demande sera examinée par notre équipe administrative.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="organizationName" className="text-base font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Nom de l'organisation *
                  </Label>
                  <Input
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className="h-12 border-2 focus:border-blue-500 transition-colors"
                    placeholder="Entrez le nom de votre organisation"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="organizationType" className="text-base font-semibold flex items-center gap-2">
                    {getOrganizationIcon(formData.organizationType)}
                    Type d'organisation *
                  </Label>
                  <Select 
                    value={formData.organizationType} 
                    onValueChange={(value) => handleInputChange('organizationType', value)}
                  >
                    <SelectTrigger className="h-12 border-2 focus:border-blue-500 transition-colors">
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

                <div className="space-y-3">
                  <Label htmlFor="contactPerson" className="text-base font-semibold">
                    Personne de contact *
                  </Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    className="h-12 border-2 focus:border-blue-500 transition-colors"
                    placeholder="Nom complet du responsable"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-12 border-2 focus:border-blue-500 transition-colors"
                    placeholder="contact@organisation.com"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-base font-semibold">
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="h-12 border-2 focus:border-blue-500 transition-colors"
                    placeholder="+243 XXX XXX XXX"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="purpose" className="text-base font-semibold">
                    Objectif d'utilisation *
                  </Label>
                  <Select 
                    value={formData.purpose} 
                    onValueChange={(value) => handleInputChange('purpose', value)}
                  >
                    <SelectTrigger className="h-12 border-2 focus:border-blue-500 transition-colors">
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

              <div className="space-y-3">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description du projet
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="border-2 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Décrivez votre projet et comment vous comptez utiliser les données. Plus votre description est détaillée, plus votre demande aura de chances d'être approuvée."
                />
              </div>

              <div className="flex justify-center pt-6">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="h-14 px-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Send className="h-5 w-5" />
                      Envoyer la demande
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Votre demande sera traitée dans un délai de 48 à 72 heures. 
            Vous recevrez une notification par email dès qu'une décision sera prise.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PartnerRequest;
