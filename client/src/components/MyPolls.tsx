import { Skeleton } from "./ui/skeleton";
import { BarChart2, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PollResponse } from "#/services/apiClient.service";

function MyPolls({ myPolls, loading, error }: { myPolls: PollResponse[], loading: boolean, error: string | null }) {
    return (
        <div className="w-full mt-4 border-t border-(--line) pt-8">
              <h3 className="text-xl font-bold text-(--sea-ink) mb-6 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-(--lagoon)" />
                My Polls
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
              ) : error ? (
                <div className="p-4 bg-red-500/10 text-red-600 rounded-xl border border-red-500/20 text-center text-sm font-medium">
                  {error}
                </div>
              ) : myPolls.length === 0 ? (
                <div className="text-center py-8 bg-(--surface-strong) rounded-2xl border border-(--line) shadow-sm">
                  <p className="text-(--sea-ink-soft) font-medium">You haven't created any polls yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myPolls.map((poll) => (
                    <div key={poll._id} className="bg-(--surface-strong) border border-(--line) rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all hover:border-(--lagoon)">
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-base font-bold text-(--sea-ink) truncate">{poll.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs font-medium text-(--sea-ink-soft)">
                          <span className="flex items-center gap-1">
                            <BarChart2 className="w-3 h-3" />
                            {poll.totalVotes || 0} votes
                          </span>
                          <span>•</span>
                          <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Link
                        to="/poll/$pollId"
                        params={{ pollId: poll._id }}
                        className="shrink-0 flex items-center cursor-pointer justify-center gap-2 px-4 py-2 bg-(--lagoon) hover:bg-(--lagoon-deep)  text-sm font-bold rounded-xl transition-colors shadow-sm"
                        style={{ color: "white" }}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
    )
}

export default MyPolls;
