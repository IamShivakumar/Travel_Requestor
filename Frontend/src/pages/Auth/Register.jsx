import React, { useState, useEffect } from 'react'
import backgroundImage from '../../assets/signup.jpg'
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useForm } from 'react-hook-form';


const Register = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();
  const password = watch("password");
  
  const onSubmit = async (data) => {
    try {
      const response = await axios.post("https://travel-requestor-backend.vercel.app/authenticate/register/", {...data});
      toast.success("Successfully Registered!");
      navigate('/login');
    } catch (error) {
      console.error("Error during registration:", error.response?.data);
      if (error.response && error.response.data.errors) {
        const errors = error.response.data.errors;
      if (errors) {
        Object.entries(errors).forEach(([field, msg]) => {
          toast.error(`${field}: ${Array.isArray(msg) ? msg.join(", ") : msg}`);
        });
      }
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex max-w-6xl bg-white rounded-lg shadow-lg w-full">
        {/* Left Section (Image) */}
        <div className="w-full md:w-1/2 h-auto">
          <img
            className="object-cover w-full h-full rounded-l-lg"
            src={backgroundImage}
            alt="Signup"
          />
        </div>
        {/* Right Section (Signup Form) */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-5xl font-bold text-center text-purple-600 mb-10">Trip-Tracker</h2>
          <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">Create an Account</h2>

          {/* Signup Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input
                type="text"
                id="username"
                placeholder="Username"
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <input
                type="email"
                id="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <input
                type="password"
                id="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm Password"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex flex-col items-center justify-between">
              {/* Left Button */}
              <button type='submit' className="w-full py-2 font-semibold text-white rounded bg-blue-500 hover:bg-blue-600">
                Register

              </button>

              {/* Center Text */}
              {/* <span className="text-lg">or</span> */}

              {/* Right Button */}
              {/* <button type='submit' className="w-full py-2 bg-red-500 font-semibold text-white rounded hover:bg-red-600">
                Sign-up with Google <FontAwesomeIcon icon={faGooglePlusG} />
              </button> */}
            </div>
          </form>

          <p className="text-lg text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-600">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register