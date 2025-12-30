"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

type Team = {
  name: string;
  members: string[];
  score?: number;
};

type Event = {
  title: string;
  teams: Team[];
};

export default function TeamScoreManager() {
  const [names, setNames] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [groupSize, setGroupSize] = useState(2);
  const [generatedTeams, setGeneratedTeams] = useState<Team[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [savedEvent, setSavedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = text
        .split(/\r?\n/)
        .map((row) => row.split(",")[0].trim())
        .filter((v) => v && v.toLowerCase() !== "name");

      setNames(parsed);
      setGeneratedTeams([]);
      setSavedEvent(null);
    };
    reader.readAsText(file);
  };

  const shuffleAndGenerateTeams = () => {
    if (!names.length || groupSize <= 0) return;

    const shuffled = [...names];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const teams: Team[] = [];
    let index = 0;

    for (let i = 0; i < shuffled.length; i += groupSize) {
      teams.push({
        name: `Team ${++index}`,
        members: shuffled.slice(i, i + groupSize),
      });
    }

    setGeneratedTeams(teams);
    setSavedEvent(null);
  };

  const saveTeamsUnderHeading = () => {
    if (!eventTitle || generatedTeams.length === 0) return;

    setSavedEvent({
      title: eventTitle,
      teams: generatedTeams,
    });
  };

  const updateScore = (teamIndex: number, score: number) => {
    if (!savedEvent) return;

    const updatedTeams = savedEvent.teams.map((team, idx) =>
      idx === teamIndex ? { ...team, score } : team
    );

    setSavedEvent({ ...savedEvent, teams: updatedTeams });
  };

  const exportToExcel = () => {
    if (!savedEvent) return;

    const worksheetData = savedEvent.teams.map((team) => ({
      "Team Name": team.name,
      "Members": team.members.join(", "),
      "Score": team.score ?? 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scores");

    // Auto-size columns
    const cols = Object.keys(worksheetData[0]);
    const colWidths = cols.map((col) => ({
      wch: Math.max(...worksheetData.map((row: any) => row[col]?.toString().length ?? 10), col.length),
    }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `${savedEvent.title.replace(/\s+/g, '_')}_scores.xlsx`);
  };

  return (
    <main className="h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col">

        <header className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Team & Score Manager
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Create teams, manage scores, and export results.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 overflow-hidden">


          {/* Left Column: Controls */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Setup</h2>

              {/* CSV Upload */}
              <div>
                <div className="flex items-center space-x-4">
                  <label className="block text-sm font-medium ">
                    Upload Members CSV
                  </label>
                  <div>
                    <input
                      id="members-csv"
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="sr-only"
                    />
                    {!fileName && (
                      <label
                        htmlFor="members-csv"
                        className="inline-flex items-center px-4 py-2 rounded-md bg-slate-700 text-white hover:bg-slate-600 cursor-pointer text-sm"
                      >
                        Choose File
                      </label>
                    )}
                    {fileName && (
                      <span className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                        {fileName}
                      </span>
                    )}
                  </div>
                </div>
                {names.length > 0 && (
                  <p className="mt-2 text-sm text-green-500">
                    Total {names.length} members loaded.
                  </p>
                )}
              </div>

              {/* Group Size */}
              <div className="mt-4">
                <div className="flex items-center space-x-4">
                  <label className="block text-sm font-medium mb-2">
                    Members per Team
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={groupSize}
                    onChange={(e) => setGroupSize(Number(e.target.value))}
                    className="w-[80px] px-3 py-2 border rounded-md
                    bg-white dark:bg-slate-900
                    border-slate-300 dark:border-slate-600
                    focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="e.g., 2"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-6">
                <button
                  onClick={shuffleAndGenerateTeams}
                  disabled={!names.length}
                  className="w-full py-3 rounded-md font-semibold text-white
                    bg-slate-900 dark:bg-slate-100 dark:text-slate-900
                    hover:bg-slate-700 dark:hover:bg-slate-200
                    transition disabled:opacity-50"
                >
                  Generate Teams
                </button>
              </div>
            </div>

            {/* Save Event */}
            {generatedTeams.length > 0 && !savedEvent && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Save Event</h2>
                <input
                  type="text"
                  placeholder="Enter Event / Match Name"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md
                    bg-white dark:bg-slate-900
                    border-slate-300 dark:border-slate-600
                    focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <button
                  onClick={saveTeamsUnderHeading}
                  disabled={!eventTitle.trim()}
                  className="w-full mt-4 py-3 rounded-md font-semibold text-white
                    bg-green-600 hover:bg-green-700
                    transition disabled:opacity-50"
                >
                  Save Teams & Start Scoring
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Teams Display */}
          <div className="md:col-span-2 overflow-y-auto pr-2">

            {savedEvent ? (
              // Display Saved Event
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">
                    {savedEvent.title}
                  </h2>
                  <button
                    onClick={exportToExcel}
                    className="px-4 py-2 rounded-md font-semibold text-white
                      bg-blue-600 hover:bg-blue-700
                      transition"
                  >
                    Export to Excel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedEvent.teams.map((team, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 flex flex-col"
                    >
                      <h3 className="font-bold text-lg mb-2">{team.name}</h3>
                      <ul className="text-sm space-y-1 mb-4">
                        {team.members.map((m, i) => (
                          <li key={i} className="truncate">{m}</li>
                        ))}
                      </ul>
                      <div className="mt-auto">
                        <label className="text-xs font-medium">Score</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={team.score ?? ""}
                          onChange={(e) =>
                            updateScore(idx, Number(e.target.value))
                          }
                          className="w-full px-2 py-1 border rounded-md dark:bg-slate-700
                            border-slate-300 dark:border-slate-600
                            focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : generatedTeams.length > 0 ? (
              // Display Generated Teams (pre-save)
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Generated Teams</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedTeams.map((team, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4"
                    >
                      <h3 className="font-bold text-lg mb-2">{team.name}</h3>
                      <ul className="text-sm space-y-1">
                        {team.members.map((m, i) => (
                          <li key={i} className="truncate">{m}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Placeholder when no teams are generated
              <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-500">
                  Your teams will appear here
                </h2>
                <p className="text-slate-400 mt-2">
                  Upload a CSV and generate teams to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
