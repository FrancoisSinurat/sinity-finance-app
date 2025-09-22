"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";

export default function LoginCard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setMessage("✅ Login berhasil!");
        window.location.href = "/dashboard";
      } else {
        setMessage("❌ " + (data.error || "Gagal login"));
      }
    } catch {
      setMessage("⚠️ Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full bg-gradient-to-br from-pink-100 via-pink-50 to-pink-100 px-4 rounded-lg">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border border-pink-200 rounded-2xl backdrop-blur bg-white/95">
          <CardHeader className="pb-2 text-center">
            <h2 className="text-3xl font-bold text-pink-700">Welcome Back 👋</h2>
            <p className="text-sm text-pink-500 mt-1">
              Masuk ke akun kamu untuk melanjutkan
            </p>
          </CardHeader>

          <CardContent className="px-6 py-4">
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-pink-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border border-pink-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-pink-400 w-5 h-5" />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full border border-pink-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                  required
                />
              </div>

              {/* Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-xl shadow-lg transition-all"
              >
                {loading ? "Loading..." : "Login"}
              </Button>
            </form>

            {/* Message */}
            {message && (
              <p
                className={`text-sm text-center mt-4 ${
                  message.includes("✅")
                    ? "text-green-600"
                    : message.includes("❌")
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {message}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
