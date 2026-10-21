import React, { useState, useMemo } from 'react';
import {
  Search,
  Clock,
  Plus,
  Check,
  Info,
  Filter,
  ArrowUpDown,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TEST_CATEGORIES } from '../../data/initialData';
import { DiagnosticTest } from '../../types';

export const TestsSection: React.FC = () => {
  const { tests, addToCart, removeFromCart, cart, setIsCartOpen, setSelectedTestForDetail, websiteConfig } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Tests');
  const [sortOrder, setSortOrder] = useState<'default' | 'price_asc' | 'price_desc' | 'name_asc'>('default');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Filter tests based on search, category, active status, and verification
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      // Must be active
      if (!test.active) return false;

      // Verification constraint for online booking
      if (onlyVerified && (!test.verified || test.generalPrice === null || test.generalPrice <= 0)) {
        return false;
      }

      // Category filter
      const matchesCategory =
        selectedCategory === 'All Tests' || test.category === selectedCategory;

      // Search filter: matches name, shortName, code, or description
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        test.name.toLowerCase().includes(query) ||
        (test.shortName && test.shortName.toLowerCase().includes(query)) ||
        test.code.toLowerCase().includes(query) ||
        (test.description && test.description.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [tests, selectedCategory, searchQuery, onlyVerified]);

  // Sort tests
  const sortedTests = useMemo(() => {
    const list = [...filteredTests];
    if (sortOrder === 'price_asc') {
      return list.sort((a, b) => {
        const pA = a.generalPrice ?? 999999;
        const pB = b.generalPrice ?? 999999;
        return pA - pB;
      });
    }
    if (sortOrder === 'price_desc') {
      return list.sort((a, b) => {
        const pA = a.generalPrice ?? -1;
        const pB = b.generalPrice ?? -1;
        return pB - pA;
      });
    }
    if (sortOrder === 'name_asc') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    // Default: serialNo if official test, then code
    return list.sort((a, b) => {
      if (a.serialNo && b.serialNo) return a.serialNo - b.serialNo;
      if (a.serialNo) return -1;
      if (b.serialNo) return 1;
      return a.code.localeCompare(b.code);
    });
  }, [filteredTests, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedTests.length / itemsPerPage) || 1;
  const paginatedTests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTests.slice(start, start + itemsPerPage);
  }, [sortedTests, currentPage, itemsPerPage]);

  const handleBook = (test: DiagnosticTest) => {
    if (!test.verified || test.generalPrice === null) return;
    addToCart({
      type: 'TEST',
      itemId: test.id,
      name: test.name,
      price: test.generalPrice,
      sample: test.sample || 'Blood Sample',
      reportingTime: test.reportingTime || 'Same Day'
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Tests');
    setSortOrder('default');
    setOnlyVerified(true);
    setCurrentPage(1);
  };

  return (
    <section id="tests" className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Official Laboratory Test Catalogue · Pratap Nagar, Jaipur</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Lab Tests & Online Booking
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Browse available diagnostic tests and book your appointment with B.L. Diagnostic Center. All sample analyses performed under standard automated protocols.
            </p>
          </div>

          {/* Quick Stats or Booking summary trigger */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => {
                setOnlyVerified(!onlyVerified);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                onlyVerified
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}
              title="Toggle to view all official handwritten tests including pending items"
            >
              <span className={`w-2 h-2 rounded-full ${onlyVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{onlyVerified ? 'Showing Verified Tests Only' : 'Showing All Tests (incl. Pending)'}</span>
            </button>

            {cart.length > 0 && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>View Selected ({cart.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar: Search, Category, Sort */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by test name or abbreviation (e.g. CBC, CRP, LFT, Sugar, Widal, Vitamin)..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none placeholder:text-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort & Reset Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500 font-medium">Sort:</span>
                <select
                  value={sortOrder}
                  onChange={e => {
                    setSortOrder(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="default">Catalogue Order</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Test Name: A to Z</option>
                </select>
              </div>

              {(searchQuery || selectedCategory !== 'All Tests' || sortOrder !== 'default' || !onlyVerified) && (
                <button
                  onClick={handleClearFilters}
                  className="px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Clear all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin border-b border-slate-100">
            {TEST_CATEGORIES.map(category => {
              const count = tests.filter(t => {
                if (!t.active) return false;
                if (onlyVerified && (!t.verified || t.generalPrice === null || t.generalPrice <= 0)) return false;
                return category === 'All Tests' || t.category === category;
              }).length;

              return (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === category
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <span>{category}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedCategory === category ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-800 font-semibold">{filteredTests.length}</strong> tests
            {selectedCategory !== 'All Tests' ? ` in ${selectedCategory}` : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </span>
          {onlyVerified && (
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Prices verified & ready for instant booking</span>
            </span>
          )}
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedTests.map(test => {
            const inCart = cart.some(c => c.itemId === test.id);
            const isPending = !test.verified || test.generalPrice === null;

            return (
              <div
                key={test.id}
                className={`bg-white border rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md relative ${
                  isPending
                    ? 'border-amber-200/90 bg-amber-50/20'
                    : inCart
                    ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Metadata: Category, Short Name / Code, Serial No & Verification Status */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-slate-500 flex-wrap">
                      {test.serialNo && (
                        <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                          #{test.serialNo}
                        </span>
                      )}
                      <span className="text-slate-600">{test.category}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {test.shortName || test.code}
                      </span>
                    </div>

                    {/* Badge */}
                    {isPending ? (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Pending Verification</span>
                      </span>
                    ) : test.popular ? (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        Popular
                      </span>
                    ) : null}
                  </div>

                  {/* Test Name */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-900 transition-colors">
                      {test.name}
                    </h3>
                    {test.shortName && test.name !== test.shortName && !test.name.includes(`(${test.shortName})`) && (
                      <span className="text-xs text-slate-500 font-medium block mt-0.5">
                        Abbreviation: <span className="font-semibold text-slate-700">{test.shortName}</span>
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {test.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  )}

                  {/* Specimen and Reporting Details */}
                  <div className="bg-slate-50/90 rounded-lg p-3 space-y-1.5 text-[11px] text-slate-600 border border-slate-100">
                    {test.sample && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Sample:</span>
                        <span className="font-medium text-slate-800 truncate ml-2 max-w-[190px]">
                          {test.sample}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Report Ready:</span>
                      <span className="font-semibold text-blue-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{test.reportingTime || 'Same Day'}</span>
                      </span>
                    </div>
                    {test.method && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Method:</span>
                        <span className="text-slate-700 truncate ml-2 max-w-[190px]">
                          {test.method}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Verification Note (if pending) */}
                  {isPending && test.verificationNote && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{test.verificationNote}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Bar: Price & Action Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Test Price (INR)
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      {test.generalPrice !== null && test.generalPrice !== undefined ? (
                        <>
                          <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums">
                            ₹{test.generalPrice.toLocaleString('en-IN')}
                          </span>
                          {!test.verified && (
                            <span className="text-[10px] text-amber-600 font-semibold">*Unconfirmed</span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                          Price on Request
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedTestForDetail(test)}
                      className="px-2.5 py-2 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                      title="View complete test information"
                    >
                      <span>Details</span>
                    </button>

                    {/* Book Test Button */}
                    {isPending ? (
                      <a
                        href={`tel:${websiteConfig.helplinePhone}`}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors flex items-center gap-1.5"
                        title="Contact laboratory to verify price and book"
                      >
                        <PhoneCall className="w-3 h-3 text-amber-700" />
                        <span>Call Lab</span>
                      </a>
                    ) : inCart ? (
                      <button
                        onClick={() => {
                          const item = cart.find(c => c.itemId === test.id);
                          if (item) removeFromCart(item.id);
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-red-600 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs group/btn"
                        title="Click to remove from selection"
                      >
                        <Check className="w-3.5 h-3.5 group-hover/btn:hidden" />
                        <span className="group-hover/btn:hidden">Selected</span>
                        <span className="hidden group-hover/btn:inline">Remove</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleBook(test);
                          setIsCartOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Book Test</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTests.length === 0 && (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-slate-200 max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No diagnostic tests matching your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find tests for "{searchQuery}". Try searching for common terms like "CBC", "Sugar", "LFT", "Thyroid", or clear your filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-2 px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing page <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-800">{totalPages}</span> ({filteredTests.length} total tests)
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentPage === page
                      ? 'bg-blue-900 text-white'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
