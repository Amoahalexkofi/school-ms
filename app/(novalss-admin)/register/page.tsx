"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";

const NOVALSS_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "novalss.com";

export default function RegisterPage() {
  const [step, setStep]       = useState<"form" | "provisioning" | "done">("form");
  const [error, setError]     = useState("");
  const [school, setSchool]   = useState<any>(null);
  const [form, setForm]       = useState({
    name: "", subdomain: "", adminEmail: "", adminPassword: "", confirmPassword: "", adminName: "", phone: "",
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  // Auto-suggest subdomain from school name
  function onNameChange(v: string) {
    setForm(f => ({
      ...f,
      name: v,
      subdomain: f.subdomain || v.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20),
    }));
  }

  async function submit() {
    if (!form.name || !form.subdomain || !form.adminEmail || !form.adminPassword) {
      setError("All required fields must be filled"); return;
    }
    if (form.adminPassword !== form.confirmPassword) {
      setError("Passwords do not match"); return;
    }
    if (form.adminPassword.length < 8) {
      setError("Password must be at least 8 characters"); return;
    }
    setError(""); setStep("provisioning");

    try {
      const res = await fetch("/api/admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          subdomain: form.subdomain,
          adminEmail: form.adminEmail,
          adminPassword: form.adminPassword,
          adminName: form.adminName,
          phone: form.phone,
          plan: "trial",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed"); setStep("form"); return; }
      setSchool(data);
      setStep("done");
    } catch { setError("Network error. Please try again."); setStep("form"); }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Start your free trial</h1>
          <p className="text-gray-500 mt-1">30 days free · No credit card required · Setup in 60 seconds</p>
        </div>

        {step === "done" && school ? (
          /* Success screen */
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your school is ready!</h2>
            <p className="text-gray-500">
              <strong>{school.name}</strong> has been set up successfully.
            </p>
            <div className="bg-blue-50 rounded-xl p-4 text-left space-y-2">
              <p className="text-sm font-semibold text-blue-800">Your school URL:</p>
              <a
                href={`https://${school.subdomain}.${NOVALSS_DOMAIN}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-mono text-sm hover:underline flex items-center gap-1"
              >
                {school.subdomain}.{NOVALSS_DOMAIN} <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <p className="text-xs text-gray-500 mt-2">Login with: <strong>{form.adminEmail}</strong></p>
            </div>
            <a href={`https://${school.subdomain}.${NOVALSS_DOMAIN}`} target="_blank" rel="noopener noreferrer">
              <Button className="w-full mt-2">
                Go to my school portal <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </a>
            <p className="text-xs text-gray-400">
              Note: DNS propagation may take a few minutes. If the URL doesn&apos;t work immediately, try again in 2-3 minutes.
            </p>
          </div>
        ) : step === "provisioning" ? (
          /* Provisioning screen */
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
            <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Setting up your school…</h2>
            <p className="text-gray-500">Creating your private database, setting up your portal and admin account.</p>
            <div className="space-y-2 text-sm text-gray-400 text-left bg-gray-50 rounded-xl p-4">
              <p>✓ Allocating dedicated database schema</p>
              <p>✓ Creating tables and initial data</p>
              <p className="animate-pulse">⟳ Creating your admin account…</p>
            </div>
          </div>
        ) : (
          /* Registration form */
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
            <div className="space-y-4">
              <div>
                <Label>School Name *</Label>
                <Input
                  value={form.name}
                  onChange={e => onNameChange(e.target.value)}
                  placeholder="e.g. Sunshine Academy"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Your School URL *</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={form.subdomain}
                    onChange={e => set("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="sunshine"
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">.{NOVALSS_DOMAIN}</span>
                </div>
                {form.subdomain && (
                  <p className="text-xs text-blue-600 mt-1">
                    Your portal: <strong>{form.subdomain}.{NOVALSS_DOMAIN}</strong>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Your Full Name</Label>
                  <Input value={form.adminName} onChange={e => set("adminName", e.target.value)} placeholder="Dr. Kwame Mensah" className="mt-1" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+233 XX XXX XXXX" className="mt-1" />
                </div>
              </div>

              <div>
                <Label>Admin Email *</Label>
                <Input type="email" value={form.adminEmail} onChange={e => set("adminEmail", e.target.value)} placeholder="you@yourschool.edu.gh" className="mt-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Password *</Label>
                  <Input type="password" value={form.adminPassword} onChange={e => set("adminPassword", e.target.value)} placeholder="Min. 8 characters" className="mt-1" />
                </div>
                <div>
                  <Label>Confirm Password *</Label>
                  <Input type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="Repeat password" className="mt-1" />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button className="w-full" onClick={submit}>
              Start Free Trial — 30 Days <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>

            <p className="text-xs text-center text-gray-400">
              By registering you agree to our Terms of Service and Privacy Policy.
              <br />Already have an account?{" "}
              <a href="/sign-in" className="text-blue-600 hover:underline">Sign in</a>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
