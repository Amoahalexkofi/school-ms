"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const GATEWAYS = [
  {
    key: "paystack",
    label: "Paystack",
    logo: "https://website-v3-assets.s3.amazonaws.com/assets/img/hero/Paystack-mark-white-twitter.png",
    color: "#00C3F7",
    fields: ["apiSecretKey", "apiPublishableKey"],
    labels: { apiSecretKey: "Secret Key (sk_...)", apiPublishableKey: "Public Key (pk_...)" },
    docs: "https://support.paystack.com/hc/en-us/articles/360009881600-Paystack-Test-Keys",
  },
  {
    key: "flutterwave",
    label: "Flutterwave",
    logo: null,
    color: "#F5A623",
    fields: ["apiSecretKey", "apiPublishableKey"],
    labels: { apiSecretKey: "Secret Key (FLWSECK_...)", apiPublishableKey: "Public Key (FLWPUBK_...)" },
    docs: "https://developer.flutterwave.com/docs/integration-guides/authentication",
  },
];

type Gateway = {
  id: string;
  paymentType: string;
  apiSecretKey: string | null;
  apiPublishableKey: string | null;
  isActive: boolean;
  isSandbox: boolean;
  chargeType: string | null;
  chargeValue: string | null;
};

export function PaymentGatewayClient({ gateways: initial }: { gateways: Gateway[] }) {
  const router = useRouter();
  const [gateways, setGateways] = useState<Gateway[]>(initial);
  const [saving, setSaving]     = useState<string | null>(null);
  const [saved,  setSaved]      = useState<string | null>(null);
  const [error,  setError]      = useState<string | null>(null);
  const [showKey, setShowKey]   = useState<Record<string, boolean>>({});

  const getValue = (type: string, field: keyof Gateway) => {
    const g = gateways.find(g => g.paymentType === type);
    return (g?.[field] ?? "") as string;
  };

  const setValue = (type: string, field: keyof Gateway, val: string | boolean) => {
    setGateways(prev => {
      const exists = prev.find(g => g.paymentType === type);
      if (exists) return prev.map(g => g.paymentType === type ? { ...g, [field]: val } : g);
      return [...prev, { id: "", paymentType: type, apiSecretKey: null, apiPublishableKey: null, isActive: false, isSandbox: true, chargeType: null, chargeValue: null, [field]: val } as any];
    });
  };

  async function handleSave(type: string) {
    const g = gateways.find(x => x.paymentType === type);
    setSaving(type); setSaved(null); setError(null);
    try {
      const res = await fetch(g?.id ? `/api/payment-gateways/${g.id}` : "/api/payment-gateways", {
        method:  g?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...g, paymentType: type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGateways(prev => {
        const exists = prev.find(x => x.paymentType === type);
        if (exists) return prev.map(x => x.paymentType === type ? { ...x, ...data } : x);
        return [...prev, data];
      });
      setSaved(type);
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(null); }
  }

  return (
    <main className="flex-1 p-6 max-w-3xl space-y-6 bg-[#0f1015]">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>

      <div>
        <h1 className="text-lg font-semibold text-white/80">Payment Gateway</h1>
        <p className="text-sm text-white/40 mt-0.5">Configure online fee payment. Only one gateway can be active at a time.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {GATEWAYS.map(def => {
        const g    = gateways.find(x => x.paymentType === def.key);
        const isOn = g?.isActive ?? false;
        const sandbox = g?.isSandbox ?? true;

        return (
          <Card key={def.key} className={isOn ? "border-blue-300 shadow-sm" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: def.color }}>
                    {def.label.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{def.label}</CardTitle>
                    {isOn && <span className="text-xs text-emerald-400 font-medium">● Active{sandbox ? " (Sandbox)" : " (Live)"}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" className="w-4 h-4 accent-blue-600"
                      checked={sandbox}
                      onChange={e => setValue(def.key, "isSandbox", e.target.checked)} />
                    Sandbox
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" className="w-4 h-4 accent-blue-600"
                      checked={isOn}
                      onChange={e => setValue(def.key, "isActive", e.target.checked)} />
                    Active
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {def.fields.map(field => {
                const label = (def.labels as any)[field] ?? field;
                const val   = getValue(def.key, field as keyof Gateway);
                const show  = showKey[`${def.key}_${field}`];
                return (
                  <div key={field}>
                    <label className="block text-sm font-medium text-white/60 mb-1">{label}</label>
                    <div className="relative">
                      <Input
                        type={show ? "text" : "password"}
                        value={val}
                        onChange={e => setValue(def.key, field as keyof Gateway, e.target.value)}
                        placeholder={`Enter ${label}`}
                        className="pr-10"
                      />
                      <button type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50"
                        onClick={() => setShowKey(s => ({ ...s, [`${def.key}_${field}`]: !s[`${def.key}_${field}`] }))}>
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-1">
                <a href={def.docs} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline">
                  Get API keys →
                </a>
                <div className="flex items-center gap-2">
                  {saved === def.key && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                    </span>
                  )}
                  <Button size="sm" disabled={saving === def.key} onClick={() => handleSave(def.key)}>
                    <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                    {saving === def.key ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </main>
  );
}
