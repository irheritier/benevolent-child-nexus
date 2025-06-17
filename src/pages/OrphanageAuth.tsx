
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, LogIn, AlertCircle, Shield, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { useLanguage } from '@/hooks/useLanguage';

const OrphanageAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();

  const translations = {
    fr: {
      title: 'Connexion Centre d\'Accueil',
      subtitle: 'Connectez-vous à votre espace de gestion',
      welcome: 'Bienvenue',
      welcomeSubtitle: 'Accédez à votre tableau de bord pour gérer les enfants sous votre protection',
      email: 'Adresse e-mail',
      password: 'Mot de passe',
      login: 'Se connecter',
      loading: 'Connexion...',
      loginError: 'Erreur de connexion',
      invalidCredentials: 'Email ou mot de passe incorrect',
      accessDenied: 'Accès refusé',
      notOrphanage: 'Ce compte n\'est pas autorisé à accéder à cette interface',
      accountNotVerified: 'Votre compte n\'est pas encore vérifié. Veuillez contacter l\'administration.',
      emailPlaceholder: 'votre.email@exemple.com',
      passwordPlaceholder: 'Votre mot de passe',
      adminLogin: 'Connexion',
      backToHome: 'Retour à l\'accueil',
      secureLogin: 'Connexion sécurisée'
    },
    en: {
      title: 'Care Center Login',
      subtitle: 'Connect to your management space',
      welcome: 'Welcome',
      welcomeSubtitle: 'Access your dashboard to manage children under your protection',
      email: 'Email address',
      password: 'Password',
      login: 'Sign In',
      loading: 'Signing in...',
      loginError: 'Login error',
      invalidCredentials: 'Invalid email or password',
      accessDenied: 'Access denied',
      notOrphanage: 'This account is not authorized to access this interface',
      accountNotVerified: 'Your account is not verified yet. Please contact administration.',
      emailPlaceholder: 'your.email@example.com',
      passwordPlaceholder: 'Your password',
      adminLogin: 'Login',
      backToHome: 'Back to home',
      secureLogin: 'Secure Login'
    }
  };

  const t = translations[language];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (userData?.role === 'orphelinat') {
          navigate('/orphelinat/dashboard');
        }
      }
    };

    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role, is_verified')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          throw new Error('Erreur lors de la vérification du compte');
        }

        if (userData.role !== 'orphelinat') {
          await supabase.auth.signOut();
          throw new Error(t.notOrphanage);
        }

        if (!userData.is_verified) {
          await supabase.auth.signOut();
          throw new Error(t.accountNotVerified);
        }

        toast({
          title: "Connexion réussie",
          description: "Redirection vers votre dashboard...",
        });

        navigate('/orphelinat/dashboard');
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      if (error.message === 'Invalid login credentials') {
        setError(t.invalidCredentials);
      } else {
        setError(error.message || t.loginError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header language={language} setLanguage={setLanguage} adminLoginText={t.adminLogin} />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl dark:bg-blue-900/20"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl dark:bg-purple-900/20"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Back to home button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-6 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToHome}
          </Button>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm dark:bg-slate-800/95 overflow-hidden">
            <CardHeader className="space-y-6 text-center pb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg backdrop-blur-sm">
                  <Heart className="w-10 h-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-white">{t.welcome}</CardTitle>
                  <CardDescription className="text-blue-100 text-base">
                    {t.welcomeSubtitle}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{t.secureLogin}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t.subtitle}</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-3 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg dark:text-red-400 dark:bg-red-950/50 dark:border-red-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t.email}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    required
                    className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t.password}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    required
                    className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      {t.loading}
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      {t.login}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer footer={{
        aboutText: language === 'fr' 
          ? "FCS facilite le recensement et le suivi des enfants vulnérables dans les centres d'accueil à travers la RDC."
          : "FCS facilitates the census and monitoring of vulnerable children in care centers across the DRC.",
        links: language === 'fr' ? "Liens utiles" : "Useful Links",
        privacy: language === 'fr' ? "Politique de confidentialité" : "Privacy Policy",
        terms: language === 'fr' ? "Conditions d'utilisation" : "Terms of Service",
        contact: "Contact",
        partners: language === 'fr' ? "Partenaires" : "Partners",
        partnersText: language === 'fr' 
          ? "En collaboration avec les institutions gouvernementales et les organisations internationales."
          : "In collaboration with government institutions and international organizations."
      }} />
    </div>
  );
};

export default OrphanageAuth;
