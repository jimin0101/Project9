import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Check, ThumbsUp, TrendingUp } from 'lucide-react';
import { VERIFIED_CERT_BENCHMARKS, type VerifiedBenchmarkMeta } from '../data/verifiedCertBenchmarks';
import type {
  ConceptSubject,
  InstructorAnalysis,
  WorkbookAnalysis,
  YearlyPassRate,
} from '../types/cert';

export function parsePercentNumber(raw: string): number | null {
  if (!raw) return null;
  const rangeMatch = raw.match(/(\d+(?:\.\d+)?)\s*~\s*(\d+(?:\.\d+)?)\s*%/);
  if (rangeMatch) {
    return Number(((Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2).toFixed(1));
  }
  const match = raw.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) return null;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : null;
}

function parseRatioPair(ratioText: string): { concept: number; problem: number } | null {
  const nums = ratioText.match(/\d+/g);
  if (!nums || nums.length < 2) return null;
  const first = Number(nums[0]);
  const second = Number(nums[1]);
  if (!Number.isFinite(first) || !Number.isFinite(second) || first + second <= 0) return null;

  const normalizedSum = first + second;
  const firstPct = Math.round((first / normalizedSum) * 100);
  const secondPct = 100 - firstPct;

  const lower = ratioText.toLowerCase();
  // If second number explicitly precedes problem/실습 keyword while first is concept/이론, first=concept
  const problemFirst =
    lower.indexOf('문제') !== -1 &&
    lower.indexOf('개념') !== -1 &&
    lower.indexOf('문제') < lower.indexOf('개념');
  const practiceFirst =
    lower.indexOf('실습') !== -1 &&
    lower.indexOf('이론') !== -1 &&
    lower.indexOf('실습') < lower.indexOf('이론');

  if (problemFirst || practiceFirst) {
    return { concept: secondPct, problem: firstPct };
  }
  return { concept: firstPct, problem: secondPct };
}

function parseSubjectWeightNum(weightText: string, fallbackEqual: number): number {
  const pctMatch = weightText.match(/(\d+(?:\.\d+)?)\s*%/);
  if (pctMatch) return Number(pctMatch[1]);
  const qMatch = weightText.match(/(\d+)\s*문항/);
  if (qMatch) return Number(qMatch[1]);
  const ptMatch = weightText.match(/(\d+)\s*점/);
  if (ptMatch) return Number(ptMatch[1]);
  return fallbackEqual;
}

interface PassRateTrendChartProps {
  passRates: YearlyPassRate[];
}

export const PassRateTrendChart: React.FC<PassRateTrendChartProps> = ({ passRates }) => {
  const data = useMemo(
    () =>
      passRates.map((row) => ({
        year: row.year,
        written: parsePercentNumber(row.writtenRate),
        practical: parsePercentNumber(row.practicalRate),
        writtenRaw: row.writtenRate,
        practicalRaw: row.practicalRate,
      })),
    [passRates]
  );

  const hasChartData = data.some((d) => d.written !== null || d.practical !== null);
  const hasPractical = data.some((d) => d.practical !== null);

  if (!hasChartData) return null;

  return (
    <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-slate-900">연도·회차별 공식 합격률 추이 (%)</h4>
          <p className="text-xs text-slate-500">막대에 마우스를 올리면 정확한 수치(%)를 확인할 수 있습니다</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-700 inline-block rounded-xs" /> 필기·1차
          </span>
          {hasPractical && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-600 inline-block rounded-xs" /> 실기·2차
            </span>
          )}
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: '#475569' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                borderColor: '#E2E8F0',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              }}
              formatter={(value, name) => {
                const label = name === 'written' ? '필기/1차 합격률' : '실기/2차 합격률';
                return [`${value}%`, label];
              }}
            />
            <Bar
              dataKey="written"
              name="written"
              fill="#1D4ED8"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            {hasPractical && (
              <Bar
                dataKey="practical"
                name="practical"
                fill="#059669"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            )}
            {data.length >= 2 && (
              <Line
                type="monotone"
                dataKey={hasPractical ? 'practical' : 'written'}
                stroke={hasPractical ? '#047857' : '#1E40AF'}
                strokeWidth={2}
                dot={{ r: 3.5, fill: '#FFFFFF', strokeWidth: 2 }}
                legendType="none"
                connectNulls
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface SubjectWeightChartProps {
  subjects: ConceptSubject[];
}

export const SubjectWeightChart: React.FC<SubjectWeightChartProps> = ({ subjects }) => {
  const chartData = useMemo(() => {
    const raw = subjects.map((s) => ({
      name: s.name.replace(/^\d+(?:·\d+)?과목\s*/, '').slice(0, 16),
      fullName: s.name,
      weightText: s.weight,
      rawVal: parseSubjectWeightNum(s.weight, 1),
    }));
    const sum = raw.reduce((acc, r) => acc + r.rawVal, 0) || 1;
    return raw.map((r) => ({
      ...r,
      sharePct: Math.round((r.rawVal / sum) * 100),
    }));
  }, [subjects]);

  if (chartData.length < 2) return null;

  return (
    <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-bold text-slate-900">과목별 출제 비중 한눈에 보기 (%)</div>
        <div className="text-xs text-slate-500">비중이 큰 과목부터 우선 시간을 배분하세요</div>
      </div>

      <div className="space-y-2.5">
        {chartData.map((row, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-slate-800 truncate">{row.fullName}</span>
              <span className="font-mono-num text-slate-600 shrink-0">
                {row.weightText} · 약 {row.sharePct}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-700 rounded-full"
                style={{ width: `${Math.max(6, Math.min(100, row.sharePct))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface WorkbookRatioChartProps {
  books: WorkbookAnalysis[];
}

export const WorkbookRatioChart: React.FC<WorkbookRatioChartProps> = ({ books }) => {
  const rows = useMemo(() => {
    return books
      .map((book) => {
        const parsed = parseRatioPair(book.conceptVsProblemRatio);
        if (!parsed) return null;
        return {
          title: book.title.length > 22 ? `${book.title.slice(0, 22)}…` : book.title,
          fullTitle: book.title,
          publisher: book.publisher,
          conceptPct: parsed.concept,
          problemPct: parsed.problem,
          raw: book.conceptVsProblemRatio,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [books]);

  if (rows.length === 0) return null;

  return (
    <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900">교재별 개념 vs 문제 구성 비율 비교표</h4>
          <p className="text-xs text-slate-500">
            이론 입문이 필요하면 파란 막대(개념)가 큰 교재를, 기출 회독이 목적이면 초록 막대(문제)가 큰 교재를 선택하세요
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-700 inline-block rounded-xs" /> 개념·이론 비중 (%)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-600 inline-block rounded-xs" /> 기출·문제 비중 (%)
          </span>
        </div>
      </div>

      <div className="w-full" style={{ height: Math.max(150, rows.length * 52) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748B' }}
              unit="%"
            />
            <YAxis
              type="category"
              dataKey="title"
              width={160}
              tick={{ fontSize: 11, fill: '#0F172A' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                borderColor: '#E2E8F0',
                fontSize: '12px',
              }}
              formatter={(value, name) => [
                `${value}%`,
                name === 'conceptPct' ? '개념·이론 비중' : '기출·문제 비중',
              ]}
            />
            <Bar dataKey="conceptPct" stackId="ratio" fill="#1D4ED8" radius={[4, 0, 0, 4]} barSize={20} />
            <Bar dataKey="problemPct" stackId="ratio" fill="#059669" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface InstructorComparisonVisualProps {
  certName: string;
  instructors: InstructorAnalysis[];
}

const VOTE_STORAGE_KEY = 'jagyeok_instructor_votes_v1';

function loadVotesMap(): Record<string, Record<string, number>> {
  try {
    const raw = localStorage.getItem(VOTE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Record<string, number>>) : {};
  } catch {
    return {};
  }
}

export const InstructorComparisonVisual: React.FC<InstructorComparisonVisualProps> = ({
  certName,
  instructors,
}) => {
  const [votesMap, setVotesMap] = useState<Record<string, Record<string, number>>>(() => loadVotesMap());
  const [userPickedName, setUserPickedName] = useState<string | null>(null);

  if (instructors.length === 0) return null;

  const certVotes = votesMap[certName] || {};
  const totalVotes = instructors.reduce((sum, inst) => sum + (certVotes[inst.name] || 0), 0);

  const handleVote = (instructorName: string) => {
    setVotesMap((prev) => {
      const currentCert = { ...(prev[certName] || {}) };
      if (userPickedName && userPickedName !== instructorName && (currentCert[userPickedName] || 0) > 0) {
        currentCert[userPickedName] = currentCert[userPickedName] - 1;
      }
      if (userPickedName !== instructorName) {
        currentCert[instructorName] = (currentCert[instructorName] || 0) + 1;
        setUserPickedName(instructorName);
      }
      const next = { ...prev, [certName]: currentCert };
      try {
        localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore quota error
      }
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Structured Instructor Matrix Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
            <tr>
              <th className="py-3 px-4 font-semibold">강사 · 플랫폼</th>
              <th className="py-3 px-4 font-semibold">사용 교재 (출판사)</th>
              <th className="py-3 px-4 font-semibold">합격률 공식 공개 여부</th>
              <th className="py-3 px-4 font-semibold">추천 수험생 유형</th>
              <th className="py-3 px-4 font-semibold text-right">내 선호 선택</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {instructors.map((inst, idx) => {
              const isPicked = userPickedName === inst.name;
              const votes = certVotes[inst.name] || 0;
              const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
              return (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{inst.name}</div>
                    <div className="text-xs text-slate-500">{inst.platform}</div>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-700">
                    <div className="font-medium text-slate-900">{inst.textbookUsed}</div>
                    {inst.textbookPublisher && (
                      <div className="text-slate-500">{inst.textbookPublisher}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-700 max-w-xs">
                    {inst.passRateInfo}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-700 max-w-xs">{inst.bestFor}</td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleVote(inst.name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                        isPicked
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isPicked ? <Check className="w-3.5 h-3.5" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                      <span>{isPicked ? '선택됨' : '선호 선택'}</span>
                      {totalVotes > 0 && (
                        <span className="font-mono-num opacity-85">({pct}%)</span>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transparent Instructor Preference Share Bar */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-900">
            강사 선호 선택 비율표 (실시간 참여 반영 · 허위 점유율 수치 배제)
          </div>
          <span className="text-xs text-slate-500 font-mono-num">
            {totalVotes > 0 ? `총 ${totalVotes}회 선택 반영` : '표의 [선호 선택] 버튼을 누르면 비율이 즉시 집계됩니다'}
          </span>
        </div>

        {totalVotes > 0 ? (
          <div className="space-y-2">
            {instructors.map((inst, idx) => {
              const votes = certVotes[inst.name] || 0;
              const pct = Math.round((votes / totalVotes) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">
                      {inst.name} <span className="text-slate-500">({inst.platform})</span>
                    </span>
                    <span className="font-mono-num font-semibold text-blue-700">
                      {pct}% ({votes}표)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-700 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-600 leading-relaxed">
            국내 학원가는 공식 수강생 점유율·합격률 전수 통계를 공개하지 않으므로 임의 퍼센트를 생성하지 않습니다. 위 비교표에서 강사별 사용 교재·강의 스타일을 확인한 뒤 <strong>[선호 선택]</strong>을 누르면 비율 그래프가 실시간으로 집계됩니다.
          </p>
        )}
      </div>
    </div>
  );
};

interface FlagshipPassRateOverviewChartProps {
  onSelectCertByName: (certName: string) => void;
  onCompareCertPair?: (certA: string, certB: string) => void;
}

export const FlagshipPassRateOverviewChart: React.FC<FlagshipPassRateOverviewChartProps> = ({
  onSelectCertByName,
  onCompareCertPair,
}) => {
  const [sortBy, setSortBy] = useState<'default' | 'hardest' | 'easiest'>('default');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const categories = useMemo(
    () => ['전체', ...Array.from(new Set(VERIFIED_CERT_BENCHMARKS.map((b) => b.category)))],
    []
  );

  const filteredBenchmarks = useMemo(() => {
    const base =
      selectedCategory === '전체'
        ? VERIFIED_CERT_BENCHMARKS
        : VERIFIED_CERT_BENCHMARKS.filter((b) => b.category === selectedCategory);

    if (sortBy === 'hardest') {
      return [...base].sort((a, b) => {
        const aMin = a.latestPracticalRateNum ?? a.latestWrittenRateNum ?? 100;
        const bMin = b.latestPracticalRateNum ?? b.latestWrittenRateNum ?? 100;
        return aMin - bMin;
      });
    }
    if (sortBy === 'easiest') {
      return [...base].sort((a, b) => {
        const aMin = a.latestPracticalRateNum ?? a.latestWrittenRateNum ?? 0;
        const bMin = b.latestPracticalRateNum ?? b.latestWrittenRateNum ?? 0;
        return bMin - aMin;
      });
    }
    return base;
  }, [selectedCategory, sortBy]);

  const chartData = useMemo(
    () =>
      filteredBenchmarks.map((b: VerifiedBenchmarkMeta) => ({
        name: b.shortName,
        certName: b.certName,
        written: b.latestWrittenRateNum ?? 0,
        practical: b.latestPracticalRateNum ?? null,
        period: b.latestPeriodLabel,
      })),
    [filteredBenchmarks]
  );

  return (
    <section
      id="passrate-map-section"
      className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 no-print"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>OFFICIAL BENCHMARK MAP</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            주요 인기 자격증 공식 합격률 한눈에 비교 도표
          </h2>
          <p className="text-sm text-slate-600">
            큐넷(Q-Net)·K-Data·KCA·대한상공회의소·한국세무사회·국사편찬위원회 공식 발표 수치만 반영했습니다. 막대나 행을 클릭하면 해당 자격증 리포트를 바로 조회합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                ['default', '대표순'],
                ['hardest', '합격률 낮은순'],
                ['easiest', '합격률 높은순'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSortBy(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  sortBy === key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {onCompareCertPair && (
            <button
              type="button"
              onClick={() => onCompareCertPair('정보처리기사', '빅데이터분석기사')}
              className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap"
            >
              1:1 비교 워크벤치 열기
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Grouped Bar Chart */}
        <div className="xl:col-span-7 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-900">최근 공식 시험 합격률 비교 (%)</span>
            <div className="flex items-center gap-4 text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-blue-700 inline-block rounded-xs" /> 필기 · 1차
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-600 inline-block rounded-xs" /> 실기 · 2차
              </span>
            </div>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 12, left: -16, bottom: 28 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#334155' }}
                  interval={0}
                  angle={-22}
                  textAnchor="end"
                  height={56}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  unit="%"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                  }}
                  formatter={(value, name) => [
                    `${value}%`,
                    name === 'written' ? '필기 / 1차 합격률' : '실기 / 2차 합격률',
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  height={28}
                  formatter={(value) => (value === 'written' ? '필기 / 1차' : '실기 / 2차')}
                />
                <Bar
                  dataKey="written"
                  fill="#1D4ED8"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={26}
                  className="cursor-pointer"
                  onClick={(_bar, idx) => {
                    const target = chartData[idx];
                    if (target) {
                      onSelectCertByName(target.certName);
                    }
                  }}
                />
                <Bar
                  dataKey="practical"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={26}
                  className="cursor-pointer"
                  onClick={(_bar, idx) => {
                    const target = chartData[idx];
                    if (target) {
                      onSelectCertByName(target.certName);
                    }
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabular Comparison Matrix */}
        <div className="xl:col-span-5 overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3.5 font-semibold">자격증 (공식 기준)</th>
                <th className="py-2.5 px-3 font-semibold text-right">필기·1차</th>
                <th className="py-2.5 px-3 font-semibold text-right">실기·2차</th>
                <th className="py-2.5 px-3.5 font-semibold text-right">조회</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBenchmarks.map((item) => (
                <tr key={item.certName} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3.5">
                    <div className="font-bold text-slate-900">{item.shortName}</div>
                    <div className="text-[11px] text-slate-500">
                      {item.latestPeriodLabel} · {item.organizer.split(' ')[0]}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono-num text-right font-semibold text-blue-700 whitespace-nowrap">
                    {item.latestWrittenRateNum !== null ? `${item.latestWrittenRateNum}%` : '-'}
                  </td>
                  <td className="py-2.5 px-3 font-mono-num text-right font-semibold text-emerald-700 whitespace-nowrap">
                    {item.latestPracticalRateNum !== null ? `${item.latestPracticalRateNum}%` : '단일시험'}
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectCertByName(item.certName)}
                      className="text-blue-700 hover:underline font-medium whitespace-nowrap"
                    >
                      리포트 보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
