import { createFileRoute, Link } from '@tanstack/react-router'
import { User, Mail, BarChart2, Eye } from 'lucide-react'
import { useAuth } from '#/auth/use-auth';
import { useEffect, useState } from 'react';
import apiClient, { type PollResponse } from '#/services/apiClient.service';
import { AxiosError } from 'axios';
import { Skeleton } from '#/components/ui/skeleton';

export const Route = createFileRoute('/_protected/profile')({
  component: RouteComponent,
});

function RouteComponent() {

  const [myPolls, setMyPolls] = useState<PollResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useAuth();

  useEffect(() => {
    async function getMyPolls() {
      try {
        setLoading(true);
        const reponse = await apiClient.getMyPolls();
        setMyPolls(reponse.response);
      } catch (error: unknown) {
        console.log(error);
        if (error instanceof AxiosError) {
          setError(error.response?.data.message || "Failed to get polls");
        }
      } finally {
        setLoading(false);
      }
    }
    getMyPolls();
  }, []);

  return (
    <main className="min-h-screen p-6 md:p-12 font-sans flex flex-col items-center" style={{ paddingTop: '150px' }}>
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-(--sea-ink)">Your Profile</h1>
          <p className="text-lg text-(--sea-ink-soft)">Manage your account details.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-(--surface) border border-(--line) rounded-3xl p-8 shadow-xl backdrop-blur-sm transition-all relative overflow-hidden group hover:border-(--lagoon)">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F2923B] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          
          <div className="relative flex flex-col items-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-(--surface-strong) border-4 border-(--surface) shadow-lg flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
              <User className="w-10 h-10 text-(--lagoon)" />
            </div>

            {/* User Info */}
            <h2 className="text-2xl font-bold text-(--sea-ink) mb-3">{user?.name || "Anonymous User"}</h2>
            <div className="flex items-center gap-2 text-(--sea-ink-soft) mb-8 bg-(--surface-strong) px-4 py-2 rounded-full border border-(--line) shadow-sm">
              <Mail className="w-4 h-4 text-[#F2923B]" />
              <span className="text-sm font-semibold">{user?.email || "No email available"}</span>
            </div>
            
            {/* My Polls Section */}
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

          </div>
        </div>
      </div>
    </main>
  );
}
