
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { getUserProfile, getAllRecords } from '@/utils/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar as CalendarIcon, Camera, TrendingUp } from 'lucide-react';

const Statistics = () => {
  const [profile, setProfile] = useState<any>(null);
  const [records, setRecords] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [weeklyPhotos, setWeeklyPhotos] = useState<string[]>([]);

  useEffect(() => {
    const userProfile = getUserProfile();
    const allRecords = getAllRecords();
    
    setProfile(userProfile);
    setRecords(allRecords);
    
    if (userProfile && Object.keys(allRecords).length > 0) {
      generateWeeklyData(allRecords, selectedDate);
    }
  }, [selectedDate]);

  const generateWeeklyData = (records: Record<string, any>, centerDate: Date) => {
    // 선택된 날짜를 중심으로 한 주간 데이터 생성
    const weekStart = new Date(centerDate);
    weekStart.setDate(centerDate.getDate() - centerDate.getDay()); // 일요일부터 시작
    
    const weekData = [];
    const photos: string[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRecord = records[dateStr];
      let recordCount = 0;
      
      if (dayRecord && dayRecord.notes) {
        recordCount = Object.values(dayRecord.notes).filter(note => 
          note && (note as string).trim() !== ''
        ).length;
        
        // 대표 사진 수집 (각 날짜의 첫 번째 사진)
        if (dayRecord.photos) {
          Object.values(dayRecord.photos).forEach((goalPhotos: any) => {
            if (Array.isArray(goalPhotos) && goalPhotos.length > 0) {
              photos.push(goalPhotos[0]);
            }
          });
        }
      }
      
      weekData.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        records: recordCount,
        fullDate: dateStr
      });
    }
    
    setWeeklyData(weekData);
    setWeeklyPhotos(photos.slice(0, 6)); // 최대 6장만 표시
  };

  const getGoalEmoji = (goalId: string) => {
    const emojiMap: Record<string, string> = {
      exercise: '💪',
      reading: '📚',
      writing: '✍️',
      diet: '🥗',
      study: '📖',
      meditation: '🧘'
    };
    return emojiMap[goalId] || '🎯';
  };

  const hasRecordOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const record = records[dateStr];
    return record && record.notes && Object.values(record.notes).some(note => 
      note && (note as string).trim() !== ''
    );
  };

  if (!profile || Object.keys(records).length === 0) {
    return (
      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">아직 데이터가 없어요</h2>
          <p className="text-gray-500">기록을 쌓아가면 멋진 통계를 볼 수 있어요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
          나의 성장 통계 📈
        </h1>
        <p className="text-gray-600">달력에서 날짜를 선택하여 주간 통계를 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 달력 */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="text-blue-500" size={20} />
              기록 달력
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                hasRecord: (date) => hasRecordOnDate(date)
              }}
              modifiersStyles={{
                hasRecord: {
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-2">
              파란색 날짜는 기록이 있는 날입니다
            </p>
          </CardContent>
        </Card>

        {/* 주간 대표 사진 */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="text-green-500" size={20} />
              이 주의 대표 사진들
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {weeklyPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`주간 사진 ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">이번 주에 업로드된 사진이 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 주간 기록 통계 차트 */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-purple-500" size={20} />
            선택된 주간의 기록 현황
            <span className="text-sm font-normal text-gray-500">
              ({selectedDate.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} 기준 주간)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}개`, '기록된 목표 수']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar 
                  dataKey="records" 
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 목표별 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profile.goals?.map((goalId: string, index: number) => {
          // 선택된 주간의 해당 목표 기록 수 계산
          const weekRecordCount = weeklyData.reduce((count, day) => {
            const dayRecord = records[day.fullDate];
            if (dayRecord && dayRecord.notes && dayRecord.notes[goalId] && dayRecord.notes[goalId].trim() !== '') {
              return count + 1;
            }
            return count;
          }, 0);

          const percentage = Math.round((weekRecordCount / 7) * 100);

          return (
            <Card key={goalId} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{getGoalEmoji(goalId)}</div>
                <h3 className="font-semibold text-lg mb-2">{
                  goalId === 'exercise' ? '운동' :
                  goalId === 'reading' ? '독서' :
                  goalId === 'writing' ? '글쓰기' :
                  goalId === 'diet' ? '다이어트' :
                  goalId === 'study' ? '공부' :
                  goalId === 'meditation' ? '명상' : goalId
                }</h3>
                <div className="text-2xl font-bold mb-2 text-purple-600">
                  {weekRecordCount}/7일
                </div>
                <div className="text-sm text-gray-500">
                  주간 달성률: {percentage}%
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Statistics;
