import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { Share2, Copy, CheckCircle2, BarChart3, UploadCloud, Radio, AlignLeft } from 'lucide-react';
import apiClient, { type PollResponse } from '#/services/apiClient.service';
import { AxiosError } from 'axios';
import { Skeleton } from '#/components/ui/skeleton';
import Status from '#/components/Status';
import ClockTimer, { usePollTimer } from '#/components/ClockTimer';
import Results from '#/components/Results';

export const Route = createFileRoute('/_protected/poll/$pollId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { pollId } = Route.useParams();

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [poll, setPoll] = useState<PollResponse>();
  const [pollStatus, setPollStatus] = useState<PollResponse['status']>("live");
  console.log(poll?.status);

  const navigate = useNavigate();

  const shareLink = `${import.meta.env.VITE_CLIENT_URL}/response/${pollId}`;

  const timeLeft = usePollTimer(poll?.expiry);

  useEffect(() => {
    async function getPollById() {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.getPollById(pollId);

        if (response.status === 200) {
          setPoll(response.response);
          setPollStatus(response.response.status);
        };

      } catch (error) {
        if (error instanceof AxiosError) {
          setError(error.response?.data.message || 'Failed to load poll');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    getPollById();
  }, [pollId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function handlePublish(status: "completed" | "published" | "live") {
    try {
      const response = await apiClient.updateStatus(pollId, status);
      console.log(response);

      if (response.status === 200) {
        setPollStatus(status);
        if (poll) {
          setPoll({ ...poll, status });
        }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.message);
      }
    }
  };

  const getStatus = () => {
    if (pollStatus === "published") return <Status text='Published'/>;
    if (pollStatus === "completed") return <Status text='Completed'/>;
    return <Status text='Live'/>;
  };

  const status = getStatus();

  if (loading) {
    return (
      <main className="min-h-screen p-6 md:p-12 font-sans" style={{ paddingTop: '150px' }}>
        <div className="max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-48 rounded-md mb-6" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-6 md:p-12 font-sans flex flex-col items-center" style={{ paddingTop: '150px' }}>
        <div className="bg-red-500/10 text-red-600 border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center shadow-lg mt-10">
          <h2 className="text-2xl font-bold mb-4">Error Loading Poll</h2>
          <p className="font-medium">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-12 font-sans" style={{ paddingTop: '150px' }}>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header & Status Section */}
        <div className="bg-(--surface) border setPoll(response.data); rounded-3xl p-8 shadow-xl backdrop-blur-sm transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2923B]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl font-extrabold text-(--sea-ink)">{poll?.title}</h1>
                {status}

              </div>
              <p className="text-(--sea-ink-soft) text-lg">{poll?.description}</p>
            </div>

            {/* Actions */}
            <div className="shrink-0 flex flex-col gap-5 items-end">

              {/* Timer Panel */}
              {pollStatus === "live" && (
                <ClockTimer timeLeft={timeLeft} variant="minimal" />
              )}

              <div className='flex gap-3 items-center'>
                <button onClick={() => navigate({ to: `/poll/${pollId}/results` })} className="flex items-center gap-2 px-5 py-3 bg-(--surface-strong) border border-(--line) rounded-xl text-(--sea-ink) font-semibold hover:border-(--lagoon) transition-all shadow-sm cursor-pointer">
                  <BarChart3 className="w-5 h-5 text-(--lagoon)" />
                  View Results
                </button>
                {(pollStatus === "completed" || (pollStatus === "live" && timeLeft === 'Expired')) && (
                  <button onClick={() => handlePublish("published")} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(242,146,59,0.2)] transition-all duration-200 hover:shadow-[0_0_30px_rgba(242,146,59,0.4)] hover:-translate-y-0.5 active:scale-95 cursor-pointer text-white" style={{ backgroundColor: '#F2923B' }}>
                    <UploadCloud className="w-5 h-5" />
                    Publish
                  </button>
                )}
                {pollStatus === "live" && timeLeft !== 'Expired' && (
                  <button onClick={() => handlePublish("completed")} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(242,146,59,0.2)] transition-all duration-200 hover:shadow-[0_0_30px_rgba(242,146,59,0.4)] hover:-translate-y-0.5 active:scale-95 cursor-pointer text-white" style={{ backgroundColor: '#F2923B' }}>
                    <UploadCloud className="w-5 h-5" />
                    Early end
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="">

          {/* Main Content (Questions Preview or Results) */}
          <div className="lg:col-span-2 space-y-6">
            {pollStatus === "published" ? (
              <div className="w-full">
                <Results poll={poll!} pollId={pollId} />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-(--sea-ink) px-2">Questions Preview</h2>
                {poll?.questions.map((q, index) => (
                  <div key={q._id} className="bg-(--surface) border border-(--line) rounded-2xl p-6 shadow-md transition-all hover:border-(--lagoon)">
                    <h3 className="text-lg font-medium text-(--sea-ink) mb-4 flex items-start gap-2">
                      <span className="text-(--sea-ink-soft) font-normal">{index + 1}.</span>
                      {q.question}
                      {q.isRequired && <span className="text-red-500 font-bold ml-1" title="Required">*</span>}
                    </h3>

                    <div className="pl-6">
                      {q.questionType === 'CHOICE' ? (
                        <div className="space-y-3">
                          {q.options?.map((opt) => (
                            <div key={opt._id} className="flex items-center gap-3">
                              <Radio className="w-5 h-5 text-(--sea-ink-soft)/50" />
                              <span className="text-(--sea-ink-soft) bg-(--surface-strong) border border-(--line) px-4 py-2 rounded-xl flex-1 cursor-not-allowed opacity-80">
                                {opt.option}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <AlignLeft className="w-5 h-5 text-(--sea-ink-soft)/50 shrink-0 mt-3" />
                          <div className="w-full h-24 bg-(--surface-strong) border border-(--line) border-dashed rounded-xl px-4 py-3 text-(--sea-ink-soft)/50 cursor-not-allowed">
                            Text answer field (read-only)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 mt-10">

            {/* Share Panel */}
            <div className="bg-(--surface) border border-(--line) rounded-2xl p-6 shadow-md transition-all hover:border-(--lagoon)">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-(--lagoon)/10 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-(--lagoon)" />
                </div>
                <h3 className="font-bold text-(--sea-ink)">Share Poll</h3>
              </div>
              <p className="text-sm text-(--sea-ink-soft) mb-4">Anyone with this link can view and participate.</p>

              <div className="relative">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="w-full bg-(--surface-strong) border border-(--line) rounded-xl pl-4 pr-12 py-3 text-sm text-(--sea-ink) focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-(--surface) border border-(--line) rounded-lg text-(--sea-ink-soft) hover:text-[#F2923B] transition-colors cursor-pointer"
                  title="Copy link"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}
