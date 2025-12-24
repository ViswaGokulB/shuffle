"use client";

import { useEffect, useState } from "react";

export default function NameGroupShuffleCSV() {
  const [names, setNames] = useState<string[]>([]);
  const [groupSize, setGroupSize] = useState(2);
  const [groups, setGroups] = useState<string[][]>([]);

  // Auto-apply system theme
  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = text
        .split(/\r?\n/)
        .map((row) => row.split(",")[0].trim())
        .filter((v) => v && v.toLowerCase() !== "name");

      setNames(parsed);
      setGroups([]);
    };
    reader.readAsText(file);
  };

  const shuffleAndGroup = () => {
    if (!names.length || groupSize <= 0) return;

    const shuffled = [...names];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const result: string[][] = [];
    for (let i = 0; i < shuffled.length; i += groupSize) {
      result.push(shuffled.slice(i, i + groupSize));
    }

    setGroups(result);
  };

  return (
    <main className="h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-full max-h-[90vh] bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col overflow-hidden">

        {/* Header */}
        <header className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-semibold text-center">
            CSV Name Group Shuffler
          </h1>
        </header>

        {/* Content (Scrollable) */}
        <section className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload CSV file
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="block w-full text-sm
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:bg-slate-700 file:text-white
                hover:file:bg-slate-600"
            />
            {names.length > 0 && (
              <p className="mt-2 text-sm text-green-500">
                {names.length} members loaded
              </p>
            )}
          </div>

          {/* Group Size */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Members per group
            </label>
            <input
              type="number"
              min={1}
              value={groupSize}
              onChange={(e) => setGroupSize(Number(e.target.value))}
              className="w-32 px-3 py-2 border rounded-md
                bg-white dark:bg-slate-900
                border-slate-300 dark:border-slate-600
                focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          {/* Button */}
          <button
            onClick={shuffleAndGroup}
            disabled={!names.length}
            className="w-full py-3 rounded-md font-medium
              bg-slate-900 text-white
              hover:bg-slate-800
              dark:bg-slate-100 dark:text-slate-900
              dark:hover:bg-slate-200
              transition disabled:opacity-50"
          >
            Shuffle & Divide
          </button>

          {/* Groups */}
          {groups.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Generated Groups
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {groups.map((group, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border p-4
                      bg-slate-50 dark:bg-slate-900
                      border-slate-200 dark:border-slate-700"
                  >
                    <h3 className="font-medium mb-2">
                      Group {idx + 1}
                    </h3>
                    <ul className="text-sm space-y-1">
                      {group.map((name, i) => (
                        <li key={i}>{name}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
