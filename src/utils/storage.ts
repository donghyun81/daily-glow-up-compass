
// 로컬 저장소 관리 유틸리티

const STORAGE_KEYS = {
  USER_PROFILE: 'userProfile',
  DAILY_RECORDS: 'dailyRecords'
};

export interface UserProfile {
  name: string;
  age: string;
  gender: string;
  goals: string[];
  createdAt: string;
}

export interface DailyRecord {
  date: string;
  notes: Record<string, string>;
  photos: Record<string, string[]>;
  overallReflection: string;
  createdAt: string;
  updatedAt: string;
}

// 한국 시간 기준 오늘 날짜 반환
const getKoreanDate = () => {
  const now = new Date();
  const koreanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return koreanTime.toISOString().split('T')[0];
};

// 사용자 프로필 저장
export const saveUserProfile = (profile: Partial<UserProfile>) => {
  const fullProfile: UserProfile = {
    ...profile,
    createdAt: new Date().toISOString()
  } as UserProfile;
  
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(fullProfile));
};

// 사용자 프로필 가져오기
export const getUserProfile = (): UserProfile | null => {
  const profile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  return profile ? JSON.parse(profile) : null;
};

// 일일 기록 저장
export const saveTodayRecord = (date: string, record: Partial<DailyRecord>) => {
  const records = getAllRecords();
  const fullRecord: DailyRecord = {
    ...record,
    date,
    createdAt: records[date]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as DailyRecord;
  
  records[date] = fullRecord;
  localStorage.setItem(STORAGE_KEYS.DAILY_RECORDS, JSON.stringify(records));
};

// 특정 날짜 기록 가져오기
export const getTodayRecord = (date: string): DailyRecord | null => {
  const records = getAllRecords();
  return records[date] || null;
};

// 모든 기록 가져오기
export const getAllRecords = (): Record<string, DailyRecord> => {
  const records = localStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
  return records ? JSON.parse(records) : {};
};

// 최근 N일 기록 가져오기 (한국 시간 기준)
export const getRecentRecords = (days: number): Record<string, DailyRecord> => {
  const allRecords = getAllRecords();
  const recentDates: Record<string, DailyRecord> = {};
  
  // 한국 시간 기준으로 계산
  const now = new Date();
  const koreanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  
  for (let i = 0; i < days; i++) {
    const date = new Date(koreanTime);
    date.setDate(koreanTime.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (allRecords[dateStr]) {
      recentDates[dateStr] = allRecords[dateStr];
    }
  }
  
  return recentDates;
};

// 연속 기록일 계산 (한국 시간 기준)
export const getStreakDays = (): number => {
  const records = getAllRecords();
  const sortedDates = Object.keys(records).sort().reverse();
  
  let streak = 0;
  const now = new Date();
  const koreanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  
  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(koreanTime);
    date.setDate(koreanTime.getDate() - i);
    const expectedDate = date.toISOString().split('T')[0];
    
    if (records[expectedDate]) {
      const record = records[expectedDate];
      // 실제로 기록이 있는지 확인
      if (record.notes && Object.values(record.notes).some(note => note && (note as string).trim() !== '')) {
        streak++;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  
  return streak;
};

// 데이터 초기화 (개발/테스트용)
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  localStorage.removeItem(STORAGE_KEYS.DAILY_RECORDS);
};
