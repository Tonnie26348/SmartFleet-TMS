import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await supabase.auth.signInWithPassword({ email, password });
    } else {
      await supabase.auth.signUp({ email, password });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleAuth} className="p-8 border rounded shadow-md w-96">
        <h2 className="text-xl mb-4">{isLogin ? 'Login' : 'Register'}</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-2 border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          {isLogin ? 'Login' : 'Register'}
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-sm text-blue-500 underline"
        >
          {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
      </form>
    </div>
  );
};
