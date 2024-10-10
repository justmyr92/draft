import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const ViewInstrumentPage = () => {
    const { instrument_id } = useParams();
    const [instrument, setInstrument] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [formula, setFormula] = useState("");

    useEffect(() => {
        const fetchInstrument = async () => {
            const response = await fetch(
                `http://localhost:9000/api/get/instruments/${instrument_id}`
            );
            const data = await response.json();
            setInstrument(data[0]);
            console.log(data[0]);
        };
        fetchInstrument();
    }, []);

    useEffect(() => {
        const fetchQuestions = async () => {
            const response = await fetch(
                `http://localhost:9000/api/get/questions/${instrument?.section_id}`
            );
            const data = await response.json();
            setQuestions(data);
        };

        const fetchFormula = async () => {
            const response = await fetch(
                `http://localhost:9000/api/get/formula/${instrument?.section_id}`
            );
            const data = await response.json();
            setFormula(data[0]);
            console.log(data);
        };

        fetchQuestions();
        fetchFormula();
    }, [instrument]);

    return (
        <section className="h-screen flex">
            <Sidebar />
            <main className="h-full w-[80%] border overflow-auto">
                <div className="header py-5 px-7 flex justify-between items-center">
                    <h1 className="text-2xl text-gray-900">Add Instruments</h1>
                    <Link
                        to="/csd/instruments"
                        className="bg-blue-600 text-white text-base px-6 py-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} /> Back
                    </Link>
                </div>
                <hr />
                <div className="py-5 px-7">
                    <div className="flex flex-col justify-between items-start">
                        <h2 className="text-lg font-semibold mb-4">
                            Instrument Details
                        </h2>

                        <table className="mt-4 w-full table border">
                            <tr>
                                <th classname="text-left">SDG Indicator</th>
                                <td>
                                    SDG{" "}
                                    {instrument?.number +
                                        ": " +
                                        instrument?.title}
                                </td>
                            </tr>
                            <tr>
                                <th>SDG Subtitle</th>
                                <td>{instrument?.sdg_subtitle}</td>
                            </tr>
                            <tr>
                                <th>SDG Section</th>
                                <td>{instrument?.section_content}</td>
                            </tr>
                            <tr>
                                <th
                                    colSpan={2}
                                    className="text-center bg-slate-500 text-white"
                                >
                                    Questions
                                </th>
                            </tr>
                            <tr>
                                <th>Question</th>

                                <td>
                                    {questions.map((question, index) => (
                                        <p key={index} className="text-wrap">
                                            {index +
                                                1 +
                                                ". " +
                                                question.question}
                                        </p>
                                    ))}
                                </td>
                            </tr>
                            <tr>
                                <th>Formula</th>
                                <td>
                                    {formula?.formula
                                        ? formula?.formula
                                        : "No formula available"}
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </main>
        </section>
    );
};

export default ViewInstrumentPage;
