import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  ExternalLink,
  GitCompare,
  Loader2,
  Search,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CERT_CATALOG } from '../data/certCatalog';
import type { CertCatalogItem, CertResearchResult, LearnerLevel } from '../types/cert';
import { parsePercentNumber } from './CertDataCharts';

interface CertComparisonViewProps {
  initialCertA?: string;
  initialCertB?: string;
  learnerLevel: LearnerLevel;
  preferKeyless: boolean;
  onOpenSingleReport: (certName: string) => void;
}

const POPULAR_COMPARE_PAIRS: Array<{ label: string; a: string; b: string }> = [
  { label: 'SQLD vs ADsP', a: 'SQLD (SQL 개발자)', b: 'ADsP (데이터분석 준전문가)' },
  { label: '정보처리기사 vs 빅데이터분석기사', a: '정보처리기사', b: '빅데이터분석기사' },
  { label: '전기기사 vs 산업안전기사', a: '전기기사', b: '산업안전기사' },
  { label: '컴활 1급 vs 전산세무 2급', a: '컴퓨터활용능력 1급', b: '전산세무 2급' },
  { label: '정보처리기사 vs 정보보안기사', a: '정보처리기사', b: '정보보안기사' },
];

function findCatalogByName(name: string): CertCatalogItem | undefined {
  return CERT_CATALOG.find((c) => c.name === name);
}

export const CertComparisonView: React.FC<CertComparisonViewProps> = ({
  initialCertA = 'SQLD (SQL 개발자)',
  initialCertB = 'ADsP (데이터분석 준전문가)',
  learnerLevel,
  preferKeyless,
  onOpenSingleReport,
}) => {
  const [certAName, setCertAName] = useState(initialCertA);
  const [certBName, setCertBName] = useState(initialCertB);
  const [filterA, setFilterA] = useState('');
  const [filterB, setFilterB] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [comparedData, setComparedData] = useState<{
    a: CertResearchResult;
    b: CertResearchResult;
  } | null>(null);

  const optionsA = useMemo(() => {
    const q = filterA.trim().toLowerCase();
    if (!q) return CERT_CATALOG;
    return CERT_CATALOG.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }, [filterA]);

  const optionsB = useMemo(() => {
    const q = filterB.trim().toLowerCase();
    if (!q) return CERT_CATALOG;
    return CERT_CATALOG.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }, [filterB]);

  const runComparison = async (nameA = certAName, nameB = certBName) => {
    const cleanA = nameA.trim();
    const cleanB = nameB.trim();
    if (!cleanA || !cleanB) {
      setErrorMsg('비교할 두 자격증을 모두 선택해 주세요.');
      return;
    }
    if (cleanA === cleanB) {
      setErrorMsg('서로 다른 두 자격증을 선택해야 비교할 수 있습니다.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const fetchOne = async (certName: string): Promise<CertResearchResult> => {
      const cat = findCatalogByName(certName);
      const resp = await fetch('/api/cert-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certName,
          organizer: cat?.organizer || '',
          officialUrl: cat?.officialUrl || '',
          selectedAreas: ['concepts', 'lectures', 'workbooks', 'stats'],
          learnerLevel,
          includeOverview: true,
          useKeyless: preferKeyless,
        }),
      });
      const raw = await resp.text();
      const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      if (!resp.ok || !('certName' in parsed)) {
        throw new Error(
          typeof parsed.error === 'string' && parsed.error
            ? parsed.error
            : `'${certName}' 자료를 불러오지 못했습니다.`
        );
      }
      return parsed as unknown as CertResearchResult;
    };

    try {
      const [resA, resB] = await Promise.all([fetchOne(cleanA), fetchOne(cleanB)]);
      setComparedData({ a: resA, b: resB });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '자격증 비교 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (a: string, b: string) => {
    setCertAName(a);
    setCertBName(b);
    runComparison(a, b);
  };

  const handleSwap = () => {
    const prevA = certAName;
    const prevB = certBName;
    setCertAName(prevB);
    setCertBName(prevA);
    if (comparedData) {
      setComparedData({ a: comparedData.b, b: comparedData.a });
    }
  };

  const comparisonChartData = useMemo(() => {
    if (!comparedData) return [];
    const latestA = comparedData.a.stats?.passRates?.[comparedData.a.stats.passRates.length - 1];
    const latestB = comparedData.b.stats?.passRates?.[comparedData.b.stats.passRates.length - 1];

    const aWritten = latestA ? parsePercentNumber(latestA.writtenRate) : null;
    const aPractical = latestA ? parsePercentNumber(latestA.practicalRate) : null;
    const bWritten = latestB ? parsePercentNumber(latestB.writtenRate) : null;
    const bPractical = latestB ? parsePercentNumber(latestB.practicalRate) : null;

    if (aWritten === null && aPractical === null && bWritten === null && bPractical === null) {
      return [];
    }

    const shortA = comparedData.a.certName.replace(/\s*\(.*?\)/g, '');
    const shortB = comparedData.b.certName.replace(/\s*\(.*?\)/g, '');

    return [
      {
        stage: '필기 · 1차 (최근)',
        [shortA]: aWritten ?? 0,
        [shortB]: bWritten ?? 0,
      },
      ...(aPractical !== null || bPractical !== null
        ? [
            {
              stage: '실기 · 2차 (최근)',
              [shortA]: aPractical ?? 0,
              [shortB]: bPractical ?? 0,
            },
          ]
        : []),
    ];
  }, [comparedData]);

  const shortAName = comparedData?.a.certName.replace(/\s*\(.*?\)/g, '') || '';
  const shortBName = comparedData?.b.certName.replace(/\s*\(.*?\)/g, '') || '';

  return (
    <section
      id="compare-section"
      className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 no-print"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
            <GitCompare className="w-3.5 h-3.5" />
            <span>1:1 COMPARE WORKBENCH</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">자격증 2개 나란히 심층 비교</h2>
          <p className="text-sm text-slate-600">
            고민되는 두 자격증의 응시자격·합격률·과목 비중·대표 교재·강사 라인업과 취업 혜택을 한눈에 비교합니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {POPULAR_COMPARE_PAIRS.map((pair) => (
            <button
              key={pair.label}
              type="button"
              onClick={() => handleSelectPreset(pair.a, pair.b)}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {pair.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Picker Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-end">
        <div className="lg:col-span-5 space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-blue-700">비교 대상 A</span>
            <span className="text-slate-500">112종+ 선택 가능</span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterA}
              onChange={(e) => setFilterA(e.target.value)}
              placeholder="A 목록 빠른 필터 (예: SQLD, 전기)"
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <select
            value={certAName}
            onChange={(e) => setCertAName(e.target.value)}
            aria-label="비교 대상 A 자격증 선택"
            className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {optionsA.map((c) => (
              <option key={c.id} value={c.name}>
                [{c.category}] {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-1 flex items-center justify-center">
          <button
            type="button"
            onClick={handleSwap}
            title="A와 B 맞바꾸기"
            aria-label="두 자격증 위치 맞바꾸기"
            className="p-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        <div className="lg:col-span-5 space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-700">비교 대상 B</span>
            <span className="text-slate-500">112종+ 선택 가능</span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterB}
              onChange={(e) => setFilterB(e.target.value)}
              placeholder="B 목록 빠른 필터 (예: ADsP, 산안기)"
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <select
            value={certBName}
            onChange={(e) => setCertBName(e.target.value)}
            aria-label="비교 대상 B 자격증 선택"
            className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {optionsB.map((c) => (
              <option key={c.id} value={c.name}>
                [{c.category}] {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          현재 조회 방식: <strong className="text-slate-800">{preferKeyless ? 'API 키 없이 공식·위키 즉시 비교' : '자동 (AI+공식 교차검증)'}</strong>
        </span>
        <button
          type="button"
          onClick={() => runComparison()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>두 자격증 나란히 분석 중...</span>
            </>
          ) : (
            <>
              <GitCompare className="w-4 h-4" />
              <span>선택한 2종 1:1 비교 실행</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Comparison Results */}
      {comparedData && (
        <div className="space-y-6 pt-2">
          {/* Pass Rate Comparison Bar Chart */}
          {comparisonChartData.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    최근 공식 합격률 1:1 비교 도표 ({shortAName} vs {shortBName})
                  </h3>
                  <p className="text-xs text-slate-500">
                    단일 시험 자격증은 실기/2차 막대가 0%(없음)으로 표시됩니다
                  </p>
                </div>
              </div>
              <div className="w-full h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonChartData}
                    margin={{ top: 10, right: 20, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#334155' }} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        borderColor: '#E2E8F0',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`${value}%`]}
                    />
                    <Legend />
                    <Bar dataKey={shortAName} fill="#1D4ED8" radius={[4, 4, 0, 0]} maxBarSize={42} />
                    <Bar dataKey={shortBName} fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Side-by-Side Comparison Matrix Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold text-slate-600 w-36">비교 항목</th>
                  <th className="py-3.5 px-4 font-bold text-blue-800 w-[42%]">
                    <div className="flex items-center justify-between gap-2">
                      <span>A. {comparedData.a.certName}</span>
                      <button
                        type="button"
                        onClick={() => onOpenSingleReport(comparedData.a.certName)}
                        className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap shrink-0"
                      >
                        전체 리포트 →
                      </button>
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-emerald-800 w-[42%]">
                    <div className="flex items-center justify-between gap-2">
                      <span>B. {comparedData.b.certName}</span>
                      <button
                        type="button"
                        onClick={() => onOpenSingleReport(comparedData.b.certName)}
                        className="text-xs font-medium text-emerald-700 hover:underline whitespace-nowrap shrink-0"
                      >
                        전체 리포트 →
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white align-top">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/40">구분 · 주관기관</td>
                  <td className="py-3 px-4 text-slate-800">
                    {comparedData.a.overview.certType} · {comparedData.a.overview.officialOrganizer}
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    {comparedData.b.overview.certType} · {comparedData.b.overview.officialOrganizer}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/40">응시 자격 요건</td>
                  <td className="py-3 px-4 text-slate-700 leading-relaxed">
                    {comparedData.a.overview.eligibility}
                  </td>
                  <td className="py-3 px-4 text-slate-700 leading-relaxed">
                    {comparedData.b.overview.eligibility}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/40">시험 일정 · 응시료</td>
                  <td className="py-3 px-4 text-slate-700 space-y-1">
                    <div>{comparedData.a.overview.examSchedule2026}</div>
                    <div className="font-mono-num text-xs text-slate-500">
                      {comparedData.a.overview.feeInfo}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 space-y-1">
                    <div>{comparedData.b.overview.examSchedule2026}</div>
                    <div className="font-mono-num text-xs text-slate-500">
                      {comparedData.b.overview.feeInfo}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/40">최근 공식 합격률</td>
                  <td className="py-3 px-4 font-mono-num text-slate-800 space-y-1">
                    {(comparedData.a.stats?.passRates ?? []).slice(-2).map((p, i) => (
                      <div key={i} className="text-xs">
                        <strong>{p.year}:</strong> 필기 {p.writtenRate} / 실기 {p.practicalRate}
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-4 font-mono-num text-slate-800 space-y-1">
                    {(comparedData.b.stats?.passRates ?? []).slice(-2).map((p, i) => (
                      <div key={i} className="text-xs">
                        <strong>{p.year}:</strong> 필기 {p.writtenRate} / 실기 {p.practicalRate}
                      </div>
                    ))}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/40">과목 구성</td>
                  <td className="py-3 px-4 text-slate-700">
                    <ul className="space-y-1 text-xs">
                      {(comparedData.a.concepts?.subjects ?? []).map((s, i) => (
                        <li key={i}>
                          • <strong>{s.name}</strong> ({s.weight})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <ul className="space-y-1 text-xs">
                      {(comparedData.b.concepts?.subjects ?? []).map((s, i) => (
                        <li key={i}>
                          • <strong>{s.name}</strong> ({s.weight})
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/40">대표 강사 · 교재</td>
                  <td className="py-3 px-4 text-slate-700 text-xs space-y-1.5">
                    {(comparedData.a.lectures?.instructors ?? []).slice(0, 2).map((inst, i) => (
                      <div key={i}>
                        <strong>{inst.name}</strong> ({inst.platform}) — {inst.textbookUsed}
                      </div>
                    ))}
                    {(comparedData.a.workbooks?.books ?? []).slice(0, 2).map((b, i) => (
                      <div key={`wb-a-${i}`} className="text-slate-600">
                        교재: {b.title} [{b.conceptVsProblemRatio}]
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-4 text-slate-700 text-xs space-y-1.5">
                    {(comparedData.b.lectures?.instructors ?? []).slice(0, 2).map((inst, i) => (
                      <div key={i}>
                        <strong>{inst.name}</strong> ({inst.platform}) — {inst.textbookUsed}
                      </div>
                    ))}
                    {(comparedData.b.workbooks?.books ?? []).slice(0, 2).map((b, i) => (
                      <div key={`wb-b-${i}`} className="text-slate-600">
                        교재: {b.title} [{b.conceptVsProblemRatio}]
                      </div>
                    ))}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/40">취득 혜택 · 우대</td>
                  <td className="py-3 px-4 text-slate-700 text-xs space-y-1">
                    {(comparedData.a.stats?.salaryAndBenefits ?? []).map((ben, i) => (
                      <div key={i}>• {ben}</div>
                    ))}
                    {comparedData.a.overview.officialPortalUrl && (
                      <a
                        href={comparedData.a.overview.officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-700 hover:underline pt-1"
                      >
                        <span>공식 사이트 바로가기</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-700 text-xs space-y-1">
                    {(comparedData.b.stats?.salaryAndBenefits ?? []).map((ben, i) => (
                      <div key={i}>• {ben}</div>
                    ))}
                    {comparedData.b.overview.officialPortalUrl && (
                      <a
                        href={comparedData.b.overview.officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:underline pt-1"
                      >
                        <span>공식 사이트 바로가기</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
