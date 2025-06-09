
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Shield, FileText, MapPin, Phone, Mail, Building2, Users, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  centerName: string;
  capacity: string;
  province: string;
  city: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  description: string;
}

const Register = () => {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [currentStep, setCurrentStep] = useState(1);
  const [consentChecked, setConsentChecked] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      centerName: "",
      capacity: "",
      province: "",
      city: "",
      address: "",
      contactPerson: "",
      phone: "",
      email: "",
      description: "",
    }
  });

  const texts = {
    fr: {
      title: "Inscription Centre d'Accueil",
      subtitle: "Rejoignez le réseau Congo ChildNet pour protéger et suivre les enfants vulnérables",
      backHome: "Retour à l'accueil",
      steps: {
        info: "Informations générales",
        documents: "Documents légaux",
        confirmation: "Confirmation"
      },
      form: {
        centerName: "Nom du centre d'accueil",
        centerNamePlaceholder: "Ex: Centre d'Accueil Notre Dame",
        province: "Province",
        city: "Ville",
        address: "Adresse complète",
        addressPlaceholder: "Numéro, rue, quartier...",
        contactPerson: "Personne de contact",
        contactPersonPlaceholder: "Nom complet du responsable",
        phone: "Téléphone",
        phonePlaceholder: "+243 XXX XXX XXX",
        email: "Email",
        emailPlaceholder: "contact@centre.cd",
        description: "Description du centre",
        descriptionPlaceholder: "Décrivez brièvement votre centre d'accueil, sa mission et ses activités...",
        capacity: "Capacité d'accueil",
        capacityPlaceholder: "Nombre maximum d'enfants"
      },
      documents: {
        title: "Documents Légaux Requis",
        subtitle: "Veuillez soumettre les documents officiels attestant de votre reconnaissance légale",
        required: "Documents obligatoires :",
        agrementLabel: "Agrément ministériel",
        statutsLabel: "Statuts de l'organisation",
        certificatLabel: "Certificat d'enregistrement",
        uploadText: "Cliquez pour télécharger ou glissez vos fichiers ici",
        acceptedFormats: "Formats acceptés: PDF, JPG, PNG (max 10MB par fichier)",
        legalNotice: "Veuillez soumettre les documents officiels attestant de votre reconnaissance légale en tant que centre d'accueil pour enfants, tels que l'agrément ministériel, les statuts, ou tout autre document d'enregistrement officiel. Ces pièces seront utilisées uniquement à des fins de vérification et de recensement, dans le respect de la confidentialité.",
        filesSelected: "fichier(s) sélectionné(s)"
      },
      consent: {
        title: "Consentement et Éthique",
        declaration: "Je déclare que les données saisies sur la plateforme sont collectées de manière légale, avec l'autorisation de tutelle lorsque nécessaire, et dans le respect des droits des enfants.",
        privacy: "J'accepte la politique de confidentialité",
        terms: "J'accepte les conditions d'utilisation"
      },
      buttons: {
        next: "Suivant",
        previous: "Précédent",
        submit: "Soumettre la demande",
        upload: "Télécharger les documents"
      },
      validation: {
        processing: "Traitement en cours...",
        success: "Demande soumise avec succès !",
        pending: "Votre demande d'inscription a été soumise et est en cours de validation par nos équipes. Vous recevrez un email de confirmation dans les 48 heures.",
        required: "Ce champ est obligatoire",
        email: "Veuillez entrer une adresse email valide",
        fillRequired: "Veuillez remplir tous les champs obligatoires"
      }
    },
    en: {
      title: "Care Center Registration",
      subtitle: "Join the Congo ChildNet network to protect and monitor vulnerable children",
      backHome: "Back to home",
      steps: {
        info: "General Information",
        documents: "Legal Documents",
        confirmation: "Confirmation"
      },
      form: {
        centerName: "Care center name",
        centerNamePlaceholder: "Ex: Notre Dame Care Center",
        province: "Province",
        city: "City",
        address: "Full address",
        addressPlaceholder: "Number, street, district...",
        contactPerson: "Contact person",
        contactPersonPlaceholder: "Full name of responsible person",
        phone: "Phone",
        phonePlaceholder: "+243 XXX XXX XXX",
        email: "Email",
        emailPlaceholder: "contact@center.cd",
        description: "Center description",
        descriptionPlaceholder: "Briefly describe your care center, its mission and activities...",
        capacity: "Accommodation capacity",
        capacityPlaceholder: "Maximum number of children"
      },
      documents: {
        title: "Required Legal Documents",
        subtitle: "Please submit official documents attesting to your legal recognition",
        required: "Required documents:",
        agrementLabel: "Ministerial approval",
        statutsLabel: "Organization statutes",
        certificatLabel: "Registration certificate",
        uploadText: "Click to upload or drag your files here",
        acceptedFormats: "Accepted formats: PDF, JPG, PNG (max 10MB per file)",
        legalNotice: "Please submit official documents attesting to your legal recognition as a care center for children, such as ministerial approval, statutes, or any other official registration document. These documents will be used solely for verification and census purposes, in compliance with confidentiality.",
        filesSelected: "file(s) selected"
      },
      consent: {
        title: "Consent and Ethics",
        declaration: "I declare that the data entered on the platform is collected legally, with guardianship authorization when necessary, and in respect of children's rights.",
        privacy: "I accept the privacy policy",
        terms: "I accept the terms of use"
      },
      buttons: {
        next: "Next",
        previous: "Previous",
        submit: "Submit application",
        upload: "Upload documents"
      },
      validation: {
        processing: "Processing...",
        success: "Application submitted successfully!",
        pending: "Your registration application has been submitted and is being validated by our teams. You will receive a confirmation email within 48 hours.",
        required: "This field is required",
        email: "Please enter a valid email address",
        fillRequired: "Please fill in all required fields"
      }
    }
  };

  const t = texts[language];

  const provinces = [
    "Kinshasa", "Kongo Central", "Kwango", "Kwilu", "Mai-Ndombe",
    "Kasaï", "Kasaï Central", "Kasaï Oriental", "Lomami", "Sankuru",
    "Maniema", "Sud-Kivu", "Nord-Kivu", "Ituri", "Haut-Uélé",
    "Bas-Uélé", "Tshopo", "Mongala", "Nord-Ubangi", "Sud-Ubangi",
    "Équateur", "Tshuapa", "Lualaba", "Haut-Katanga", "Haut-Lomami", "Tanganyika"
  ];

  const validateStep1 = () => {
    const requiredFields = ['centerName', 'province', 'city', 'contactPerson', 'phone', 'email'];
    const values = form.getValues();
    
    for (const field of requiredFields) {
      if (!values[field as keyof FormData] || values[field as keyof FormData].trim() === '') {
        toast({
          title: "Erreur de validation",
          description: t.validation.fillRequired,
          variant: "destructive",
        });
        return false;
      }
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      toast({
        title: "Erreur de validation",
        description: t.validation.email,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(file => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type)) {
          toast({
            title: "Format non accepté",
            description: `Le fichier ${file.name} n'est pas dans un format accepté.`,
            variant: "destructive",
          });
          return false;
        }
        
        if (file.size > maxSize) {
          toast({
            title: "Fichier trop volumineux",
            description: `Le fichier ${file.name} dépasse la taille maximale de 10MB.`,
            variant: "destructive",
          });
          return false;
        }
        
        return true;
      });

      if (validFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...validFiles]);
        toast({
          title: "Fichiers téléchargés",
          description: `${validFiles.length} fichier(s) téléchargé(s) avec succès.`,
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (uploadedFiles.length === 0) {
        toast({
          title: "Documents requis",
          description: "Veuillez télécharger au moins un document avant de continuer.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(3);
    }
  };

  const renderStep1 = () => (
    <Form {...form}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="centerName"
            rules={{ required: t.validation.required }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t.form.centerName} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.form.centerNamePlaceholder}
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.form.capacity}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t.form.capacityPlaceholder}
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="province"
            rules={{ required: t.validation.required }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t.form.province} <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionnez une province" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            rules={{ required: t.validation.required }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t.form.city} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Lubumbashi"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.address}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t.form.addressPlaceholder}
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="contactPerson"
            rules={{ required: t.validation.required }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t.form.contactPerson} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.form.contactPersonPlaceholder}
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            rules={{ required: t.validation.required }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t.form.phone} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.form.phonePlaceholder}
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          rules={{ 
            required: t.validation.required,
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t.validation.email
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t.form.email} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t.form.emailPlaceholder}
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.form.description}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t.form.descriptionPlaceholder}
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
              {t.documents.required}
            </h4>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>• {t.documents.agrementLabel}</li>
              <li>• {t.documents.statutsLabel}</li>
              <li>• {t.documents.certificatLabel}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium text-foreground mb-2">
            {t.documents.uploadText}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {t.documents.acceptedFormats}
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {t.buttons.upload}
          </Button>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-300 mb-3">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">
                {uploadedFiles.length} {t.documents.filesSelected}
              </span>
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
          <strong>Note légale :</strong> {t.documents.legalNotice}
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          {t.consent.title}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent"
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="consent" className="text-sm leading-relaxed text-foreground">
              {t.consent.declaration}
            </Label>
          </div>
          
          <div className="flex items-center space-x-3">
            <Checkbox id="privacy" />
            <Label htmlFor="privacy" className="text-sm text-foreground">
              {t.consent.privacy}
            </Label>
          </div>
          
          <div className="flex items-center space-x-3">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="text-sm text-foreground">
              {t.consent.terms}
            </Label>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6 text-center">
        <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Prêt à rejoindre Congo ChildNet ?
        </h3>
        <p className="text-muted-foreground">
          Votre demande sera examinée par notre équipe dans les 48 heures.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">Congo ChildNet</h1>
              <p className="text-xs text-muted-foreground">Inscription</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all font-medium ${
                  language === 'fr' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all font-medium ${
                  language === 'en' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                EN
              </button>
            </div>
            <ThemeToggle />
            <Link to="/">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.backHome}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t.title}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep === step 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : currentStep > step 
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-muted-foreground/30 text-muted-foreground'
                  }`}>
                    {currentStep > step ? (
                      <Shield className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step}</span>
                    )}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step === 1 && t.steps.info}
                      {step === 2 && t.steps.documents}
                      {step === 3 && t.steps.confirmation}
                    </p>
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-px mx-4 ${
                      currentStep > step ? 'bg-green-500' : 'bg-muted-foreground/30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-center">
                {currentStep === 1 && (
                  <div className="flex items-center justify-center">
                    <Building2 className="w-6 h-6 mr-2" />
                    {t.steps.info}
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="flex items-center justify-center">
                    <FileText className="w-6 h-6 mr-2" />
                    {t.documents.title}
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="flex items-center justify-center">
                    <Shield className="w-6 h-6 mr-2" />
                    {t.consent.title}
                  </div>
                )}
              </CardTitle>
              {currentStep === 2 && (
                <p className="text-center text-muted-foreground">{t.documents.subtitle}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <div>
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-6"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t.buttons.previous}
                    </Button>
                  )}
                </div>
                <div>
                  {currentStep < 3 ? (
                    <Button
                      onClick={handleNextStep}
                      className="px-8"
                    >
                      {t.buttons.next}
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  ) : (
                    <Button
                      disabled={!consentChecked}
                      className="px-8 bg-gradient-to-r from-primary to-primary/90"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {t.buttons.submit}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
