"use client";
import Loading from "@/components/Loading";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useAppData } from "@/context/AppContext";

const AuthCallbackContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser, setIsAuth, fetchChats, fetchUsers } = useAppData();
    const hasProcessed = useRef(false);

    useEffect(() => {
        const handleAuth = async () => {
            // Prevent running multiple times
            if (hasProcessed.current) return;
            hasProcessed.current = true;

            const token = searchParams.get("token");

            if (token) {
                // Store the token in cookies (matching the rest of the app)
                Cookies.set("token", token, {
                    expires: 15,
                    secure: false,
                    path: "/",
                });

                // Fetch user data and update context
                try {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:5000"}/api/v1/me`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                        setIsAuth(true);

                        // Fetch chats and users
                        await Promise.all([fetchChats(), fetchUsers()]);

                        toast.success("Successfully signed in with Google!");
                        router.push("/chat");
                    } else {
                        throw new Error("Failed to fetch user data");
                    }
                } catch (error) {
                    console.error("Auth error:", error);
                    toast.error("Authentication failed. Please try again.");
                    router.push("/login");
                }
            } else {
                toast.error("Authentication failed. Please try again.");
                router.push("/login");
            }
        };

        handleAuth();
    }, [searchParams, router, setUser, setIsAuth, fetchChats, fetchUsers]);

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
