import { headers } from "next/headers";
import { GraduationCap } from "lucide-react";
import { SignInPage } from "@/components/SignInPage";

export default async function SignInRoute() {
  const h = await headers();
  const tenant = h.get("x-novalss-host") ?? h.get("host") ?? "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Skula</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your school</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <SignInPage tenant={tenant} />
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by <span className="font-semibold text-gray-500">Skula</span> · a <a href="https://novalss.com" className="hover:underline">Novalss</a> product
        </p>
      </div>
    </div>
  );
}
