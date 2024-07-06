import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default async function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-y-12">
      <h1 className="font-bold text-4xl">Cloud Storage</h1>
      <div className="flex gap-x-8">
        <LoginLink className="px-4 py-2 text-xl rounded-md bg-black text-white">Sign in</LoginLink>
        <RegisterLink className="px-4 py-2 text-xl rounded-md bg-black text-white">Sign up</RegisterLink>
      </div>
    </main>
  );
}
