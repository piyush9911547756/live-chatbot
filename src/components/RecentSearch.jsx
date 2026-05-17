import { useRef } from "react";
import logo from "../assets/logo.png";

function RecentSearch({ recentHistory, setRecenthistory, setselectedHistory }) {
    const scrollToAns = useRef(null);

    const clearHistory = () => {
        localStorage.removeItem("history");
        setRecenthistory([]);
    };

    const clearSelectedHistory = (selectedItem) => {
        let history = JSON.parse(localStorage.getItem("history")) || [];
        const updatedHistory = history.filter((item) => item !== selectedItem);

        setRecenthistory(updatedHistory);
        localStorage.setItem("history", JSON.stringify(updatedHistory));
    };

    return (
        <div
            ref={scrollToAns}
            className="col-span-1 bg-gray-100 dark:bg-zinc-100 bg-zinc-600 overflow-y-auto h-full">
            <div className="flex flex-col items-center pt-6 pb-3">
                <img
                    src={logo}
                    alt="logo"
                    className="h-14 w-14 object-contain mb-2 rounded-4xl"
                />
                <h1 className="recent-title">
                    Recent history
                </h1>
            </div>

            <div className="flex justify-end px-4 mb-2">
                <button
                    onClick={clearHistory}
                    className="text-sm text-red-500 hover:text-red-600 cursor-pointer"
                >
                    Clear All
                </button>
            </div>

            <ul className="text-left light:text-black ">
                {recentHistory &&
                    recentHistory.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => setselectedHistory(item, index)}
                            className="flex justify-between items-center p-3 border-b dark:border-zinc-700 text-white dark:text-black cursor-pointer hover:bg-red-100 dark:hover:bg-zinc-700 transition hover:text-white"
                        >
                            <span className="truncate">{item}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearSelectedHistory(item);
                                }}
                                className="text-red-400 hover:text-red-600 text-sm"
                            >
                                ✕
                            </button>
                        </li>
                    ))}
            </ul>
        </div>
    );
}

export default RecentSearch;