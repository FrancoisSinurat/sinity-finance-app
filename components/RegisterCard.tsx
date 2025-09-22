"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegisterCard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Password dan konfirmasi tidak sama");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setMessage("✅ Register berhasil!");
      } else {
        setMessage("❌ " + (data.error || "Gagal register"));
      }
    } catch {
      setMessage("⚠️ Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br px-5 py-5 from-slate-100 to-slate-200">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border border-slate-200 rounded-2xl backdrop-blur bg-white/90">
          <CardHeader className="pb-2 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              Register
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Buat akun baru untuk melanjutkan
            </p>
          </CardHeader>

          <CardContent className="px-6">
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nama"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow"
              >
                {loading ? "Loading..." : "Register"}
              </Button>
            </form>

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

          <CardFooter className="flex justify-center py-4">
            <p className="text-sm text-slate-500">
              Sudah punya akun?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Login
              </a>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
