import React from 'react';
import {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {

  const [formData, setFormData] = useState({
    email:'',
    password:''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData, [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if(!formData.email.includes('@')){
      setError('Invalid email!');
      return;
    }
    
    if(formData.password.length < 6){
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      console.log("Sending data: ", formData);

      const response = await fetch('http://localhost:3000/api/auth/login',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: formData.email, 
          password: formData.password
        })
      });

      const data = await response.json();

      if(response.ok){
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert("Login successfully!");
        if(data.user.role == "USER") navigate('/afterlogin');
        else navigate('/admin');
      }
      else{
        alert(data.message || "Login failed!");
      }
    }
    catch(error) {
      console.error("Error: ", error);
    }
    finally {
      setLoading(false);
    }

  };

  return (
   
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      
      {/* Container chính*/}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/*Header*/}
        <div className="p-8 pb-0">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-500">Please log in to continue!</p>
        </div>

        <div className="p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  name="email"
                  type="email" 
                  required
                  onChange={handleChange}
                  value={formData.email}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-xs font-bold text-indigo-600 hover:underline underline-offset-4">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  name="password"
                  type="password" 
                  required
                  onChange={handleChange}
                  value={formData.password}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-2xl shadow-lg shadow-yellow-200 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-4">
              {loading ? "Please wait..." : "Log in" }<ArrowRight size={20} />
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <span className="relative px-4 bg-white text-gray-400 text-sm">Or</span>
          </div>

          {/* Đăng nhập bằng bên thứ 3 */}
          {/* <button className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <Github size={20} /> Github
          </button> */}
        </div>

        {/*Footer*/}
        <div className="p-6 bg-gray-50 text-center border-t border-gray-100">
          <p className="text-gray-600">
            Haven't had an account yet?{' '}
            <Link to="/signup" className="text-indigo-600 font-bold hover:underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;