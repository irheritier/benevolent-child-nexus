
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Heart, LogIn, UserPlus, Shield, Settings, Lock } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

const AdminAuthContent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('User authenticated:', data.user.id);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, email')
        .eq('id', data.user.id)
        .maybeSingle();

      console.log('User data from database:', userData, 'Error:', userError);

      if (userError) {
        console.error('Error fetching user data:', userError);
        toast({
          title: "Erreur de vérification",
          description: "Impossible de vérifier vos droits d'accès.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      if (!userData) {
        console.log('No user data found, checking if user needs to be created in public.users');
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            role: 'admin',
            is_verified: true
          });

        if (insertError) {
          console.error('Error creating user in public.users:', insertError);
          await supabase.auth.signOut();
          toast({
            title: "Accès refusé",
            description: "Votre compte n'est pas configuré comme administrateur.",
            variant: "destructive",
          });
          return;
        }

        console.log('User created in public.users with admin role');
      } else if (userData.role !== 'admin') {
        await supabase.auth.signOut();
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administrateur.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans l'interface d'administration.",
      });

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Unexpected error during login:', error);
      toast({
        title: "Erreur inattendue",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Creating admin account for:', email);
      
      const { data, error } = await supabase.rpc('create_user_account', {
        user_email: email,
        user_password: password,
        user_role: 'admin'
      });

      console.log('Account creation result:', data, 'Error:', error);

      if (error) {
        toast({
          title: "Erreur de création de compte",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Compte créé avec succès",
        description: "Votre compte administrateur a été créé. Vous pouvez maintenant vous connecter.",
      });

      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      toast({
        title: "Erreur inattendue",
        description: "Une erreur est survenue lors de la création du compte.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl dark:bg-blue-600/10"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl dark:bg-purple-600/10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/5 to-purple-200/5 rounded-full blur-3xl dark:from-blue-800/5 dark:to-purple-800/5"></div>
      </div>

      {/* Header */}
      <header onClick={() => navigate('/')} className="relative z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/50 dark:bg-slate-900/80 dark:border-slate-700/50 cursor-pointer ">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
          <div 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <img 
              src="/lovable-uploads/feae4376-f2cd-46a4-a3ec-d82ff5875eab.png" 
              alt="FCTS - Find The Children To Save"
              className="h-8 sm:h-12 md:h-14 w-auto object-contain"
            />
          </div>
            {/* <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                FCTS : Find The Children To Save
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold tracking-wide uppercase">
                Portail Administrateur
              </p>
            </div> */}
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl mb-6">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Administration Sécurisée
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Accédez au portail d'administration FCTS
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-slate-700"
              >
                Connexion
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-slate-700"
              >
                Créer un compte
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
                <CardHeader className="space-y-4 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <LogIn className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      Connexion Administrateur
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                      Saisissez vos identifiants pour accéder au tableau de bord administrateur
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Adresse e-mail
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@exemple.com"
                        className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Mot de passe
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Votre mot de passe"
                        className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transform hover:scale-[1.02] transition-all duration-200" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Connexion...
                        </>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5 mr-2" />
                          Se connecter
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
                <CardHeader className="space-y-4 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      Nouveau Compte Admin
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                      Créez votre compte administrateur pour gérer la plateforme
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Adresse e-mail
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@exemple.com"
                        className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Mot de passe
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Minimum 6 caractères"
                        className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Confirmer le mot de passe
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Confirmez votre mot de passe"
                        className="h-12 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg transform hover:scale-[1.02] transition-all duration-200" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Création...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          Créer le compte
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Connexion sécurisée
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Vos données sont protégées par un chiffrement de bout en bout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminAuth = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AdminAuthContent />
    </ThemeProvider>
  );
};

export default AdminAuth;
