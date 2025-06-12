
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Heart, LogIn, UserPlus } from 'lucide-react';

const AdminAuth = () => {
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

      // Attendre un peu pour que les données soient synchronisées
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vérifier si l'utilisateur est admin avec une requête plus robuste
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
        // Si l'utilisateur n'existe pas dans public.users, essayer de le créer
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
      
      // Utiliser la fonction SQL pour créer un compte admin
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

      // Rediriger vers l'onglet de connexion
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary">Congo ChildNet</h1>
          <p className="text-muted-foreground">Administration</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Créer un compte</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Connexion Admin
                </CardTitle>
                <CardDescription>
                  Connectez-vous à votre compte administrateur pour gérer les demandes d'inscription.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@exemple.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Créer un compte Admin
                </CardTitle>
                <CardDescription>
                  Créez votre compte administrateur pour gérer la plateforme.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@exemple.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Création..." : "Créer le compte"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground"
          >
            ← Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
