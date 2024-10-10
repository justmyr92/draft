import { useState, useEffect, useMemo } from "react";
import { BarChart, Card } from "@tremor/react";
import excelFormula from "excel-formula";

const ScorePerCampusChart = () => {
    const [selectedSdg, setSelectedSdg] = useState("SDG01");
    const [color, setColor] = useState("#E5243B");
    const [campuses, setCampuses] = useState([]);
    const [formulas, setFormulas] = useState([]);
    const [answers, setAnswers] = useState([]); // State to store the record values
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

    useEffect(() => {
        const getCampuses = async () => {
            try {
                const response = await fetch(
                    "http://localhost:9000/api/get/campuses"
                );
                const jsonData = await response.json();
                setCampuses(
                    jsonData.map((campus) => ({ ...campus, score: 0 }))
                ); // Set initial score to 0
            } catch (err) {
                console.error("Error fetching campuses:", err.message);
            }
        };

        const removeDuplicates = async (array, key) => {
            const uniqueValues = new Map();
            array.forEach((item) => {
                if (!uniqueValues.has(item[key])) {
                    uniqueValues.set(item[key], item);
                }
            });
            return Array.from(uniqueValues.values());
        };

        const getFormulasForAnswers = async () => {
            try {
                const answerResponse = await fetch(
                    `http://localhost:9000/api/get/records-values-by-sdg_id/${selectedSdg}`
                );
                const answerData = await answerResponse.json();

                if (answerData.length === 0) {
                    setAnswers([]); // If no answers, reset to empty array
                    setCampuses(
                        (prevCampuses) =>
                            prevCampuses.map((campus) => ({
                                ...campus,
                                score: 0,
                            })) // Set all scores to 0
                    );
                    return; // No need to fetch formulas if no answers
                }

                setAnswers(answerData);

                let formulasArray = [];
                for (const answer of answerData) {
                    const sectionId = answer.section_id;
                    const formulaResponse = await fetch(
                        `http://localhost:9000/api/get/formula_per_section/${sectionId}`
                    );
                    const formulas = await formulaResponse.json();
                    if (formulas) {
                        formulasArray.push(formulas[0]);
                    }
                }

                const uniqueFormulas = await removeDuplicates(
                    formulasArray,
                    "formula_id"
                );
                setFormulas(uniqueFormulas);
            } catch (err) {
                console.error(
                    "Error fetching formulas or answers:",
                    err.message
                );
            }
        };

        getCampuses();
        getFormulasForAnswers();
    }, [selectedSdg]);

    const calculatedCampuses = useMemo(() => {
        if (
            campuses.length === 0 ||
            formulas.length === 0 ||
            answers.length === 0
        ) {
            return campuses;
        }

        const replaceFormulaValues = (formula, valueMap) => {
            return formula.replace(/([A-Z]\d+)/g, (match) => {
                return valueMap[match] !== undefined ? valueMap[match] : 0;
            });
        };

        const results = campuses.map((campus) => {
            let totalScore = 0;

            formulas.forEach((formula) => {
                let valueMap = {};

                answers.forEach((answer) => {
                    if (answer.campus_id === campus.campus_id) {
                        valueMap[answer.sub_id] = answer.value || 0;
                    }
                });

                const updatedFormula = replaceFormulaValues(
                    formula.formula,
                    valueMap
                );

                try {
                    const score = eval(
                        excelFormula.toJavaScript(updatedFormula)
                    );
                    totalScore += score; // Add the score to the total
                } catch (e) {
                    console.error("Error evaluating formula:", e);
                }
            });

            return {
                ...campus,
                score: totalScore, // Update the score with the total for this campus
            };
        });

        return results;
    }, [campuses, formulas, answers, selectedSdg]); // Only recalculate when these dependencies change

    // Update the campuses state with the calculated total scores
    useEffect(() => {
        setCampuses(calculatedCampuses);
    }, [calculatedCampuses]); // This will only trigger if calculatedCampuses changes

    const handleSelectSdg = (sdg_id) => {
        setSelectedSdg(sdg_id);
        const selectedSdgColor = sdgs.find(
            (sdg) => sdg.sdg_id === sdg_id
        )?.color;
        setColor(selectedSdgColor || "#E5243B");
    };

    return (
        <Card className="w-[75%]">
            <h3 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Score per Campus
            </h3>
            <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
            </p>
            <div className="grid grid-cols-10 gap-2 mt-4">
                {sdgs.map((sdg) => (
                    <div
                        key={sdg.sdg_id}
                        className={`${
                            selectedSdg === sdg.sdg_id
                                ? "bg-blue-500 text-white"
                                : "bg-tremor-subtle text-tremor-content"
                        } rounded p-2 text-center cursor-pointer text-sm`}
                        onClick={() => handleSelectSdg(sdg.sdg_id)}
                    >
                        {sdg.no}
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default ScorePerCampusChart;
