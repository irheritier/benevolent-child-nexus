
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, LogIn, AlertCircle, Shield, ArrowLeft, Users, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { useLanguage } from '@/hooks/useLanguage';

const PartnerAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();

  const translations = {
    fr: {
      title: 'Portail Partenaire',
      subtitle: 'Connectez-vous à votre espace partenaire',
      welcome: 'Bienvenue',
      welcomeSubtitle: 'Accédez aux données et statistiques des centres d\'accueil',
      email: 'Adresse e-mail',
      password: 'Mot de passe',
      login: 'Se connecter',
      loading: 'Connexion...',
      loginError: 'Erreur de connexion',
      invalidCredentials: 'Email ou mot de passe incorrect',
      accessDenied: 'Accès refusé',
      notPartner: 'Ce compte n\'est pas autorisé à accéder au portail partenaire',
      emailPlaceholder: 'votre.email@exemple.com',
      passwordPlaceholder: 'Votre mot de passe',
      adminLogin: 'Connexion',
      backToHome: 'Retour à l\'accueil',
      secureLogin: 'Connexion sécurisée',
      requestAccess: 'Demander l\'accès',
      noAccount: 'Pas encore de compte ?'
    },
    en: {
      title: 'Partner Portal',
      subtitle: 'Connect to your partner space',
      welcome: 'Welcome',
      welcomeSubtitle: 'Access data and statistics from care centers',
      email: 'Email address',
      password: 'Password',
      login: 'Sign In',
      loading: 'Signing in...',
      loginError: 'Login error',
      invalidCredentials: 'Invalid email or password',
      accessDenied: 'Access denied',
      notPartner: 'This account is not authorized to access the partner portal',
      emailPlaceholder: 'your.email@example.com',
      passwordPlaceholder: 'Your password',
      adminLogin: 'Login',
      backToHome: 'Back to home',
      secureLogin: 'Secure Login',
      requestAccess: 'Request access',
      noAccount: 'No account yet?'
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

        if (userData?.role === 'partner') {
          navigate('/partner/dashboard');
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
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          throw new Error('Erreur lors de la vérification du compte');
        }

        if (userData.role !== 'partner') {
          await supabase.auth.signOut();
          throw new Error(t.notPartner);
        }

        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans le portail partenaire !",
        });

        navigate('/partner/dashboard');
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header language={language} setLanguage={setLanguage} adminLoginText={t.adminLogin} />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl dark:bg-purple-900/20"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl dark:bg-blue-900/20"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Back to home button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-6 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToHome}
          </Button>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm dark:bg-slate-800/95 overflow-hidden">
            <CardHeader className="space-y-6 text-center pb-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90"></div>
              <div className="relative z-10">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold text-white">{t.welcome}</CardTitle>
                  <CardDescription className="text-purple-100 text-base">
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
                    className="h-12 border-slate-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-slate-700"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t.password}
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      required
                      className="h-12 border-slate-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-slate-700 pr-12"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-12 w-12 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-200"
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

              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t.noAccount}{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
                    onClick={() => navigate('/partner/request')}
                  >
                    {t.requestAccess}
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer footer={{
        aboutText: language === 'fr' 
          ? "FCTS facilite le recensement et le suivi des enfants vulnérables dans les centres d'accueil à travers la RDC."
          : "FCTS facilitates the census and monitoring of vulnerable children in care centers across the DRC.",
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

export default PartnerAuth;
