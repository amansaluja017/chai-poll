import apiClient, { type PollResponse } from "#/services/apiClient.service";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Users, MessageSquare, AlertCircle } from "lucide-react";

function Results({ pollId }: { pollId: string }) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [poll, setPoll] = useState<PollResponse | null>(null);

    useEffect(() => {
        async function getResults() {
            setLoading(true);
            try {
                const response = await apiClient.getPollById(pollId);
                if (response.status !== 200) {
                    setError("Failed to load results");
                } else {
                    setPoll(response.response);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || "Error loading results");
            } finally {
                setLoading(false);
            }
        }

        getResults();
    }, [pollId]);

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in">
                <Skeleton className="h-32 w-full rounded-3xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 text-red-600 border border-red-500/20 rounded-2xl p-6 text-center shadow-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                <h2 className="text-xl font-bold mb-2">Error Loading Results</h2>
                <p className="font-medium">{error}</p>
            </div>
        );
    }

    if (!poll) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Stats */}
            <div className="bg-(--surface) border border-(--line) rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F2923B] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-(--sea-ink) mb-2">Results Overview</h2>
                        <h3 className="text-xl font-bold text-(--sea-ink-soft) mb-3">{poll.title}</h3>
                        <p className="text-(--sea-ink-soft) text-sm">{poll.description}</p>
                    </div>

                    <div className="flex items-center gap-4 bg-(--surface-strong) px-6 py-4 rounded-2xl border border-(--line) shrink-0 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-[#F2923B]/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-[#F2923B]" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-(--sea-ink-soft) uppercase tracking-wider mb-1">Total Responses</p>
                            <p className="text-3xl font-black text-(--sea-ink) leading-none">{poll.totalVotes || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Results */}
            <div className="space-y-6">
                {poll.questions.map((q, index) => {
                    const qTotalVotes = q.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;

                    return (
                        <div key={q._id} className="bg-(--surface) border border-(--line) rounded-2xl p-6 md:p-8 shadow-md">
                            <h3 className="text-lg md:text-xl font-bold text-(--sea-ink) mb-6 flex items-start gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-(--lagoon)/10 text-(--lagoon) text-sm shrink-0">
                                    {index + 1}
                                </span>
                                <span className="mt-1">{q.question}</span>
                            </h3>

                            {q.questionType === 'CHOICE' ? (
                                <div className="space-y-5">
                                    {q.options?.map((opt) => {
                                        const percentage = qTotalVotes > 0 ? Math.round(((opt.votes || 0) / qTotalVotes) * 100) : 0;
                                        return (
                                            <div key={opt._id} className="relative">
                                                <div className="flex justify-between items-end mb-2 relative z-10 px-1">
                                                    <span className="font-semibold text-(--sea-ink)">{opt.option}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-(--sea-ink-soft)">{opt.votes} votes</span>
                                                        <span className="text-sm font-black text-[#F2923B] w-10 text-right">{percentage}%</span>
                                                    </div>
                                                </div>
                                                {/* Progress Bar Background */}
                                                <div className="w-full h-3 bg-(--surface-strong) border border-(--line) rounded-full overflow-hidden">
                                                    {/* Progress Bar Fill */}
                                                    <div 
                                                        className="h-full bg-linear-to-r from-[#F2923B] to-[#f4a760] rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="mt-4 pt-4 border-t border-(--line) text-right">
                                        <p className="text-sm font-semibold text-(--sea-ink-soft)">
                                            Total Votes for Question: <span className="text-(--sea-ink)">{qTotalVotes}</span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(!q.textResponses || q.textResponses.length === 0) ? (
                                        <div className="text-center py-8 bg-(--surface-strong) rounded-xl border border-(--line) border-dashed">
                                            <MessageSquare className="w-8 h-8 text-(--sea-ink-soft)/30 mx-auto mb-2" />
                                            <p className="text-(--sea-ink-soft) font-medium">No text responses yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.textResponses.map((text, i) => (
                                                <div key={i} className="bg-(--surface-strong) border border-(--line) p-4 rounded-xl shadow-sm flex items-start gap-3 hover:border-(--lagoon) transition-colors">
                                                    <MessageSquare className="w-5 h-5 text-(--lagoon) shrink-0 mt-0.5" />
                                                    <p className="text-(--sea-ink) text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Results;
