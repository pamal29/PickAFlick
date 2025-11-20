import React from "react";

export default function Login() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center text-white px-4"
      style={{
        backgroundImage:
          "url('/loginbg.jpg')",
      }}
    >
      <div className="w-full max-w-md bg-black/70 backdrop-blur-md border-4 rounded-xl p-10">
        
        <p className="text-center text-5xl font-bold">Login</p>

        <form className="mt-8 space-y-6">

          <div className="text-xl">
            <label htmlFor="username" className="mb-1 block">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-4 outline-none focus:border-white"
            />
          </div>

          <div className="text-xl">
            <label htmlFor="password" className="mb-1 block">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-4 outline-none focus:border-white"
            />

            <div className="text-right mt-2">
              <a href="#" className="text-gray-300 text-sm hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-neongreen text-gray-900 font-semibold py-4 rounded-md hover:scale-105 transition"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-gray-300 mt-6">
          Don't have an account?{" "}
          <a href="#" className="text-white hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
