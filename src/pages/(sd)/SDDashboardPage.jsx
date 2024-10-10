import { useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { validateToken } from "../../services/service";

const SDDashboardPage = () => {
    useEffect(() => {
        const runValidation = async () => {
            try {
                const isVerified = await validateToken();
                if (
                    !isVerified ||
                    localStorage.getItem("role").toString() !== "1"
                ) {
                    window.location.href = "/login";
                }
            } catch (error) {
                console.error("Error during token validation:", error);
                return {
                    error: "An error occurred during token validation.",
                };
            }
        };
        runValidation();
    }, []);

    return (
        <section className="h-screen flex">
            <Sidebar />
            <main className="h-full w-[80%] border overflow-auto">
                <div className="header py-5 px-7 flex justify-between items-center">
                    <h1 className="text-2xl text-gray-900">SD Office</h1>
                </div>
                <hr />
                <div className="py-5 px-7"></div>
            </main>
        </section>
    );
};

export default SDDashboardPage;
