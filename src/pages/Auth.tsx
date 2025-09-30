import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  displayName: z.string().optional(),
});

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const { signIn, signUp, user, resendConfirmation } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for email confirmation
    const type = searchParams.get('type');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (type === 'signup' && !error) {
      setConfirmationMessage('Email confirmado com sucesso! Você já pode fazer login.');
      toast({
        title: "Email Confirmado",
        description: "Sua conta foi ativada com sucesso!",
      });
    } else if (error) {
      toast({
        title: "Erro na Confirmação",
        description: errorDescription || "Erro ao confirmar email",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (user && user.email_confirmed_at) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      authSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let result;
      if (activeTab === 'login') {
        result = await signIn(formData.email, formData.password);
        
        if (result.error) {
          toast({
            title: "Erro",
            description: result.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sucesso",
            description: 'Login realizado com sucesso!',
          });
        }
      } else {
        result = await signUp(formData.email, formData.password, formData.displayName);
        
        if (result.error) {
          toast({
            title: "Erro",
            description: result.error,
            variant: "destructive",
          });
        } else {
          setEmailSent(true);
          setFormData({ email: '', password: '', displayName: '' });
          toast({
            title: "Conta Criada",
            description: "Verifique seu email para confirmar sua conta!",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      toast({
        title: "Email necessário",
        description: "Digite seu email para reenviar a confirmação",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await resendConfirmation(formData.email);
      if (result.error) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email Reenviado",
          description: "Verifique sua caixa de entrada!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao reenviar email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Voltar ao Site
            </h1>
          </Link>
        </div>

        <Card className="border-border/50 shadow-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {emailSent ? 'Verifique seu Email' : (activeTab === 'login' ? 'Entrar' : 'Criar Conta')}
            </CardTitle>
            <CardDescription>
              {emailSent 
                ? 'Enviamos um link de confirmação para seu email'
                : (activeTab === 'login' 
                  ? 'Acesse sua conta para continuar' 
                  : 'Crie sua conta para começar')
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {confirmationMessage && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{confirmationMessage}</AlertDescription>
              </Alert>
            )}

            {emailSent ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Enviamos um email de confirmação para:
                  </p>
                  <p className="font-medium">{formData.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Clique no link do email para ativar sua conta
                  </p>
                </div>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={handleResendConfirmation}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Reenviando...' : 'Reenviar Email'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setEmailSent(false);
                      setActiveTab('login');
                    }}
                    className="w-full"
                  >
                    Voltar ao Login
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Cadastro</TabsTrigger>
                </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Sua senha"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? 'border-destructive' : ''}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nome</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      type="text"
                      placeholder="Seu nome"
                      value={formData.displayName}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Sua senha (min. 6 caracteres)"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? 'border-destructive' : ''}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;