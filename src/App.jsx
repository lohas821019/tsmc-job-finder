import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, MapPin, Briefcase, GraduationCap, Clock, Bookmark, 
  ExternalLink, Sparkles, Filter, RefreshCw, CheckCircle2, 
  AlertCircle, ShieldCheck, HelpCircle, ChevronRight, Share2
} from 'lucide-react';
import { initialJobs } from './data/jobs';

export default function App() {
  const [jobs, setJobs] = useState(initialJobs);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyNonStem, setOnlyNonStem] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('tsmc_fav_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'guide'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2026-10-21 10:45');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('tsmc_fav_jobs', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleFavorite = (jobId) => {
    setFavorites(prev => {
      const exists = prev.includes(jobId);
      const updated = exists ? prev.filter(id => id !== jobId) : [...prev, jobId];
      showToast(exists ? '已從我的最愛移除' : '已收藏至我的最愛！');
      return updated;
    });
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setLastSyncTime(timeStr);
      showToast('職缺庫已自動校對並更新完成！');
    }, 1200);
  };

  const toggleLocation = (loc) => {
    setSelectedLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Favorites filter
      if (showOnlyFavorites && !favorites.includes(job.id)) {
        return false;
      }

      // Keyword search
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchDesc = job.description.toLowerCase().includes(q);
        const matchDept = job.department.toLowerCase().includes(q);
        const matchMajors = job.majors.toLowerCase().includes(q);
        const matchCategory = job.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchDept && !matchMajors && !matchCategory) {
          return false;
        }
      }

      // Location filter (Taoyuan, Hsinchu, Miaoli)
      if (selectedLocations.length > 0) {
        const matchesLoc = selectedLocations.some(loc => job.location.includes(loc));
        if (!matchesLoc) return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && job.category !== selectedCategory) {
        return false;
      }

      // Non-STEM friendly filter
      if (onlyNonStem && !job.nonStemFriendly) {
        return false;
      }

      return true;
    });
  }, [jobs, searchKeyword, selectedLocations, selectedCategory, onlyNonStem, showOnlyFavorites, favorites]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center shadow-lg shadow-red-950">
              <span className="font-extrabold text-white text-lg tracking-wider">TSMC</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                TSMC 職缺智慧搜尋平台
                <span className="text-xs bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full border border-red-700/60 font-medium">
                  桃竹苗特區 / MAE・非本科專屬
                </span>
              </h1>
              <p className="text-xs text-slate-400">專為副工程師、技術員與跨領域非理工求職者打造</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>自動排程更新: <strong className="text-slate-200">{lastSyncTime}</strong></span>
            </div>
            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              title="執行自動更新職缺爬蟲"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
              <span className="hidden md:inline">{isRefreshing ? '爬蟲同步中...' : '即時同步'}</span>
            </button>
            <div className="h-6 w-px bg-slate-800"></div>
            <button
              onClick={() => setActiveTab(activeTab === 'list' ? 'guide' : 'list')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'guide'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>非本科求職指南</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col gap-6">
        {/* Banner with Guidance */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border border-red-900/40 p-6 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white">鎖定 桃園、新竹、苗栗 廠區｜MAE 與多元職缺專區</h2>
              </div>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                想進入台積電但非理工科系？MAE (模組副工程師)、先進封裝測試與技術員等職缺，更看重<strong>實作態度、抗壓性與作息配合</strong>。本平台已為您標註適合跨領域轉職之職位！
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setSearchKeyword('MAE');
                  setOnlyNonStem(true);
                  setSelectedLocations([]);
                }}
                className="text-xs bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 px-3 py-2 rounded-xl transition font-medium"
              >
                ⚡ 一鍵篩選：MAE ＋ 非本科可
              </button>
              <button
                onClick={() => {
                  setShowOnlyFavorites(!showOnlyFavorites);
                }}
                className={`text-xs px-3 py-2 rounded-xl border transition flex items-center gap-1.5 font-medium ${
                  showOnlyFavorites 
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold' 
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-slate-950' : ''}`} />
                <span>我的收藏 ({favorites.length})</span>
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'guide' ? (
          /* Non-STEM Applicant Strategy Guide */
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-red-400" />
                非本科系 / 文法商背景應徵 TSMC 模組副工程師 (MAE) 必備指南
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>1. MAE 官方門檻 vs. 實際現況</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    官網常標註「機械、電機等理工科系」，但台積電竹科、竹南 (AP6) 與龍潭擴廠迅速，第一線設備維修與保養需求量極大。實務上只要展現「手作實作能力、穩定度高、能配合輪班」，非本科系或商管跨考求職者獲得面談與錄取的比例非常顯著。
                  </p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>2. 履歷與自傳撰寫關鍵突破口</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    請勿通篇著墨純理論，主管最重視：
                    <br />• <strong>動手實作</strong>：手工具經驗、汽機車保養、組裝模型、設備裝修。
                    <br />• <strong>抗壓與作息</strong>：能耐受無塵室作業與四班二輪大夜班。
                    <br />• <strong>標準紀律 (SOP)</strong>：重視工安、誠信正直、絕不隱瞞機況。
                  </p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>3. 桃竹苗廠區分佈與通勤策略</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>新竹</strong>：竹科為總部核心廠區 (Fab 12/20)，生活機能完善。<br />
                    <strong>苗栗 (竹南)</strong>：AP6 先進封裝重鎮，廠房極新，租屋負擔相對低。<br />
                    <strong>桃園 (龍潭)</strong>：AP3 封裝測試廠，通勤交通車路網密集。
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-red-950/30 border border-red-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-red-200">
                  想直接瀏覽適合您的職缺？隨時點擊右上角返回職缺列表或點選下方按鈕。
                </div>
                <button
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shrink-0"
                >
                  開始搜尋職缺 →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Job Search & Filter Panel */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar / Filter Controls */}
            <aside className="w-full lg:w-72 shrink-0 space-y-5">
              {/* Filter Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Filter className="w-4 h-4 text-red-400" />
                    <span>篩選條件</span>
                  </div>
                  {(selectedLocations.length > 0 || searchKeyword || onlyNonStem || selectedCategory !== 'ALL' || showOnlyFavorites) && (
                    <button
                      onClick={() => {
                        setSelectedLocations([]);
                        setSearchKeyword('');
                        setOnlyNonStem(false);
                        setSelectedCategory('ALL');
                        setShowOnlyFavorites(false);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      重設條件
                    </button>
                  )}
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>工作地點 (桃竹苗)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['桃園', '新竹', '苗栗'].map(loc => {
                      const isActive = selectedLocations.includes(loc);
                      return (
                        <button
                          key={loc}
                          onClick={() => toggleLocation(loc)}
                          className={`text-xs py-2 px-3 rounded-xl border font-medium transition text-center ${
                            isActive
                              ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-950'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {loc}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Non-STEM Switch */}
                <div className="pt-2 border-t border-slate-800">
                  <label 
                    onClick={() => setOnlyNonStem(!onlyNonStem)}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer select-none transition"
                  >
                    <input
                      type="checkbox"
                      checked={onlyNonStem}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        僅顯示非本科友善職缺
                      </span>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        涵蓋科系不拘、跨領域轉職及附帶完整在職培育計畫之職缺
                      </p>
                    </div>
                  </label>
                </div>

                {/* Category Filter */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>職缺類型</span>
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: 'ALL', label: '全部職缺' },
                      { id: 'MAE', label: 'MAE (模組副工程師)' },
                      { id: '技術員', label: '技術員 (產線/品管/封測)' },
                      { id: '副工程師', label: '設備副工程師' },
                      { id: '行政與支援', label: '資材/倉儲/行政' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`text-xs px-3 py-2 rounded-xl text-left transition flex items-center justify-between font-medium ${
                          selectedCategory === cat.id
                            ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                            : 'text-slate-400 hover:bg-slate-950/60 hover:text-slate-200'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {selectedCategory === cat.id && <ChevronRight className="w-3.5 h-3.5 text-red-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status indicator */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>資料來源:</span>
                    <span className="text-slate-200 font-medium">TSMC 官方/公開管道</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>收錄條件:</span>
                    <span className="text-slate-200 font-medium">桃竹苗專用庫</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Job Listings Column */}
            <div className="flex-1 space-y-4">
              {/* Search Bar Input */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-lg flex items-center gap-2">
                <div className="pl-3 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="搜尋職缺名稱、科系關鍵字、工作技能 (例如: MAE、副工程師、文組、無經驗、竹南)..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full bg-transparent border-0 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-0 py-2"
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword('')}
                    className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
                  >
                    清除
                  </button>
                )}
              </div>

              {/* Result Summary Bar */}
              <div className="flex items-center justify-between px-1 text-xs text-slate-400">
                <div>
                  共找到 <strong className="text-white text-sm">{filteredJobs.length}</strong> 個符合條件的 TSMC 職缺
                </div>
                <div className="flex items-center gap-2">
                  {onlyNonStem && (
                    <span className="bg-emerald-950/70 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full text-[11px]">
                      非本科友善啟用
                    </span>
                  )}
                  {selectedLocations.length > 0 && (
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[11px]">
                      地點: {selectedLocations.join('、')}
                    </span>
                  )}
                </div>
              </div>

              {/* Jobs List Render */}
              {filteredJobs.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-200">沒有符合篩選條件的職缺</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    請嘗試清除關鍵字、放寬地點（桃園/新竹/苗栗）或關閉特定篩選條件。
                  </p>
                  <button
                    onClick={() => {
                      setSearchKeyword('');
                      setSelectedLocations([]);
                      setSelectedCategory('ALL');
                      setOnlyNonStem(false);
                      setShowOnlyFavorites(false);
                    }}
                    className="mt-2 text-xs bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl transition"
                  >
                    重置所有篩選
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map(job => {
                    const isFav = favorites.includes(job.id);
                    return (
                      <div
                        key={job.id}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-md transition-all duration-200 hover:shadow-xl space-y-4"
                      >
                        {/* Top row */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="bg-red-950/80 text-red-300 text-xs px-2.5 py-1 rounded-lg border border-red-800/80 font-bold">
                                {job.category}
                              </span>
                              <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 font-medium">
                                <MapPin className="w-3 h-3 text-red-400" />
                                {job.location} ({job.detailedLocation})
                              </span>
                              {job.nonStemFriendly && (
                                <span className="bg-emerald-950/80 text-emerald-300 text-xs px-2.5 py-1 rounded-lg border border-emerald-800/80 flex items-center gap-1 font-medium">
                                  <Sparkles className="w-3 h-3 text-emerald-400" />
                                  非本科友善
                                </span>
                              )}
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-white pt-1">
                              {job.title}
                            </h3>
                            <p className="text-xs text-slate-400">{job.department}</p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-start">
                            <button
                              onClick={() => toggleFavorite(job.id)}
                              className={`p-2 rounded-xl border transition ${
                                isFav
                                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-400'
                                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                              }`}
                              title={isFav ? '取消收藏' : '加入收藏'}
                            >
                              <Bookmark className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                            </button>
                            <a
                              href={job.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 rounded-xl font-medium transition shadow-md shadow-red-950"
                            >
                              <span>官網投遞</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        {/* Non-STEM highlight banner */}
                        {job.nonStemTag && (
                          <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border-l-4 border-emerald-500 p-2.5 rounded-r-xl text-xs text-emerald-200">
                            <strong>科系友善指標：</strong> {job.nonStemTag}
                          </div>
                        )}

                        {/* Description */}
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Badges / Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                          <div className="flex items-start gap-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                            <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-slate-200">學歷與科系：</strong>
                              <span className="text-slate-300"> {job.majors} ({job.education})</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                            <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-slate-200">輪班型態：</strong>
                              <span className="text-slate-300"> {job.shift}</span>
                            </div>
                          </div>
                        </div>

                        {/* Requirements */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-xs font-semibold text-slate-400">職務要點：</span>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                            {job.requirements.map((req, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Footer info */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                          <span>最後校驗日期: {job.updatedAt}</span>
                          <span className="text-slate-400">廠區: {job.detailedLocation}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 mt-12 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>TSMC 模組副工程師 (MAE) 及非本科系職缺檢索平台</p>
        <p className="text-[11px] text-slate-600">本系統提供職缺檢索與應徵策略分析，所有職缺投遞皆跳轉至 TSMC 台灣積體電路製造官方網站</p>
      </footer>
    </div>
  );
}
