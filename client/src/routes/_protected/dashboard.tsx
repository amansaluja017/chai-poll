import MyPolls from '#/components/MyPolls'
import apiClient, { type PollResponse } from '#/services/apiClient.service';
import { createFileRoute } from '@tanstack/react-router'
import { AxiosError } from 'axios';
import { useEffect, useState, useMemo } from 'react';
import { BarChart2, ListChecks, AlertCircle, Search, Filter, Activity } from 'lucide-react';

export const Route = createFileRoute('/_protected/dashboard')({
    component: RouteComponent,
})

function RouteComponent() {
    const [myPolls, setMyPolls] = useState<PollResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState<"Latest" | "Oldest" | "Active" | "Expired" | "Published">("Latest");

    useEffect(() => {
        async function getMyPolls() {
            try {
                setLoading(true);
                const response = await apiClient.getMyPolls();
                setMyPolls(response.response);
            } catch (error: unknown) {
                if (error instanceof AxiosError) {
                    setError(error.response?.data.message || "Failed to get polls");
                }
            } finally {
                setLoading(false);
            }
        }
        getMyPolls();
    }, []);

    const stats = useMemo(() => {
        let totalResponses = 0;
        let activePolls = 0;
        let expiredPolls = 0;
        const now = Date.now();

        myPolls.forEach(poll => {
            totalResponses += (poll.totalVotes || 0);
            const isExpired = new Date(poll.expiry).getTime() <= now;
            if (isExpired) {
                expiredPolls++;
            } else {
                activePolls++;
            }
        });

        return {
            totalPolls: myPolls.length,
            totalResponses,
            activePolls,
            expiredPolls
        };
    }, [myPolls]);

    const filteredPolls = useMemo(() => {
        let result = [...myPolls];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(poll => poll.title.toLowerCase().includes(query));
        }

        const now = Date.now();
        switch (filterBy) {
            case "Latest":
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case "Oldest":
                result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case "Active":
                result = result.filter(poll => new Date(poll.expiry).getTime() > now);
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case "Expired":
                result = result.filter(poll => new Date(poll.expiry).getTime() <= now);
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case "Published":
                result = result.filter(poll => poll.status === 'published');
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }

        return result;
    }, [myPolls, searchQuery, filterBy]);

    return (
        <main className="min-h-screen p-6 md:p-12 font-sans" style={{ paddingTop: '150px' }}>
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="bg-(--surface) border border-(--line) rounded-3xl p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2923B]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-(--sea-ink) mb-2">Dashboard</h1>
                            <p className="text-(--sea-ink-soft) text-lg">Manage your polls and view analytics</p>
                        </div>
                    </div>
                </div>

                {/* Analytics Grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-(--surface) border border-(--line) rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-(--lagoon)/50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-(--lagoon)/10 flex items-center justify-center">
                                    <ListChecks className="w-6 h-6 text-(--lagoon)" />
                                </div>
                            </div>
                            <p className="text-(--sea-ink-soft) font-medium mb-1">Total Polls</p>
                            <h3 className="text-3xl font-extrabold text-(--sea-ink)">{stats.totalPolls}</h3>
                        </div>
                        
                        <div className="bg-(--surface) border border-(--line) rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-[#F2923B]/50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-[#F2923B]/10 flex items-center justify-center">
                                    <BarChart2 className="w-6 h-6 text-[#F2923B]" />
                                </div>
                            </div>
                            <p className="text-(--sea-ink-soft) font-medium mb-1">Total Responses</p>
                            <h3 className="text-3xl font-extrabold text-(--sea-ink)">{stats.totalResponses}</h3>
                        </div>

                        <div className="bg-(--surface) border border-(--line) rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-emerald-500/50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-emerald-500" />
                                </div>
                            </div>
                            <p className="text-(--sea-ink-soft) font-medium mb-1">Active Polls</p>
                            <h3 className="text-3xl font-extrabold text-(--sea-ink)">{stats.activePolls}</h3>
                        </div>

                        <div className="bg-(--surface) border border-(--line) rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-red-500/50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-red-500" />
                                </div>
                            </div>
                            <p className="text-(--sea-ink-soft) font-medium mb-1">Expired Polls</p>
                            <h3 className="text-3xl font-extrabold text-(--sea-ink)">{stats.expiredPolls}</h3>
                        </div>
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div className="bg-(--surface) border border-(--line) rounded-2xl p-4 shadow-sm flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                    <div className="relative w-full xl:w-96 flex-shrink-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--sea-ink-soft)" />
                        <input 
                            type="text" 
                            placeholder="Search polls by title..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-(--surface-strong) border border-(--line) rounded-xl text-(--sea-ink) focus:outline-none focus:border-(--lagoon) transition-colors"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
                        <Filter className="w-5 h-5 text-(--sea-ink-soft) shrink-0 hidden md:block" />
                        <div className="flex gap-2">
                            {["Latest", "Oldest", "Active", "Expired", "Published"].map(filterOption => (
                                <button
                                    key={filterOption}
                                    onClick={() => setFilterBy(filterOption as any)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filterBy === filterOption ? 'bg-(--lagoon) text-white shadow-[0_0_15px_rgba(40,116,240,0.3)]' : 'bg-(--surface-strong) text-(--sea-ink-soft) hover:text-(--sea-ink) border border-(--line) hover:border-(--lagoon)/30'}`}
                                >
                                    {filterOption}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Polls List */}
                <div className="bg-(--surface) border border-(--line) rounded-3xl p-6 md:p-8 shadow-xl">
                    <MyPolls myPolls={filteredPolls} loading={loading} error={error} />
                </div>

            </div>
        </main>
    );
}
