import type { YearlyPassRate } from '../types/cert.js';

export interface VerifiedBenchmarkMeta {
  certName: string;
  shortName: string;
  category: string;
  organizer: string;
  sourceLabel: string;
  latestWrittenRateNum: number | null;
  latestPracticalRateNum: number | null;
  latestPeriodLabel: string;
  difficultyNote: string;
  passRates: YearlyPassRate[];
}

// 100% verified official Korean certification pass-rate datasets
// Sources: 한국산업인력공단(Q-Net), 한국데이터산업진흥원(K-Data/PQI), 한국방송통신전파진흥원(KCA),
// 대한상공회의소(Korcham), 한국세무사회(KACTA), 국사편찬위원회
export const VERIFIED_CERT_BENCHMARKS: VerifiedBenchmarkMeta[] = [
  {
    certName: '정보처리기사',
    shortName: '정보처리기사',
    category: 'IT · 데이터',
    organizer: '한국산업인력공단 (Q-Net)',
    sourceLabel: 'Q-Net 국가기술자격 공식 통계',
    latestWrittenRateNum: 65.0,
    latestPracticalRateNum: 22.1,
    latestPeriodLabel: '2025년 기준',
    difficultyNote: '필기 CBT는 60% 내외로 안정적이나, 실기 필답형(코드 추적·SQL)이 20%대로 당락을 좌우합니다.',
    passRates: [
      {
        year: '2022년',
        writtenRate: '56.1%',
        practicalRate: '20.8%',
        applicantsNote: '필기 48,470명 응시(27,208명 합격) / 실기 53,307명 응시(11,111명 합격)',
      },
      {
        year: '2023년',
        writtenRate: '59.0%',
        practicalRate: '21.0%',
        applicantsNote: '필기 60,024명 응시(35,428명 합격) / 실기 58,088명 응시(12,205명 합격)',
      },
      {
        year: '2024년',
        writtenRate: '60.8%',
        practicalRate: '28.9%',
        applicantsNote: '필기 66,169명 응시(40,207명 합격) / 실기 68,745명 응시(19,881명 합격)',
      },
      {
        year: '2025년',
        writtenRate: '65.0%',
        practicalRate: '22.1%',
        applicantsNote: 'Q-Net 공식 연간 집계 기준',
      },
    ],
  },
  {
    certName: '전기기사',
    shortName: '전기기사',
    category: '전기 · 설비',
    organizer: '한국산업인력공단 (Q-Net)',
    sourceLabel: 'Q-Net 국가기술자격 공식 통계',
    latestWrittenRateNum: 26.1,
    latestPracticalRateNum: 37.4,
    latestPeriodLabel: '2024년 기준',
    difficultyNote: '필기(전자기학·회로 등 5과목) 합격률이 22~26%로 진입 장벽이 높고, 실기도 37% 내외입니다.',
    passRates: [
      {
        year: '2022년',
        writtenRate: '22.2%',
        practicalRate: '39.5%',
        applicantsNote: '필기 52,187명 응시(11,611명 합격) / 실기 32,640명 응시(12,901명 합격)',
      },
      {
        year: '2023년',
        writtenRate: '22.2%',
        practicalRate: '37.1%',
        applicantsNote: '필기 51,630명 응시(11,477명 합격) / 실기 23,643명 응시(8,774명 합격)',
      },
      {
        year: '2024년',
        writtenRate: '26.1%',
        practicalRate: '37.4%',
        applicantsNote: '필기 57,417명 응시(15,005명 합격) / 실기 27,063명 응시(10,115명 합격)',
      },
    ],
  },
  {
    certName: '산업안전기사',
    shortName: '산업안전기사',
    category: '안전 · 보건',
    organizer: '한국산업인력공단 (Q-Net)',
    sourceLabel: 'Q-Net 국가기술자격 공식 통계',
    latestWrittenRateNum: 42.7,
    latestPracticalRateNum: 58.9,
    latestPeriodLabel: '2024년 기준',
    difficultyNote: '중대재해처벌법 이후 응시자가 연 8만 명대로 급증했으며, 실기(복합형) 합격률이 비교적 높습니다.',
    passRates: [
      {
        year: '2022년',
        writtenRate: '47.8%',
        practicalRate: '48.3%',
        applicantsNote: '필기 54,500명 응시(26,032명 합격) / 실기 32,473명 응시(15,681명 합격)',
      },
      {
        year: '2023년',
        writtenRate: '51.1%',
        practicalRate: '54.3%',
        applicantsNote: '필기 80,253명 응시(41,014명 합격) / 실기 52,776명 응시(28,636명 합격)',
      },
      {
        year: '2024년',
        writtenRate: '42.7%',
        practicalRate: '58.9%',
        applicantsNote: '필기 86,032명 응시(36,717명 합격) / 실기 52,956명 응시(31,191명 합격)',
      },
    ],
  },
  {
    certName: '컴퓨터활용능력 1급',
    shortName: '컴활 1급',
    category: '사무 · IT',
    organizer: '대한상공회의소',
    sourceLabel: '대한상공회의소 · 국가기술자격 통계',
    latestWrittenRateNum: 26.9,
    latestPracticalRateNum: 8.8,
    latestPeriodLabel: '2025년 기준',
    difficultyNote: '2024년 MS Office 2021 개편 이후 실기 합격률이 6.9~8.8%까지 하락해 철저한 실기 훈련이 필수입니다.',
    passRates: [
      {
        year: '2022년',
        writtenRate: '32.7%',
        practicalRate: '16.5%',
        applicantsNote: '개편 이전 연도 기준',
      },
      {
        year: '2023년',
        writtenRate: '26.4%',
        practicalRate: '15.5%',
        applicantsNote: '개편 직전 연도 기준',
      },
      {
        year: '2024년',
        writtenRate: '23.0%',
        practicalRate: '6.9%',
        applicantsNote: 'MS Office 2021 개편 적용 · 필기 39,396명 / 실기 11,713명 합격',
      },
      {
        year: '2025년',
        writtenRate: '26.9%',
        practicalRate: '8.8%',
        applicantsNote: '필기 151,464명 응시(40,760명 합격) / 실기 161,799명 응시(14,270명 합격)',
      },
    ],
  },
  {
    certName: 'SQLD (SQL 개발자)',
    shortName: 'SQLD',
    category: 'IT · 데이터',
    organizer: '한국데이터산업진흥원 (K-Data)',
    sourceLabel: 'K-Data · 국가공인 민간자격 PQI 공시',
    latestWrittenRateNum: 41.5,
    latestPracticalRateNum: null,
    latestPeriodLabel: '최근 공시 기준',
    difficultyNote: '필기 단일 평가(50문항)로 평균 40~50%대 합격률을 보이나, 1과목 과락(10문항 중 40% 미만) 주의가 필요합니다.',
    passRates: [
      {
        year: '2023년',
        writtenRate: '약 47~48%',
        practicalRate: '실기 없음 (필기 단일)',
        applicantsNote: '회차별 47~48%대 유지',
      },
      {
        year: '2024~2025년',
        writtenRate: '약 41%대',
        practicalRate: '실기 없음 (필기 단일)',
        applicantsNote: '2024년 출제기준 개정(객관식 50문항) 적용 후 약 41%대 기록',
      },
    ],
  },
  {
    certName: 'ADsP (데이터분석 준전문가)',
    shortName: 'ADsP',
    category: 'IT · 데이터',
    organizer: '한국데이터산업진흥원 (K-Data)',
    sourceLabel: 'K-Data · PQI 공식 연도별 집계',
    latestWrittenRateNum: 67.95,
    latestPracticalRateNum: null,
    latestPeriodLabel: '2024년 기준',
    difficultyNote: '2024년 객관식 전면 전환 이후 합격률이 64% → 67.95%로 상승해 데이터 입문 자격으로 가장 접근성이 좋습니다.',
    passRates: [
      {
        year: '2023년',
        writtenRate: '64.14%',
        practicalRate: '실기 없음 (필기 단일)',
        applicantsNote: '접수 65,790명 / 응시 44,202명 / 취득 28,350명',
      },
      {
        year: '2024년',
        writtenRate: '67.95%',
        practicalRate: '실기 없음 (필기 단일)',
        applicantsNote: '접수 72,502명 / 응시 57,849명 / 취득 39,306명 (단답형 폐지)',
      },
    ],
  },
  {
    certName: '빅데이터분석기사',
    shortName: '빅데이터분석기사',
    category: 'IT · 데이터',
    organizer: '한국데이터산업진흥원 (K-Data)',
    sourceLabel: 'K-Data 공식 검정 통계',
    latestWrittenRateNum: 63.33,
    latestPracticalRateNum: 52.93,
    latestPeriodLabel: '2023년 공식 집계',
    difficultyNote: '실기에 Python/R 데이터 전처리 및 머신러닝 작업형 코딩이 포함되어 실기 체감 난이도가 중요합니다.',
    passRates: [
      {
        year: '2023년',
        writtenRate: '63.33%',
        practicalRate: '52.93%',
        applicantsNote: '필기 12,686명 응시(8,034명 합격) / 실기 7,888명 응시(4,175명 합격)',
      },
    ],
  },
  {
    certName: '정보보안기사',
    shortName: '정보보안기사',
    category: 'IT · 데이터',
    organizer: '한국방송통신전파진흥원 (KCA)',
    sourceLabel: 'KCA 국가기술자격 공식 통계',
    latestWrittenRateNum: 37.6,
    latestPracticalRateNum: 22.0,
    latestPeriodLabel: '2024년 기준',
    difficultyNote: '실기 합격률이 9.8%~22%대로 국내 IT 기사 자격증 중 최상위 난이도를 보입니다.',
    passRates: [
      {
        year: '2023년',
        writtenRate: '37.8%',
        practicalRate: '9.8%',
        applicantsNote: '필기 7,008명 응시(2,650명 합격) / 실기 극악 난이도 회차 포함',
      },
      {
        year: '2024년',
        writtenRate: '37.6%',
        practicalRate: '22.0%',
        applicantsNote: '필기 6,456명 응시(2,429명 합격) / 실기 단답형 보기 추가 등 개편',
      },
    ],
  },
  {
    certName: '전산세무 2급',
    shortName: '전산세무 2급',
    category: '경영 · 회계 · 세무',
    organizer: '한국세무사회',
    sourceLabel: '한국세무사회 자격시험 공식 통계',
    latestWrittenRateNum: 35.02,
    latestPracticalRateNum: null,
    latestPeriodLabel: '2024년 기준',
    difficultyNote: '이론(30%)+실무 케이랩(70%) 합산 70점 이상 합격 구조로, 연 5만 명 안팎이 응시해 약 35%가 합격합니다.',
    passRates: [
      {
        year: '2023년',
        writtenRate: '34.66%',
        practicalRate: '이론+실무 통합',
        applicantsNote: '응시 48,701명 / 합격 16,881명 (합산 70점 이상 합격)',
      },
      {
        year: '2024년',
        writtenRate: '35.02%',
        practicalRate: '이론+실무 통합',
        applicantsNote: '응시 50,885명 / 합격 17,819명 (합산 70점 이상 합격)',
      },
    ],
  },
  {
    certName: '지게차운전기능사',
    shortName: '지게차운전기능사',
    category: '기계 · 기능',
    organizer: '한국산업인력공단 (Q-Net)',
    sourceLabel: 'Q-Net 국가기술자격 공식 통계',
    latestWrittenRateNum: 74.6,
    latestPracticalRateNum: 46.8,
    latestPeriodLabel: '2024년 기준',
    difficultyNote: '연 11만 명 이상 응시하는 국민 기능사 자격으로 필기는 74%대이나 실기(4분 코스 운전)는 46%대입니다.',
    passRates: [
      {
        year: '2023년',
        writtenRate: '73.6%',
        practicalRate: '47.3%',
        applicantsNote: '필기 110,279명 응시(81,156명 합격) / 실기 123,766명 응시(58,551명 합격)',
      },
      {
        year: '2024년',
        writtenRate: '74.6%',
        practicalRate: '46.8%',
        applicantsNote: '필기 112,929명 응시(84,201명 합격) / 실기 128,023명 응시(59,924명 합격)',
      },
    ],
  },
  {
    certName: '공인중개사',
    shortName: '공인중개사',
    category: '금융 · 부동산',
    organizer: '한국산업인력공단 (Q-Net)',
    sourceLabel: 'Q-Net 공인중개사 공식 통계',
    latestWrittenRateNum: 15.1,
    latestPracticalRateNum: 30.9,
    latestPeriodLabel: '제35회 (2024년)',
    difficultyNote: '1차(학개론·민법)와 2차(중개사법·공법·공시세법) 모두 60점 이상이어야 최종 합격하며 최근 1차 체감 난이도가 상승했습니다.',
    passRates: [
      {
        year: '제34회 (2023년)',
        writtenRate: '20.4%',
        practicalRate: '23.1%',
        applicantsNote: '1차 134,354명 응시(27,458명 합격) / 2차 65,705명 응시(15,157명 합격)',
      },
      {
        year: '제35회 (2024년)',
        writtenRate: '15.1%',
        practicalRate: '30.9%',
        applicantsNote: '1차 98,483명 응시(14,850명 합격) / 2차 49,521명 응시(15,301명 합격)',
      },
    ],
  },
  {
    certName: '한국사능력검정시험 (심화)',
    shortName: '한능검 (심화)',
    category: '어학 · 한국사',
    organizer: '국사편찬위원회',
    sourceLabel: '국사편찬위원회 공식 인증 통계',
    latestWrittenRateNum: 55.22,
    latestPracticalRateNum: null,
    latestPeriodLabel: '제72회 기준',
    difficultyNote: '심화 응시자 기준(1~3급 합산 인증률) 회차별 약 46~59% 분포를 보이며 공무원·공기업 필수 활용 자격입니다.',
    passRates: [
      {
        year: '제69회 (2024.02)',
        writtenRate: '55.14%',
        practicalRate: '실기 없음 (단일)',
        applicantsNote: '응시 75,825명 / 인증 41,808명 (1·2·3급 합산)',
      },
      {
        year: '제70회 (2024.05)',
        writtenRate: '46.76%',
        practicalRate: '실기 없음 (단일)',
        applicantsNote: '응시 57,108명 / 인증 26,705명',
      },
      {
        year: '제71회 (2024.08)',
        writtenRate: '47.65%',
        practicalRate: '실기 없음 (단일)',
        applicantsNote: '응시 81,779명 / 인증 38,970명',
      },
      {
        year: '제72회 (2024.10)',
        writtenRate: '55.22%',
        practicalRate: '실기 없음 (단일)',
        applicantsNote: '응시 65,786명 / 인증 36,327명',
      },
    ],
  },
];

export function findVerifiedBenchmark(certName: string): VerifiedBenchmarkMeta | undefined {
  const norm = (s: string) => s.replace(/\s*\(.*?\)/g, '').replace(/\s+/g, '').toLowerCase();
  const target = norm(certName);
  return VERIFIED_CERT_BENCHMARKS.find(
    (b) => b.certName === certName || norm(b.certName) === target || norm(b.shortName) === target
  );
}
