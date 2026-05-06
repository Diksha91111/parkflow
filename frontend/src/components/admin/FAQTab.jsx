import React, { useState, useEffect, useCallback } from 'react';
import {
  HelpCircle, Trash2, CheckCircle, ChevronDown, ChevronUp,
  Loader2, Search, RefreshCw, MessageCircleQuestion, ShieldCheck, User
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';

const FAQTab = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [answerInputs, setAnswerInputs] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState('user_questions'); // 'user_questions' | 'admin_answered' | 'all'
  const [search, setSearch] = useState('');

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/faqs');
      setFaqs(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  const handleSaveAnswer = async (faq) => {
    const answer = (answerInputs[faq._id] ?? '').trim();
    if (!answer) return toast.error('Please enter an answer');
    setSavingId(faq._id);
    try {
      const res = await api.put(`/api/admin/faqs/${faq._id}`, { answer });
      setFaqs(prev => prev.map(f => f._id === faq._id ? res.data.data : f));
      setAnswerInputs(prev => ({ ...prev, [faq._id]: '' }));
      setExpandedId(null);
      toast.success('Answer saved! The user will see your reply.');
    } catch (err) {
      toast.error('Failed to save answer');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/api/admin/faqs/${id}`);
      setFaqs(prev => prev.filter(f => f._id !== id));
      toast.success('Question deleted');
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatus = (faq) => {
    if (faq.answeredByAdmin) return 'admin_answered';
    return 'pending'; // All user questions default to pending until admin answers
  };

  // User questions = questions asked by real users (askedByUser flag)
  const userFaqs = faqs.filter(f => f.askedByUser);
  const pendingCount = userFaqs.filter(f => !f.answeredByAdmin).length;
  const adminAnsweredCount = userFaqs.filter(f => f.answeredByAdmin).length;

  const filteredFaqs = faqs.filter(faq => {
    const matchSearch = faq.question.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'user_questions') return faq.askedByUser === true; // ALL user-asked questions
    if (filter === 'admin_answered') return faq.answeredByAdmin === true;
    return true;
  });

  const statusConfig = {
    pending: {
      label: 'Needs Answer',
      badge: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700/50',
      dot: 'bg-red-400',
    },
    admin_answered: {
      label: 'Admin Answered',
      badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-700/50',
      dot: 'bg-emerald-400',
    },
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageCircleQuestion className="w-5 h-5 text-brand-600" />
            User Questions & Answers
          </h3>
          <p className="text-sm mt-1">
            {pendingCount > 0
              ? <span className="text-red-500 font-semibold">⚠ {pendingCount} question{pendingCount > 1 ? 's' : ''} waiting for your answer</span>
              : <span className="text-emerald-500 font-semibold">✓ All user questions have been answered</span>
            }
          </p>
        </div>
        <button onClick={fetchFaqs} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { key: 'user_questions', icon: HelpCircle, label: 'User Questions', count: userFaqs.length, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { key: 'admin_answered', icon: ShieldCheck, label: 'Admin Answered', count: adminAnsweredCount, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(stat => (
          <div key={stat.key} className={`${stat.bg} rounded-2xl p-4 flex items-center gap-3 cursor-pointer border-2 transition-all ${filter === stat.key ? 'border-brand-400' : 'border-transparent'}`} onClick={() => setFilter(stat.key)}>
            <stat.icon className={`w-6 h-6 ${stat.color} flex-shrink-0`} />
            <div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
          {[
            { key: 'user_questions', label: 'User Questions' },
            { key: 'admin_answered', label: 'Answered' },
            { key: 'all', label: 'All' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f.key
                  ? 'bg-white dark:bg-slate-600 text-brand-600 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {f.label}
              {f.key === 'user_questions' && pendingCount > 0 && (
                <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 text-[10px]">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No questions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map(faq => {
            const status = getStatus(faq);
            const cfg = statusConfig[status];
            const isExpanded = expandedId === faq._id;

            return (
              <div key={faq._id} className={`rounded-2xl border transition-all ${cfg.badge}`}>
                {/* Status bar */}
                <div className={`flex items-center justify-between px-4 py-2 border-b ${cfg.badge} rounded-t-2xl`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className="text-xs font-bold uppercase tracking-wider">{cfg.label}</span>
                    {faq.askedByUser && (
                      <span className="flex items-center gap-1 text-xs bg-white/60 dark:bg-slate-800/60 px-2 py-0.5 rounded-full">
                        <User className="w-3 h-3" /> {faq.userName || 'User'}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {new Date(faq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Question + Controls */}
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug">{faq.question}</p>
                    {status !== 'pending' && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                        <span className="font-semibold">{status === 'admin_answered' ? '👤 Admin:' : '🤖 AI:'}</span> {faq.answer}
                      </p>
                    )}
                    {status === 'pending' && (
                      <p className="text-xs text-red-400 mt-1 italic">No answer yet — please respond below</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : faq._id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        status === 'pending'
                          ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
                          : 'bg-white/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600'
                      }`}
                    >
                      {status === 'pending' ? 'Answer Now' : 'Edit Answer'}
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      disabled={deletingId === faq._id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete"
                    >
                      {deletingId === faq._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Answer Panel */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/40 dark:border-slate-700/40 pt-3">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">Your Answer (visible to the user)</label>
                    <textarea
                      rows={3}
                      placeholder="Type your answer here..."
                      value={answerInputs[faq._id] !== undefined ? answerInputs[faq._id] : (status !== 'pending' ? faq.answer : '')}
                      onChange={e => setAnswerInputs(prev => ({ ...prev, [faq._id]: e.target.value }))}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => setExpandedId(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveAnswer(faq)}
                        disabled={savingId === faq._id}
                        className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                      >
                        {savingId === faq._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Send Answer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FAQTab;
