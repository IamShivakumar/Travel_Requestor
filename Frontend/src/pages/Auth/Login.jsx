import React, { useState, useEffect } from 'react'
import backgroundImage from '../../assets/login.jpg'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { setUser } from '../../redux/slices/userSlice';
import LoadingModal from '../../components/LoadingModal';


const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post("https://travel-requestor-backend.vercel.app/authenticate/login/", { ...data, isAdmin});
      const { access_token, refresh_token, user } = response.data;
      dispatch(setUser({ user: user }))
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem('loggedIn', true)
      localStorage.setItem('is_adminUser', user.is_admin)
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      toast.success("Successfully Logged In!");
      if (user.is_admin) {
        console.log("Navigating to admin panel")
        navigate("/RequestListing");
      } else {
        console.log("Navigating to Employee panel")
        navigate("/TravelRegister");
      }
    } catch (error) {
      console.error("Error during Logging in:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }finally {
      setIsLoading(false);
    }
  };
  return (
  <>
  <LoadingModal isOpen={isLoading}/>
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex max-w-6xl bg-white rounded-lg shadow-lg w-full">
        {/* Left Section (Image) */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-5xl font-bold text-center text-purple-600 mb-10">Trip-Tracker</h2>
          <div className="flex justify-center space-x-4 mb-6">
            <button
              type="button"
              className={`px-4 py-2 rounded ${!isAdmin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setIsAdmin(false)}
            >
              Login as Employee
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded ${isAdmin ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setIsAdmin(true)}
            >
              Login as Admin
            </button>
          </div>
          <form key={isAdmin ? "admin" : "user"} className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input
                type="email"
                id="email"
                placeholder="Email"
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <input
                type="password"
                id="password"
                placeholder="Password"
                {...register("password", { required: "Password is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && <p className="text-red-600">{errors.password.message}</p>}
            </div>
            <div className="flex flex-col items-center justify-between">
              {/* Left Button */}
              <button type='submit' className="w-full py-2 bg-blue-500 font-semibold text-white rounded hover:bg-blue-600">
                Sign-In
              </button>
            </div>
          </form>
          <p className="text-lg text-center text-gray-600 mt-4">
            New to CareerTrek?{' '}
            <Link to="/signup" className="text-blue-500 hover:text-blue-600">
              Register here
            </Link>
          </p>

        </div>
        {/* Right Section (Signup Form) */}
        <div className="w-full md:w-1/2 h-auto">
          <img
            className="object-cover w-full h-full rounded-l-lg"
            src={backgroundImage}
            alt="Signup"
          />
        </div>
      </div>
    </div>
    </>
  )
}

export default Login