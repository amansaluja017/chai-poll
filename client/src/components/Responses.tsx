import { useEffect, useState } from "react";
import apiClient from "../services/apiClient.service.ts";
import { Mail, Clock, Inbox, ChevronDown, ChevronUp } from "lucide-react";

export interface Responders {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
    } | null;
    createdAt: Date;
    updatedAt: Date;
};

const ADJECTIVES = ["Happy", "Lucky", "Sunny", "Brave", "Clever", "Swift", "Silent", "Mighty", "Cool", "Calm", "Fierce", "Gentle"];
const NOUNS = ["Panda", "Tiger", "Eagle", "Dolphin", "Wolf", "Fox", "Bear", "Falcon", "Owl", "Lion", "Leopard", "Hawk"];

const generateRandomName = (id: string) => {
    if (!id || id.length < 2) return "Anonymous User";
    const charCode1 = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
    const charCode2 = id.charCodeAt(1) + id.charCodeAt(id.length - 2);
    const adj = ADJECTIVES[charCode1 % ADJECTIVES.length];
    const noun = NOUNS[charCode2 % NOUNS.length];
    return `${adj} ${noun}`;
};

function Responses({ pollId, responders }: { pollId: string, responders: Responders[] }) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [initialResponders, setInitialResponders] = useState<Responders[]>([]);
    const [showAll, setShowAll] = useState<boolean>(false);

    useEffect(() => {
        const fetchResponders = async () => {
            try {
                const response = await apiClient.getResponders(pollId);
                
                if (response.status === 200) {
                    // Sort responders by createdAt descending so new responses are on top
                    const sortedResponders = (response.response as Responders[]).sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    setInitialResponders(sortedResponders);
                }
            } catch (error) {
                setError("Failed to fetch responders");
            } finally {
                setLoading(false);
            }
        };
        fetchResponders();
    }, [pollId]);
    
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-48 bg-black/10 dark:bg-white/10 rounded animate-pulse mb-6"></div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="island-shell p-5 rounded-2xl animate-pulse flex flex-col gap-3">
                        <div className="h-5 w-1/3 bg-black/10 dark:bg-white/10 rounded"></div>
                        <div className="h-4 w-1/2 bg-black/10 dark:bg-white/10 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="island-shell p-6 rounded-2xl text-center text-red-500 border-red-500/20">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-(--line) pb-4">
                <h2 className="text-2xl font-bold display-title text-(--sea-ink) flex items-center gap-2">
                    <Inbox className="w-6 h-6 text-(--lagoon)" />
                    Responses
                    <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-(--surface-strong) border border-(--line) text-(--sea-ink-soft) ml-2">
                        {responders.length || initialResponders.length}
                    </span>
                </h2>
            </div>
            
            {(responders && responders.length ? responders : initialResponders).length === 0 ? (
                <div className="island-shell p-12 rounded-3xl text-center flex flex-col items-center justify-center opacity-80">
                    <div className="w-16 h-16 rounded-full bg-(--surface-strong) flex items-center justify-center mb-4">
                        <Inbox className="w-8 h-8 text-(--sea-ink-soft)" />
                    </div>
                    <h3 className="text-lg font-semibold text-(--sea-ink) mb-2">No responses yet</h3>
                    <p className="text-(--sea-ink-soft) text-sm max-w-sm">
                        When people respond to this poll, their answers will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="space-y-4">
                        {(responders.length ? responders : initialResponders)
                            .slice(0, showAll ? undefined : 10)
                            .map((responder, index) => {
                        const isAnonymous = !responder.user;
                        const userName = responder.user?.name || generateRandomName(responder._id);
                        const userEmail = responder.user?.email || `${userName.replace(' ', '').toLowerCase()}_${responder._id.substring(0, 4)}@anonymous.local`;
                        const userInitial = userName.charAt(0).toUpperCase();

                        return (
                        <div 
                            key={responder._id}
                            className="island-shell p-5 rounded-2xl transition-all hover:scale-[1.01] hover:shadow-lg animate-slide-down"
                            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-(--sea-ink) font-semibold">
                                        <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-sm ${isAnonymous ? 'bg-gray-400' : 'bg-linear-to-br from-(--lagoon) to-(--lagoon-deep)'}`}>
                                            {userInitial}
                                        </div>
                                        <span>{userName} {isAnonymous && <span className="text-xs text-(--sea-ink-soft) font-normal ml-1">(Anonymous)</span>}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-(--sea-ink-soft) ml-10">
                                        <Mail className="w-4 h-4" />
                                        <span>{userEmail}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-(--sea-ink-soft) bg-(--surface-strong) px-3 py-1.5 rounded-full border border-(--line) self-start sm:self-auto ml-10 sm:ml-0 shadow-sm">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                        {new Date(responder.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                    </div>

                    {(responders.length ? responders : initialResponders).length > 10 && (
                        <div className="flex justify-center pt-2">
                            <button 
                                onClick={() => setShowAll(!showAll)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-(--surface-strong) border border-(--line) hover:border-(--lagoon) hover:text-(--lagoon) text-(--sea-ink) font-semibold rounded-full transition-all shadow-sm cursor-pointer"
                            >
                                {showAll ? (
                                    <>
                                        Show Less <ChevronUp className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        View All {(responders.length ? responders : initialResponders).length} Responses <ChevronDown className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Responses;
