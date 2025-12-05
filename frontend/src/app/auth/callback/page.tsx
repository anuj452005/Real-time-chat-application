"use client";
import Loading from "@/components/Loading";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import toast from "react-hot-toast";

const AuthCallbackContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            // Store the token in localStorage
            localStorage.setItem("token", JSON.stringify(token));
            toast.success("Successfully signed in with Google!");

            // Redirect to chat page
            router.push("/chat");
        } else {
            toast.error("Authentication failed. Please try again.");
            router.push("/login");
        }
    }, [searchParams, router]);

    return <Loading />;
};

const AuthCallbackPage = () => {
    return (
        <Suspense fallback={<Loading />}>
            <AuthCallbackContent />
        </Suspense>
    );
};

export default AuthCallbackPage;
