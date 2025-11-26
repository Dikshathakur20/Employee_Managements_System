import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '@/contexts/LoginContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import axiosClient from "@/utils/axiosClient";   // <-- USING THIS NOW

const API_BASE = '/admins'; // axiosClient already has baseURL

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [showCodeStep, setShowCodeStep] = useState(false);
  const [redirected, setRedirected] = useState(false);

  const { login, user } = useLogin();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !redirected) {
      setRedirected(true);
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate, redirected]);

  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|info|org|net|co|io)$/;
    return regex.test(email);
  };

  // -------------------------
  // LOGIN USING axiosClient
  // -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast({ title: 'Invalid Email', description: 'Enter a valid email', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.post(`${API_BASE}/login`, {
        email,
        password,
      });

      const data = res.data;

      localStorage.setItem('token', data.token);
      await login(email, password);

      toast({ title: 'Login Success', description: `Welcome ${data.admin.user_name}` });
    } catch (err: any) {
      toast({
        title: 'Login Error',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // SIGNUP USING axiosClient
  // -------------------------
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosClient.post(`${API_BASE}`, {
        email,
        password,
        user_name: email,
        role: "admin"
      });

      toast({ title: 'Signup Success', description: 'Admin account created.' });
      setShowSignup(false);
    } catch (err: any) {
      toast({
        title: 'Signup Error',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 relative">
      
      <button onClick={() => navigate('/')} className="absolute top-6 left-6 flex items-center gap-2 h-12">
        <img src="/logo.png" alt="Company Logo" className="h-full w-auto" />
      </button>

      <h1 className="text-blue-700 text-3xl font-bold mb-8">Admin Portal</h1>

      <Card className="w-full max-w-md shadow-2xl rounded-3xl min-h-[440px]">

        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {showSignup ? 'Sign Up' : 'Login'}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            {showSignup ? 'Create an admin account.' : 'Enter your credentials.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 mt-4">
          <form onSubmit={showSignup ? handleSignup : handleSubmit}>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <div className="flex justify-center mt-6">
              <Button disabled={loading} className="w-64 bg-[#001F7A] text-white">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : showSignup ? 'Create Account' : 'Sign In'}
              </Button>
            </div>

            <div className="mt-2 text-center">
              {showSignup ? (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setShowSignup(false); }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Back to Login
                </a>
              ) : (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setShowCodeStep(true); }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Don’t have an account? Sign Up
                </a>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {showCodeStep && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h2 className="text-lg font-semibold text-center text-gray-800 mb-3">Admin Code Verification</h2>
            <Input
              type="password"
              placeholder="Enter Admin Code"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-between">
              <Button className="bg-gray-400 text-white" onClick={() => { setShowCodeStep(false); setAdminCode(''); }}>
                Cancel
              </Button>
              <Button
                className="bg-[#001F7A] text-white"
                onClick={() => {
                  if (adminCode === 'admin@123') {
                    toast({ title: 'Access Granted', description: 'You may now sign up.' });
                    setShowCodeStep(false);
                    setShowSignup(true);
                  } else {
                    toast({ title: 'Access Denied', description: 'Invalid admin code.', variant: 'destructive' });
                  }
                }}
              >
                Verify
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
