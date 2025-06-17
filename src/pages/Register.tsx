import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Shield, FileText, MapPin, Phone, Mail, Building2, Users, Heart, X, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useProvinces } from "@/hooks/useProvinces";
import { useCities } from "@/hooks/useCities";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useOrphanageRegistration } from "@/hooks/useOrphanageRegistration";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";

interface FormData {
  centerName: string;
  capacity: string;
  provinceId: string;
  cityId: string;
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
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: provinces = [] } = useProvinces();
  const { data: cities = [] } = useCities(selectedProvinceId);
  const { uploadedFile, isUploading, uploadFile, removeFile, getDocumentData } = useFileUpload();
  const { submitRegistration, isSubmitting } = useOrphanageRegistration();

  const form = useForm<FormData>({
    defaultValues: {
      centerName: "",
      capacity: "",
      provinceId: "",
      cityId: "",
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
      subtitle: "Rejoignez le réseau FCS pour protéger et suivre les enfants vulnérables",
      backHome: "Retour à l'accueil",
      adminLoginText: "Connexion Admin",
      steps: {
        info: "Informations générales",
        documents: "Documents légaux",
        confirmation: "Confirmation"
      },
      form: {
        centerName: "Nom du centre d'accueil",
        centerNamePlaceholder: "Ex: Centre d'Accueil Notre Dame",
        province: "Province",
        locality: "Localité",
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
        title: "Document Légal Requis",
        subtitle: "Veuillez soumettre un fichier unique contenant tous vos documents légaux",
        required: "Document obligatoire :",
        singleFileLabel: "Document légal complet (PDF ou Image)",
        uploadText: "Cliquez pour télécharger ou glissez votre fichier ici",
        acceptedFormats: "Formats acceptés: PDF, JPG, PNG (max 10MB)",
        legalNotice: "Veuillez soumettre un seul fichier contenant tous vos documents officiels mergés (agrément ministériel, statuts, certificat d'enregistrement, etc.). Ce fichier sera utilisé uniquement à des fins de vérification et de recensement, dans le respect de la confidentialité.",
        fileSelected: "Document sélectionné avec succès",
        uploading: "Téléchargement en cours..."
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
        upload: "Télécharger le document"
      },
      validation: {
        processing: "Traitement en cours...",
        success: "Demande soumise avec succès !",
        pending: "Votre demande d'inscription a été soumise et est en cours de validation par nos équipes. Vous recevrez un email de confirmation dans les 48 heures.",
        required: "Ce champ est obligatoire",
        email: "Veuillez entrer une adresse email valide",
        fillRequired: "Veuillez remplir tous les champs obligatoires",
        selectProvince: "Veuillez sélectionner une province",
        selectLocality: "Veuillez sélectionner une localité",
        documentRequired: "Veuillez télécharger un document avant de continuer"
      }
    },
    en: {
      title: "Care Center Registration",
      subtitle: "Join the FCS network to protect and monitor vulnerable children",
      backHome: "Back to home",
      adminLoginText: "Admin Login",
      steps: {
        info: "General Information",
        documents: "Legal Documents",
        confirmation: "Confirmation"
      },
      form: {
        centerName: "Care center name",
        centerNamePlaceholder: "Ex: Notre Dame Care Center",
        province: "Province",
        locality: "Locality",
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
        title: "Required Legal Document",
        subtitle: "Please submit a single file containing all your legal documents",
        required: "Required document:",
        singleFileLabel: "Complete legal document (PDF or Image)",
        uploadText: "Click to upload or drag your file here",
        acceptedFormats: "Accepted formats: PDF, JPG, PNG (max 10MB)",
        legalNotice: "Please submit a single file containing all your official documents merged (ministerial approval, statutes, registration certificate, etc.). This file will be used solely for verification and census purposes, in compliance with confidentiality.",
        fileSelected: "Document selected successfully",
        uploading: "Uploading..."
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
        upload: "Upload document"
      },
      validation: {
        processing: "Processing...",
        success: "Application submitted successfully!",
        pending: "Your registration application has been submitted and is being validated by our teams. You will receive a confirmation email within 48 hours.",
        required: "This field is required",
        email: "Please enter a valid email address",
        fillRequired: "Please fill in all required fields",
        selectProvince: "Please select a province",
        selectLocality: "Please select a locality",
        documentRequired: "Please upload a document before continuing"
      }
    }
  };

  const t = texts[language];

  const validateStep1 = () => {
    const values = form.getValues();
    
    const requiredFields = [
      { field: 'centerName', message: t.validation.required },
      { field: 'provinceId', message: t.validation.selectProvince },
      { field: 'cityId', message: t.validation.selectLocality },
      { field: 'contactPerson', message: t.validation.required },
      { field: 'phone', message: t.validation.required },
      { field: 'email', message: t.validation.required }
    ];

    for (const { field, message } of requiredFields) {
      if (!values[field as keyof FormData] || values[field as keyof FormData].trim() === '') {
        toast({
          title: "Erreur de validation",
          description: message,
          variant: "destructive",
        });
        return false;
      }
    }

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (!uploadedFile) {
        toast({
          title: "Document requis",
          description: t.validation.documentRequired,
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    form.setValue('provinceId', provinceId);
    form.setValue('cityId', '');
  };

  const handleSubmit = async () => {
    if (!consentChecked) {
      toast({
        title: "Consentement requis",
        description: "Veuillez accepter les conditions avant de soumettre.",
        variant: "destructive",
      });
      return;
    }

    const formData = form.getValues();
    const documentData = getDocumentData();

    const registrationData = {
      ...formData,
      documentData
    };

    const result = await submitRegistration(registrationData);
    
    if (result.success) {
      setIsSubmitted(true);
    }
  };

  // Show success page if submitted
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-slate-900 dark:to-purple-950 flex flex-col">
        <Header 
          language={language} 
          setLanguage={setLanguage} 
          adminLoginText={t.adminLoginText}
        />

        <div className="flex-1">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              
              <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t.validation.success}</h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed">
                {t.validation.pending}
              </p>
              
              <Link to="/">
                <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl rounded-xl">
                  <ArrowLeft className="w-5 h-5 mr-3" />
                  {t.backHome}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Footer footer={{
          aboutText: "FCS : Find Children To Save est une plateforme dédiée au suivi et à la protection des enfants vulnérables en République Démocratique du Congo. Notre mission est d'améliorer le bien-être des enfants grâce à une meilleure coordination entre les centres d'accueil.",
          links: "Liens utiles",
          privacy: "Politique de confidentialité",
          terms: "Conditions d'utilisation",
          contact: "Contact",
          partners: "Partenaires",
          partnersText: "Nous travaillons en étroite collaboration avec le Ministère des Affaires Sociales, les ONG locales et internationales pour assurer le meilleur suivi possible des enfants."
        }} />
      </div>
    );
  }

  const renderStep1 = () => (
    <Form {...form}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="centerName"
            rules={{ required: t.validation.required }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">
                  {t.form.centerName} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.form.centerNamePlaceholder}
                    className="h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
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
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">{t.form.capacity}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t.form.capacityPlaceholder}
                    className="h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
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
            name="provinceId"
            rules={{ required: t.validation.selectProvince }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">
                  {t.form.province} <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={handleProvinceChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Sélectionnez une province" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province.id} value={province.id}>
                        {province.name}
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
            name="cityId"
            rules={{ required: t.validation.selectLocality }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">
                  {t.form.locality} <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProvinceId}>
                  <FormControl>
                    <SelectTrigger className="h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Sélectionnez une localité" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">{t.form.address}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t.form.addressPlaceholder}
                  className="h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
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
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">
                  {t.form.contactPerson} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.form.contactPersonPlaceholder}
                    className="h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
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
                <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">
                  {t.form.phone} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.form.phonePlaceholder}
                    className="h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
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
              <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">
                {t.form.email} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t.form.emailPlaceholder}
                  className="h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
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
              <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">{t.form.description}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t.form.descriptionPlaceholder}
                  className="min-h-[140px] resize-none border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
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
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 text-lg">
              {t.documents.required}
            </h4>
            <p className="text-amber-700 dark:text-amber-300">
              {t.documents.singleFileLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {!uploadedFile ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-800/50">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-3">
              {isUploading ? t.documents.uploading : t.documents.uploadText}
            </p>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {t.documents.acceptedFormats}
            </p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isUploading}
              className="px-8 py-3 border-2"
            >
              <Upload className="w-5 h-5 mr-3" />
              {isUploading ? t.documents.uploading : t.buttons.upload}
            </Button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 text-green-700 dark:text-green-300 mb-4">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold text-lg">
                {t.documents.fileSelected}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-green-100 dark:border-green-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-lg">
                      {uploadedFile.file.name}
                    </span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
          <strong>Note légale :</strong> {t.documents.legalNotice}
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          {t.consent.title}
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-900">
            <Checkbox
              id="consent"
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="consent" className="text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer">
              {t.consent.declaration}
            </Label>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
            <Checkbox id="privacy" />
            <Label htmlFor="privacy" className="text-slate-700 dark:text-slate-300 cursor-pointer">
              {t.consent.privacy}
            </Label>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="text-slate-700 dark:text-slate-300 cursor-pointer">
              {t.consent.terms}
            </Label>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-8 text-center border border-purple-200 dark:border-purple-800">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          Prêt à rejoindre FCS ?
        </h3>
        <p className="text-slate-600 dark:text-slate-300">
          Votre demande sera examinée par notre équipe dans les 48 heures.
        </p>
      </div>
    </div>
  );

  const footerTexts = {
    aboutText: "FCS : Find Children To Save est une plateforme dédiée au suivi et à la protection des enfants vulnérables en République Démocratique du Congo. Notre mission est d'améliorer le bien-être des enfants grâce à une meilleure coordination entre les centres d'accueil.",
    links: "Liens utiles",
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    contact: "Contact",
    partners: "Partenaires",
    partnersText: "Nous travaillons en étroite collaboration avec le Ministère des Affaires Sociales, les ONG locales et internationales pour assurer le meilleur suivi possible des enfants."
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-slate-900 dark:to-purple-950 flex flex-col">
      {/* Use the same Header component as homepage */}
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        adminLoginText={t.adminLoginText}
      />

      {/* Main Content */}
      <div className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            {/* Enhanced Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold mb-6 border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
                <Building2 className="w-5 h-5 mr-3" />
                <span>Inscription Officielle</span>
              </div>
              <h1 className="text-5xl font-black text-slate-800 dark:text-slate-100 mb-6">{t.title}</h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">{t.subtitle}</p>
            </div>

            {/* Enhanced Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-center space-x-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      currentStep === step 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white shadow-lg scale-110' 
                        : currentStep > step 
                          ? 'bg-green-500 border-green-500 text-white shadow-md'
                          : 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800'
                    }`}>
                      {currentStep > step ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <span className="text-sm font-bold">{step}</span>
                      )}
                    </div>
                    <div className="ml-4 hidden lg:block">
                      <p className={`text-sm font-semibold ${
                        currentStep >= step ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {step === 1 && t.steps.info}
                        {step === 2 && t.steps.documents}
                        {step === 3 && t.steps.confirmation}
                      </p>
                    </div>
                    {step < 3 && (
                      <div className={`w-20 h-px mx-6 transition-colors ${
                        currentStep > step ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Form Card */}
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
              <CardHeader className="pb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-t-lg">
                <CardTitle className="text-2xl text-center text-slate-800 dark:text-slate-100">
                  {currentStep === 1 && (
                    <div className="flex items-center justify-center">
                      <Building2 className="w-6 h-6 mr-3 text-blue-600" />
                      {t.steps.info}
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div className="flex items-center justify-center">
                      <FileText className="w-6 h-6 mr-3 text-purple-600" />
                      {t.documents.title}
                    </div>
                  )}
                  {currentStep === 3 && (
                    <div className="flex items-center justify-center">
                      <Shield className="w-6 h-6 mr-3 text-green-600" />
                      {t.consent.title}
                    </div>
                  )}
                </CardTitle>
                {currentStep === 2 && (
                  <p className="text-center text-slate-600 dark:text-slate-300 mt-2">{t.documents.subtitle}</p>
                )}
              </CardHeader>
              <CardContent className="p-8">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}

                {/* Enhanced Navigation Buttons */}
                <div className="flex justify-between pt-8 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    {currentStep > 1 && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="px-8 py-3 border-2 hover:border-blue-400"
                      >
                        <ArrowLeft className="w-5 h-5 mr-3" />
                        {t.buttons.previous}
                      </Button>
                    )}
                  </div>
                  <div>
                    {currentStep < 3 ? (
                      <Button
                        onClick={handleNextStep}
                        size="lg"
                        className="px-10 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                      >
                        {t.buttons.next}
                        <ArrowLeft className="w-5 h-5 ml-3 rotate-180" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={!consentChecked || isSubmitting}
                        size="lg"
                        className="px-10 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg disabled:opacity-50"
                      >
                        <Users className="w-5 h-5 mr-3" />
                        {isSubmitting ? t.validation.processing : t.buttons.submit}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer footer={footerTexts} />
    </div>
  );
};

export default Register;
