import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react';
import { Plus, Trash2, Settings, AlignLeft, ListTodo, Shield, ShieldOff, Check, Clock, AlertCircle } from 'lucide-react';
import apiClient from '#/services/apiClient.service';
import { AxiosError } from 'axios';

export const Route = createFileRoute('/_protected/poll/')({
  component: PollPage,
});

type QuestionType = 'CHOICE' | 'TEXT';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  isRequired: boolean;
  options: { id: string; value: string }[];
};

function PollPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [expiryPreset, setExpiryPreset] = useState<'30' | '40' | '60' | 'custom'>('30');
  const [customExpiryValue, setCustomExpiryValue] = useState<number>(1);
  const [customExpiryUnit, setCustomExpiryUnit] = useState<'minutes' | 'hours' | 'days'>('hours');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    { id: crypto.randomUUID(), type: 'CHOICE', text: '', isRequired: false, options: [{ id: crypto.randomUUID(), value: '' }, { id: crypto.randomUUID(), value: '' }] }
  ]);

  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions([...questions, { id: crypto.randomUUID(), type: 'CHOICE', text: '', isRequired: false, options: [{ id: crypto.randomUUID(), value: '' }] }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const toggleQuestionRequired = (id: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, isRequired: !q.isRequired } : q));
  };

  const updateQuestionText = (id: string, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const updateQuestionType = (id: string, type: QuestionType) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, type, options: type === 'CHOICE' && q.options.length === 0 ? [{ id: crypto.randomUUID(), value: '' }] : q.options } : q));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, options: [...q.options, { id: crypto.randomUUID(), value: '' }] } : q));
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, options: q.options.filter(o => o.id !== optionId) } : q));
  };

  const updateOption = (questionId: string, optionId: string, value: string) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, options: q.options.map(o => o.id === optionId ? { ...o, value } : o) } : q));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let finalExpiryMinutes = 30;
    if (expiryPreset === 'custom') {
      const multiplier = customExpiryUnit === 'minutes' ? 1 : customExpiryUnit === 'hours' ? 60 : 1440;
      finalExpiryMinutes = customExpiryValue * multiplier;
    } else {
      finalExpiryMinutes = parseInt(expiryPreset);
    }

    const payload = {
      title,
      description: description || undefined,
      isAuthenticationRequired: requiresAuth,
      expiry: finalExpiryMinutes,
      questions: questions.map(q => ({
        question: q.text,
        questionType: q.type,
        isRequired: q.isRequired,
        options: q.type === 'CHOICE' ? q.options.map(o => o.value).filter(Boolean) : undefined
      }))
    };

    try {
      const {response, status} = await apiClient.createPoll(payload);

      if (status === 201) {
        navigate({
          to: `/poll/${response._id}`
        })
      };

    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message || "Failed to create poll");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 font-sans" style={{ paddingTop: '150px' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-(--sea-ink)">Create a New Poll</h1>
          <p className="text-lg text-(--sea-ink-soft)">Design your poll, add questions, and configure settings.</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Info Section */}
          <div className="bg-(--surface) border border-(--line) rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm transition-all hover:border-(--lagoon)">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-(--sea-ink)">
              <Settings className="w-5 h-5" style={{ color: '#F2923B' }} />
              General Information
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-(--sea-ink-soft) mb-2">Poll Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="E.g., Product Feedback Survey"
                  className="w-full bg-(--surface-strong) border border-(--line) rounded-xl px-4 py-3 text-(--sea-ink) placeholder-(--sea-ink-soft)/50 focus:outline-none focus:border-[#F2923B] focus:ring-1 focus:ring-[#F2923B] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--sea-ink-soft) mb-2">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide some context for your responders..."
                  rows={3}
                  className="w-full bg-(--surface-strong) border border-(--line) rounded-xl px-4 py-3 text-(--sea-ink) placeholder-(--sea-ink-soft)/50 focus:outline-none focus:border-[#F2923B] focus:ring-1 focus:ring-[#F2923B] transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <div key={q.id} className="bg-(--surface) border border-(--line) rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm relative group transition-all hover:border-(--lagoon)">
                {/* Delete Question Button */}
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    className="absolute top-4 right-4 p-2 text-(--sea-ink-soft) hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Remove Question"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                <div className="flex flex-col md:flex-row gap-4 items-start mb-6">
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-(--sea-ink-soft) mb-2">Question {qIndex + 1}</label>
                    <input
                      type="text"
                      value={q.text}
                      onChange={e => updateQuestionText(q.id, e.target.value)}
                      placeholder="What would you like to ask?"
                      className="w-full bg-(--surface-strong) border border-(--line) rounded-xl px-4 py-3 text-(--sea-ink) placeholder-(--sea-ink-soft)/50 focus:outline-none focus:border-[#F2923B] focus:ring-1 focus:ring-[#F2923B] transition-all text-lg font-medium"
                      required
                    />
                  </div>
                  <div className="w-full md:w-48 shrink-0">
                    <label className="block text-sm font-medium text-(--sea-ink-soft) mb-2">Answer Type</label>
                    <div className="relative">
                      <select
                        value={q.type}
                        onChange={e => updateQuestionType(q.id, e.target.value as QuestionType)}
                        className="w-full bg-(--surface-strong) border border-(--line) rounded-xl px-4 py-3 text-(--sea-ink) appearance-none focus:outline-none focus:border-[#F2923B] focus:ring-1 focus:ring-[#F2923B] transition-all cursor-pointer"
                      >
                        <option value="CHOICE" className="bg-(--bg-base)">Multiple Choice</option>
                        <option value="TEXT" className="bg-(--bg-base)">Text Input</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-(--sea-ink-soft)">
                        {q.type === 'CHOICE' ? <ListTodo className="w-4 h-4" /> : <AlignLeft className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Options for Multiple Choice */}
                {q.type === 'CHOICE' && (
                  <div className="space-y-3 pl-2 md:pl-6 border-l-2 border-(--line)">
                    {q.options.map((opt, oIndex) => (
                      <div key={opt.id} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-(--line) shrink-0" />
                        <input
                          type="text"
                          value={opt.value}
                          onChange={e => updateOption(q.id, opt.id, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1 bg-transparent border-b border-(--line) px-2 py-1.5 text-(--sea-ink) placeholder-(--sea-ink-soft)/50 focus:outline-none focus:border-[#F2923B] transition-colors"
                          required
                        />
                        {q.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOption(q.id, opt.id)}
                            className="p-1.5 text-(--sea-ink-soft) hover:text-red-500 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(q.id)}
                      className="flex items-center gap-2 text-sm mt-3 px-2 py-1.5 text-[#F2923B] hover:text-[#e07a1f] transition-colors font-medium cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Option
                    </button>
                  </div>
                )}

                {/* Text Input Preview */}
                {q.type === 'TEXT' && (
                  <div className="pl-2 md:pl-6 border-l-2 border-(--line)">
                    <div className="w-full bg-(--surface-strong) border border-(--line) rounded-xl px-4 py-3 text-(--sea-ink-soft) border-dashed">
                      Long answer text will appear here...
                    </div>
                  </div>
                )}

                {/* Required Toggle */}
                <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-(--line)">
                  <span className="text-sm font-medium text-(--sea-ink-soft) select-none">
                    Required
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleQuestionRequired(q.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#F2923B] focus:ring-offset-2 ${q.isRequired ? 'bg-[#F2923B]' : 'bg-(--line)'} cursor-pointer`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${q.isRequired ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-4 border-2 border-dashed border-(--line) rounded-2xl text-(--sea-ink-soft) hover:text-(--sea-ink) hover:border-[#F2923B]/50 hover:bg-[#F2923B]/5 flex items-center justify-center gap-2 font-medium transition-all group cursor-pointer"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Add Another Question
          </button>

          {/* Privacy/Auth Settings */}
          <div className="bg-(--surface) border border-(--line) rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-(--sea-ink) mb-1">Authentication Settings</h3>
              <p className="text-(--sea-ink-soft) text-sm">Decide who can participate in your poll.</p>
            </div>
            <div className="flex bg-(--surface-strong) p-1 rounded-xl border border-(--line) shrink-0">
              <button
                type="button"
                onClick={() => setRequiresAuth(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${!requiresAuth ? 'bg-(--bg-base) text-(--sea-ink) shadow-sm border border-(--line)' : 'text-(--sea-ink-soft) hover:text-(--sea-ink)'}`}
              >
                <ShieldOff className="w-4 h-4" />
                Anonymous
              </button>
              <button
                type="button"
                onClick={() => setRequiresAuth(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${requiresAuth ? 'bg-[#F2923B] text-white shadow-sm shadow-[#F2923B]/20' : 'text-(--sea-ink-soft) hover:text-(--sea-ink)'}`}
              >
                <Shield className="w-4 h-4" />
                Requires Login
              </button>
            </div>
          </div>

          {/* Expiry Settings */}
          <div className="bg-(--surface) border border-(--line) rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-all hover:border-(--lagoon)">
            <h3 className="text-lg font-bold text-(--sea-ink) mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F2923B]" />
              Poll Expiry
            </h3>
            <p className="text-(--sea-ink-soft) text-sm mb-5">When should this poll stop accepting new votes?</p>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {['30', '40', '60', 'custom'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setExpiryPreset(opt as any)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${expiryPreset === opt ? 'bg-[#F2923B] text-white border-[#F2923B] shadow-md shadow-[#F2923B]/20' : 'bg-(--surface-strong) border-(--line) text-(--sea-ink-soft) hover:text-(--sea-ink) hover:bg-(--surface)'}`}
                  >
                    {opt === 'custom' ? 'Custom' : `${opt} Minutes`}
                  </button>
                ))}
              </div>

              {expiryPreset === 'custom' && (
                <div className="flex items-center gap-3 mt-4 p-4 bg-(--surface-strong) border border-(--line) rounded-xl animate-in slide-in-from-top-2">
                  <input
                    type="number"
                    min="1"
                    value={customExpiryValue}
                    onChange={(e) => setCustomExpiryValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 bg-(--surface) border border-(--line) rounded-lg px-3 py-2 text-(--sea-ink) font-medium focus:outline-none focus:border-[#F2923B] focus:ring-1 focus:ring-[#F2923B]"
                  />
                  <select
                    value={customExpiryUnit}
                    onChange={(e) => setCustomExpiryUnit(e.target.value as any)}
                    className="bg-(--surface) border border-(--line) rounded-lg px-3 py-2 text-(--sea-ink) font-medium focus:outline-none focus:border-[#F2923B] focus:ring-1 focus:ring-[#F2923B] cursor-pointer"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 pb-20 md:pb-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(242,146,59,0.3)] transition-all duration-200 hover:shadow-[0_0_30px_rgba(242,146,59,0.5)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ backgroundColor: '#F2923B', color: 'white' }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Poll...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Publish Poll
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
