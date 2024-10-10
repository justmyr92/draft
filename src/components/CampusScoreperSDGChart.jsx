import { useState, useEffect } from "react";
import { BarChart, Card } from "@tremor/react";

const CampusScoreperSDGChart = () => {
    const [scores, setScores] = useState([]);

    const [selectedCampus, setSelectedCampus] = useState(null);
    // const [selectedSDG]
    const [sdgs, setSdgs] = useState([
        { sdg_id: "SDG01", no: 1, title: "No Poverty", color: "#E5243B" },
        { sdg_id: "SDG02", no: 2, title: "Zero Hunger", color: "#DDA63A" },
        {
            sdg_id: "SDG03",
            no: 3,
            title: "Good Health and Well-being",
            color: "#4C9F38",
        },
        {
            sdg_id: "SDG04",
            no: 4,
            title: "Quality Education",
            color: "#C5192D",
        },
        { sdg_id: "SDG05", no: 5, title: "Gender Equality", color: "#FF3A21" },
        {
            sdg_id: "SDG06",
            no: 6,
            title: "Clean Water and Sanitation",
            color: "#26BDE2",
        },
        {
            sdg_id: "SDG07",
            no: 7,
            title: "Affordable and Clean Energy",
            color: "#FCC30B",
        },
        {
            sdg_id: "SDG08",
            no: 8,
            title: "Decent Work and Economic Growth",
            color: "#A21942",
        },
        {
            sdg_id: "SDG09",
            no: 9,
            title: "Industry, Innovation, and Infrastructure",
            color: "#FD6925",
        },
        {
            sdg_id: "SDG10",
            no: 10,
            title: "Reduced Inequality",
            color: "#DD1367",
        },
        {
            sdg_id: "SDG11",
            no: 11,
            title: "Sustainable Cities and Communities",
            color: "#FD9D24",
        },
        {
            sdg_id: "SDG12",
            no: 12,
            title: "Responsible Consumption and Production",
            color: "#BF8B2E",
        },
        { sdg_id: "SDG13", no: 13, title: "Climate Action", color: "#3F7E44" },
        {
            sdg_id: "SDG14",
            no: 14,
            title: "Life Below Water",
            color: "#0A97D9",
        },
        { sdg_id: "SDG15", no: 15, title: "Life on Land", color: "#56C02B" },
        {
            sdg_id: "SDG16",
            no: 16,
            title: "Peace, Justice, and Strong Institutions",
            color: "#00689D",
        },
        {
            sdg_id: "SDG17",
            no: 17,
            title: "Partnerships for the Goals",
            color: "#19486A",
        },
    ]);
    const [campuses, setCampuses] = useState([]);

    useEffect(() => {
        const fetchRecordValues = async () => {
            try {
                const response = await fetch(
                    "http://localhost:9000/api/get/recsord-values"
                );
                const data = await response.json();
                setCampuses(data);
                if (data.length > 0) {
                    setSelectedCampus(data[0].campus_id);
                }
            } catch (error) {
                console.error("Error fetching campuses:", error);
            }
        };

        fetchRecordValues();
    }, []);

    useEffect(() => {
        const fetchCampuses = async () => {
            try {
                const response = await fetch(
                    "http://localhost:9000/api/get/campuses"
                );
                const data = await response.json();
                setCampuses(data);
                setSelectedCampus(data[0].campus_id);
            } catch (error) {
                console.error("Error fetching campuses:", error);
            }
        };

        fetchCampuses();
    }, []);

    const handleSelectCampus = (campus) => {
        setSelectedCampus(campus.campus_id);
        console.log();
    };

    return (
        <Card className="w-[70%]">
            <h3 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Score per Campus
            </h3>
            <div className="grid grid-cols-5 gap-2 mt-4">
                {campuses.map((campus) => (
                    <div
                        key={campus.campus_id}
                        className={`${
                            selectedCampus &&
                            selectedCampus === campus.campus_id
                                ? "bg-blue-500 text-white"
                                : "bg-tremor-subtle text-tremor-content"
                        } rounded p-2 text-center cursor-pointer text-sm`}
                        onClick={() => handleSelectCampus(campus)}
                    >
                        {campus.name
                            .replace("BatStateU - ", "")
                            .replace("Campus", "")
                            .replace("Pablo Borbon", "Main")}
                    </div>
                ))}
            </div>
            {selectedCampus && (
                <BarChart
                    data={sdgs.map((sdg) => ({
                        name: sdg.no,
                        score: (Math.random() * 100).toFixed(2),
                    }))}
                    index="name"
                    categories={["score"]}
                    colors={["red"]}
                    yAxisWidth={50}
                    className="mt-6 h-60"
                />
            )}
        </Card>
    );
};

export default CampusScoreperSDGChart;
