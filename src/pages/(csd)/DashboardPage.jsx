import { useEffect, useState } from "react";
import Groq from "groq-sdk";
import Sidebar from "../../components/Sidebar";
import ScorePerCampusChart from "../../components/ScorePerCampusChart";
import BatStateUSDGScoreChart from "../../components/BatStateUSDGScoreChart";
import CampusScoreperSDGChart from "../../components/CampusScoreperSDGChart";
import CampusSDGScoreChart from "../../components/CampusSDGScorePage";

const groq = new Groq({
    apiKey: "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",
    dangerouslyAllowBrowser: true,
});

const DashboardPage = () => {
    const [sdOfficers, setSdOfficers] = useState([]);
    const [sdgs, setSdgs] = useState([
        { sdg_id: "SDG01", title: "No Poverty" },
        { sdg_id: "SDG02", title: "Zero Hunger" },
        // Add other SDGs here
    ]);
    const [selectedSdgId, setSelectedSdgId] = useState("SDG01");
    const [campusScores, setCampusScores] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [lowestScoreCampuses, setLowestScoreCampuses] = useState([]);
    const [recommendations, setRecommendations] = useState("");

    useEffect(() => {
        const getSDOfficers = async () => {
            try {
                const response = await fetch(
                    "http://localhost:9000/api/get/sd-office"
                );
                const jsonData = await response.json();
                setSdOfficers(jsonData);
            } catch (err) {
                console.error(err.message);
            }
        };
        getSDOfficers();
    }, []);

    const fetchInstruments = async (sdgId) => {
        try {
            const response = await fetch(
                `http://localhost:9000/api/get/sections/${sdgId}`
            );
            const instruments = await response.json();
            setInstruments(instruments); // Assuming instruments have campus scores
        } catch (error) {
            console.error("Error fetching instruments:", error);
        }
    };

    useEffect(() => {
        fetchInstruments(selectedSdgId);
    }, [selectedSdgId]);

    useEffect(() => {
        const identifyLowestScoreCampuses = async () => {
            if (campusScores.length === 0) return;

            // Filter campuses with scores below 40
            const lowScoreCampuses = campusScores.filter(
                (campus) => campus.score < 40
            );

            // If there are no campuses below 40, return
            if (lowScoreCampuses.length === 0) {
                setLowestScoreCampuses([]); // Reset the state if no campuses found
                return;
            }

            // Find the minimum score among those filtered campuses
            const scores = lowScoreCampuses.map((campus) => campus.score);
            const minScore = Math.min(...scores);

            // Get campuses that have the minimum score
            const campusesWithLowestScore = lowScoreCampuses.filter(
                (campus) => campus.score === minScore
            );

            setLowestScoreCampuses(campusesWithLowestScore);
        };

        identifyLowestScoreCampuses();
    }, [campusScores]);

    const fetchRecommendations = async (goals) => {
        const prompt = `Based on the following goals(section content): ${JSON.stringify(
            instruments
        )}, provide recommendations for improvement. base on lowes tscores  ${JSON.stringify(
            lowestScoreCampuses
        )}`;

        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama3-8b-8192",
                temperature: 1,
                max_tokens: 500,
            });

            // Accessing the response directly
            const responseContent =
                chatCompletion.choices[0]?.message?.content || "";
            setRecommendations(responseContent);
        } catch (error) {
            console.error("Error fetching recommendations:", error);
        }
    };

    useEffect(() => {
        const isScoreInRange = (score) => {
            return score >= 0 && score <= 40;
        };

        const goals = lowestScoreCampuses
            .filter((campus) => isScoreInRange(campus.score))
            .map((campus) => campus.section_content); // Adjusted to use section_content

        if (goals.length > 0) {
            fetchRecommendations(goals);
        }
    }, [lowestScoreCampuses]);

    return (
        <section className="h-screen flex">
            <Sidebar />
            <main className="h-full w-[80%] border overflow-auto">
                <div className="header py-5 px-7 flex justify-between items-center">
                    <h1 className="text-2xl text-gray-900">Dashboard</h1>
                    <select
                        name="sdg-selector"
                        id="sdg-selector"
                        className="border p-2 rounded"
                        value={selectedSdgId}
                        onChange={(e) => setSelectedSdgId(e.target.value)}
                    >
                        {sdgs.map((sdg) => (
                            <option key={sdg.sdg_id} value={sdg.sdg_id}>
                                {sdg.title}
                            </option>
                        ))}
                    </select>
                </div>
                <hr className="w-full border my-4" />
                <div className="flex gap-4 mb-4">
                    <ScorePerCampusChart setScores={setCampusScores} />
                    <BatStateUSDGScoreChart />
                </div>
                <div className="flex gap-4 mb-2">
                    <CampusScoreperSDGChart />
                    <CampusSDGScoreChart />
                </div>
                <div className="p-4">
                    {lowestScoreCampuses.length > 0 && (
                        <div className="p-4">
                            {lowestScoreCampuses.length > 0 && (
                                <div>
                                    <h2 className="text-lg">
                                        Campuses with Lowest Score:
                                    </h2>
                                    <ul>
                                        {lowestScoreCampuses.map((campus) => (
                                            <li key={campus.name}>
                                                {campus.name} - Score:{" "}
                                                {campus.score}
                                            </li>
                                        ))}
                                    </ul>

                                    <h3 className="text-lg mt-4">
                                        Recommendations:
                                    </h3>
                                    <div className="bg-gray-100 p-4 rounded h-fit w-[100%]">
                                        <pre>{recommendations}</pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </section>
    );
};

export default DashboardPage;
