import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import type { PollResponse } from '#/services/apiClient.service';
import apiClient from '#/services/apiClient.service';
import { AxiosError } from 'axios';
import { Skeleton } from '#/components/ui/skeleton';
import { useAuth } from '#/auth/use-auth';
import { useSocket } from '#/socket/use-socket';
import Results from '#/components/Results';
import ClockTimer, { usePollTimer } from '#/components/ClockTimer';

export const Route = createFileRoute('/response/$pollId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { pollId } = Route.useParams();

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [poll, setPoll] = useState<PollResponse | null>(null);
  const [pollStatus, setPollStatus] = useState<PollResponse["status"]>("live");

  const { user, setGuestId, guestId, loading: authLoading } = useAuth();
  const socket = useSocket();
  console.log(poll?.status)

  const timeLeft = usePollTimer(poll?.expiry);

  useEffect(() => {
    if (authLoading) return;
    
    async function getPollById() {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.getPollById(pollId);

        if (response.status === 200) {
          setPoll(response.response);
          setPollStatus(response.response.status);
          
          if (response.response.isAuthenticationRequired && !user) {

            setError("Authentication required to respond to this poll");
            return;
          } else if (!response.response.isAuthenticationRequired) {
            let guestId = localStorage.getItem("guestId");

            if (guestId) {
              setGuestId(guestId);
              return;
            }
            guestId = crypto.randomUUID();

            localStorage.setItem("guestId", guestId);
            setGuestId(guestId);
          };

          if (response.response.status === "completed") {
            setError("Poll is already completed");
            return;
          };
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
  }, [pollId, user, authLoading]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setResponses(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setResponses(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!socket) return;

    try {
      const response = await apiClient.responsePoll(pollId, { responses: { ...responses }, guestId: guestId ? guestId : undefined });

      if (response.status === 200) {
        setIsSubmitted(true);

        socket.connect();

        socket.emit("client:poll:response", response.response);
      };

    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message || 'Failed to submit poll');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
      socket.off("client:poll:response");
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen p-6 md:p-12 font-sans flex items-center justify-center" style={{ paddingTop: '150px' }}>
        <div className="bg-(--surface) border border-(--line) rounded-3xl p-10 shadow-xl max-w-lg w-full text-center space-y-4 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-(--sea-ink)">Thank You!</h1>
          <p className="text-(--sea-ink-soft) text-lg">Your response has been successfully recorded.</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen p-6 md:p-12 font-sans" style={{ paddingTop: '150px' }}>
        <div className="max-w-3xl mx-auto space-y-8">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <div className="space-y-6">
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
        <div className="bg-(--surface) border border-red-500/20 rounded-3xl p-10 max-w-lg w-full text-center shadow-xl mt-10 space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-(--sea-ink)">Access Denied</h1>
          <p className="font-medium text-(--sea-ink-soft) text-lg">{error}</p>

          {error.toLowerCase().includes("authentication") && (
            <Link
              to="/login"
              search={{ redirect: window.location.pathname }}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(242,146,59,0.3)] hover:shadow-[0_0_30px_rgba(242,146,59,0.5)] hover:-translate-y-1 transition-all duration-300 w-full mt-4"
              style={{ backgroundColor: '#F2923B', color: "white" }}
            >
              Sign In to Respond
            </Link>
          )}
        </div>
      </main>
    );
  };

  if (poll && pollStatus === "completed") {
    return (
      <main className="min-h-screen p-6 md:p-12 font-sans flex items-center justify-center" style={{ paddingTop: '150px' }}>
        <div className="bg-(--surface) border border-(--line) rounded-3xl p-10 shadow-xl max-w-lg w-full text-center space-y-4 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-(--sea-ink)">Poll completed!</h1>
          <p className="text-(--sea-ink-soft) text-lg">This poll has been completed.</p>
        </div>
      </main>
    );
  };

  if (!poll) return null;

  return (
    <main className="min-h-screen p-6 md:p-12 font-sans" style={{ paddingTop: '150px' }}>
      {poll.status === "live" && (
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Header Section */}
          <div className="bg-(--surface) border border-(--line) rounded-3xl p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2923B]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-(--sea-ink) mb-3">{poll?.title}</h1>
                <p className="text-(--sea-ink-soft) text-lg">{poll?.description}</p>
              </div>

              {/* Timer */}
              {pollStatus === "live" && (
                <ClockTimer timeLeft={timeLeft} variant="default" />
              )}
            </div>
          </div>

          {/* Questions Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {poll?.questions.map((q, index) => (
              <div key={q._id} className="bg-(--surface) border border-(--line) rounded-2xl p-6 md:p-8 shadow-md transition-all hover:border-(--lagoon)">
                <h3 className="text-lg md:text-xl font-medium text-(--sea-ink) mb-6 flex items-start gap-2 leading-snug">
                  <span className="text-(--sea-ink-soft) font-normal shrink-0">{index + 1}.</span>
                  <span>
                    {q.question}
                    {q.isRequired && <span className="text-red-500 font-bold ml-1.5" title="Required">*</span>}
                  </span>
                </h3>

                <div className="pl-0 md:pl-6">
                  {q.questionType === 'CHOICE' ? (
                    <div className="space-y-3">
                      {q.options?.map((opt) => (
                        <label
                          key={opt._id}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${responses[q._id] === opt._id ? 'border-[#F2923B] bg-[#F2923B]/5' : 'border-(--line) bg-(--surface-strong) hover:border-[#F2923B]/50'}`}
                        >
                          <input
                            type="radio"
                            name={`question-${q._id}`}
                            value={opt._id}
                            checked={responses[q._id] === opt._id}
                            onChange={() => handleOptionSelect(q._id, opt._id)}
                            required={q.isRequired}
                            className="hidden"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${responses[q._id] === opt._id ? 'border-[#F2923B]' : 'border-(--sea-ink-soft)'}`}>
                            {responses[q._id] === opt._id && <div className="w-2.5 h-2.5 bg-[#F2923B] rounded-full" />}
                          </div>
                          <span className={`text-base flex-1 ${responses[q._id] === opt._id ? 'text-(--sea-ink) font-medium' : 'text-(--sea-ink-soft)'}`}>
                            {opt.option}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={responses[q._id] || ''}
                      onChange={(e) => handleTextChange(q._id, e.target.value)}
                      placeholder="Type your answer here..."
                      required={q.isRequired}
                      rows={4}
                      className="w-full bg-(--surface) border-2 border-(--line) rounded-xl px-5 py-4 text-(--sea-ink) placeholder-(--sea-ink-soft)/50 focus:outline-none focus:border-[#F2923B] focus:bg-(--surface) transition-all resize-y"
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Submit Action */}
            <div className="pt-4 pb-20 flex justify-end">
              <button
                type="submit"
                disabled={timeLeft === 'Expired' || isSubmitting}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-200 ${(timeLeft === 'Expired' || isSubmitting) ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-[#F2923B] shadow-[0_0_20px_rgba(242,146,59,0.3)] hover:shadow-[0_0_30px_rgba(242,146,59,0.5)] hover:-translate-y-0.5 active:scale-95 cursor-pointer'}`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Response'}
              </button>
            </div>
          </form>

        </div>
      )}

      {poll.status === "published" && (
        <div className="max-w-4xl mx-auto w-full">
          <Results poll={poll} pollId={pollId} />
        </div>
      )}
    </main>
  )
}
