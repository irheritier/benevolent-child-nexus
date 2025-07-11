import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, FileText, Shield, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProvinces } from "@/hooks/useProvinces";
import { useCities } from "@/hooks/useCities";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useOrphanageRegistration } from "@/hooks/useOrphanageRegistration";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { RegistrationSteps } from "@/components/register/RegistrationSteps";
import { BasicInfoForm } from "@/components/register/BasicInfoForm";
import { DocumentUpload } from "@/components/register/DocumentUpload";
import { ConsentForm } from "@/components/register/ConsentForm";
import { SuccessPage } from "@/components/register/SuccessPage";
import { OrphanageFormData } from "@/types/orphanage";

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

  const form = useForm<OrphanageFormData>({
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
      children_total: "",
      boys_count: "",
      girls_count: "",
      schooling_rate: "",
      annual_disease_rate: "",
      meals_per_day: "",
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
      if (!values[field as keyof OrphanageFormData] || values[field as keyof OrphanageFormData].trim() === '') {
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

    const childrenTotal = parseInt(formData.children_total) || 0;
    const boysCount = parseInt(formData.boys_count) || 0;
    const girlsCount = Math.max(0, childrenTotal - boysCount);

    const registrationData = {
      ...formData,
      girls_count: girlsCount.toString(),
      documentData
    };

    const result = await submitRegistration(registrationData);
    
    if (result.success) {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return <SuccessPage language={language} setLanguage={setLanguage} texts={t} />;
  }

  const footerTexts = {
    aboutText: "FCTS : Find The Children To Save est une plateforme dédiée au suivi et à la protection des enfants vulnérables en République Démocratique du Congo. Notre mission est d'améliorer le bien-être des enfants grâce à une meilleure coordination entre les centres d'accueil.",
    links: "Liens utiles",
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    contact: "Contact",
    partners: "Partenaires",
    partnersText: "Nous travaillons en étroite collaboration avec le Ministère des Affaires Sociales, les ONG locales et internationales pour assurer le meilleur suivi possible des enfants."
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-slate-900 dark:to-purple-950 flex flex-col">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        adminLoginText={t.adminLoginText}
      />

      <div className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl lg:max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 text-blue-800 dark:text-blue-200 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                <span>Inscription Officielle</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 dark:text-slate-100 mb-4 sm:mb-6 px-4">{t.title}</h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed px-4">{t.subtitle}</p>
            </div>

            <RegistrationSteps currentStep={currentStep} texts={t} />

            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
              <CardHeader className="pb-6 sm:pb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-t-lg">
                <CardTitle className="text-xl sm:text-2xl text-center text-slate-800 dark:text-slate-100">
                  {currentStep === 1 && (
                    <div className="flex items-center justify-center">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
                      {t.steps.info}
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div className="flex items-center justify-center">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-purple-600" />
                      {t.documents.title}
                    </div>
                  )}
                  {currentStep === 3 && (
                    <div className="flex items-center justify-center">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-green-600" />
                      {t.consent.title}
                    </div>
                  )}
                </CardTitle>
                {currentStep === 2 && (
                  <p className="text-center text-slate-600 dark:text-slate-300 mt-2 text-sm sm:text-base px-4">{t.documents.subtitle}</p>
                )}
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {currentStep === 1 && (
                  <BasicInfoForm
                    form={form}
                    texts={t}
                    provinces={provinces}
                    cities={cities}
                    selectedProvinceId={selectedProvinceId}
                    onProvinceChange={handleProvinceChange}
                  />
                )}
                {currentStep === 2 && (
                  <DocumentUpload
                    texts={t}
                    uploadedFile={uploadedFile}
                    isUploading={isUploading}
                    onFileUpload={handleFileUpload}
                    onRemoveFile={removeFile}
                  />
                )}
                {currentStep === 3 && (
                  <ConsentForm
                    texts={t}
                    consentChecked={consentChecked}
                    onConsentChange={setConsentChecked}
                  />
                )}

                <div className="flex flex-col sm:flex-row justify-between pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-700 gap-4 sm:gap-0">
                  <div>
                    {currentStep > 1 && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="px-6 sm:px-8 py-2 sm:py-3 border-2 hover:border-blue-400 text-sm sm:text-base w-full sm:w-auto"
                      >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                        {t.buttons.previous}
                      </Button>
                    )}
                  </div>
                  <div className="w-full sm:w-auto">
                    {currentStep < 3 ? (
                      <Button
                        onClick={handleNextStep}
                        size="lg"
                        className="px-8 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-sm sm:text-base w-full sm:w-auto"
                      >
                        {t.buttons.next}
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 rotate-180" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={!consentChecked || isSubmitting}
                        size="lg"
                        className="px-8 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
                      >
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
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

      <Footer footer={footerTexts} />
    </div>
  );
};

export default Register;
