"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve URL parameters when redirecting
    const params = searchParams.toString();
    const redirectUrl = params ? `/home?${params}` : '/home';
    router.replace(redirectUrl);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
    </div>
  );
}
