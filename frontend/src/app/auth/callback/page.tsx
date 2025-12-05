"use client";
import Loading from "@/components/Loading";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const AuthCallbackContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            // Store the token in cookies (matching the rest of the app)
            Cookies.set("token", token, {
                expires: 15,
                secure: false,
                path: "/",
            });
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
