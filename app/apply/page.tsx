"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", dateOfBirth: "", gender: "",
    classAppliedFor: "", parentName: "", parentPhone: "", parentEmail: "",
    address: "", notes: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, dateOfBirth: new Date(form.dateOfBirth) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Submission failed");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-gray-500 text-sm">
              Thank you. Your admission application has been received. We will contact you via the phone number provided.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Student Admission Application</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the form below to apply for admission.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" value={form.firstName} onChange={set("firstName")} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" value={form.lastName} onChange={set("lastName")} required className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <select
                    id="gender"
                    value={form.gender}
                    onChange={set("gender")}
                    required
                    className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="classAppliedFor">Class Applied For *</Label>
                <Input id="classAppliedFor" placeholder="e.g. Grade 7, Form 1" value={form.classAppliedFor} onChange={set("classAppliedFor")} required className="mt-1" />
              </div>

              <hr />
              <p className="text-sm font-semibold text-gray-700">Parent / Guardian Information</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parentName">Parent / Guardian Name *</Label>
                  <Input id="parentName" value={form.parentName} onChange={set("parentName")} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="parentPhone">Phone Number *</Label>
                  <Input id="parentPhone" type="tel" value={form.parentPhone} onChange={set("parentPhone")} required className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="parentEmail">Email Address</Label>
                <Input id="parentEmail" type="email" value={form.parentEmail} onChange={set("parentEmail")} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="address">Home Address</Label>
                <Input id="address" value={form.address} onChange={set("address")} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={set("notes")}
                  rows={3}
                  className="mt-1 w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors resize-none"
                />
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Submitting…" : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
