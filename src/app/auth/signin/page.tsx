import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/sign-in-form";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-marketing">
      <div className="flex flex-col items-center gap-8 p-8">
        <div className="h-16 w-16 rounded-2xl bg-brand-indigo flex items-center justify-center">
          <span className="text-white font-bold text-2xl">R2</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-medium text-text-primary" style={{ letterSpacing: "-0.704px" }}>R2 Files</h1>
          <p className="text-text-tertiary mt-2">个人文件管理系统</p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
