
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, LogIn, AlertCircle } from 'lucide-react';
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
      adminLogin: 'Connexion Administrateur'
    },
    en: {
      title: 'Care Center Login',
      subtitle: 'Connect to your management space',
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
      adminLogin: 'Administrator Login'
    }
  };

  const t = translations[language];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Vérifier le rôle de l'utilisateur
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
        // Vérifier le rôle et le statut de l'utilisateur
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Header language={language} setLanguage={setLanguage} adminLoginText={t.adminLogin} />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur">
          <CardHeader className="space-y-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-primary">{t.title}</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {t.subtitle}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  {t.email}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  {t.password}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  required
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    {t.loading}
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    {t.login}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer footer={{
        aboutText: language === 'fr' 
          ? "Congo ChildNet facilite le recensement et le suivi des enfants vulnérables dans les centres d'accueil à travers la RDC."
          : "Congo ChildNet facilitates the census and monitoring of vulnerable children in care centers across the DRC.",
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
