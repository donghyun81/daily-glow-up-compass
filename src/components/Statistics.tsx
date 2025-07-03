import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getUserProfile, getAllRecords, getKoreanDate } from '@/utils/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar as CalendarIcon, Camera, TrendingUp, X, Plus, Edit } from 'lucide-react';

const Statistics = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [records, setRecords] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [weeklyPhotos, setWeeklyPhotos] = useState<string[]>([]);
  const [monthlyPhotos, setMonthlyPhotos] = useState<string[]>([]);
  const [selectedDateRecord, setSelectedDateRecord] = useState<any>(null);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);

  useEffect(() => {
    const userProfile = getUserProfile();
    const allRecords = getAllRecords();
    
    setProfile(userProfile);
    setRecords(allRecords);
    
    if (userProfile && Object.keys(allRecords).length > 0) {
      generateWeeklyData(allRecords, selectedDate);
      generateMonthlyData(allRecords, selectedDate);
    }
  }, [selectedDate]);

  const generateWeeklyData = (records: Record<string, any>, centerDate: Date) => {
    // 한국 시간 기준으로 정확한 날짜 처리
    const koreanTime = new Date(centerDate.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    koreanTime.setHours(0, 0, 0, 0);
    
    // 선택된 날짜를 중심으로 한 주간 데이터 생성 (일요일부터 시작)
    const weekStart = new Date(koreanTime);
    weekStart.setDate(koreanTime.getDate() - koreanTime.getDay());
    
    const weekData = [];
    const photos: string[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = getKoreanDate(date);
      
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

  const generateMonthlyData = (records: Record<string, any>, centerDate: Date) => {
    const koreanTime = new Date(centerDate.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    const year = koreanTime.getFullYear();
    const month = koreanTime.getMonth();
    
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const daysInMonth = monthEnd.getDate();
    
    const monthData = [];
    const photos: string[] = [];
    
    // 주별로 그룹화하여 표시
    let weekNumber = 1;
    let weekStart = 1;
    
    while (weekStart <= daysInMonth) {
      let weekEnd = Math.min(weekStart + 6, daysInMonth);
      let weekRecordCount = 0;
      
      for (let day = weekStart; day <= weekEnd; day++) {
        const date = new Date(year, month, day);
        const dateStr = getKoreanDate(date);
        const dayRecord = records[dateStr];
        
        if (dayRecord && dayRecord.notes) {
          weekRecordCount += Object.values(dayRecord.notes).filter(note => 
            note && (note as string).trim() !== ''
          ).length;
          
          if (dayRecord.photos) {
            Object.values(dayRecord.photos).forEach((goalPhotos: any) => {
              if (Array.isArray(goalPhotos) && goalPhotos.length > 0) {
                photos.push(goalPhotos[0]);
              }
            });
          }
        }
      }
      
      monthData.push({
        date: `${weekNumber}주차`,
        records: weekRecordCount,
        period: `${month + 1}/${weekStart} - ${month + 1}/${weekEnd}`
      });
      
      weekStart = weekEnd + 1;
      weekNumber++;
    }
    
    setMonthlyData(monthData);
    setMonthlyPhotos(photos.slice(0, 12)); // 월간은 더 많은 사진 표시
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

  const getGoalLabel = (goalId: string) => {
    const labelMap: Record<string, string> = {
      exercise: '운동',
      reading: '독서',
      writing: '글쓰기',
      diet: '다이어트',
      study: '공부',
      meditation: '명상'
    };
    return labelMap[goalId] || goalId;
  };

  const hasRecordOnDate = (date: Date) => {
    const dateStr = getKoreanDate(date);
    const record = records[dateStr];
    return record && record.notes && Object.values(record.notes).some(note => 
      note && (note as string).trim() !== ''
    );
  };

  const handleDateClick = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const dateStr = getKoreanDate(date);
      const record = records[dateStr];
      if (record) {
        setSelectedDateRecord(record);
        setShowRecordDialog(true);
      }
    }
  };

  const handleAddRecordForDate = (date: Date) => {
    const dateStr = getKoreanDate(date);
    navigate(`/record/${dateStr}`);
  };

  const handlePhotoClick = (photo: string) => {
    setSelectedPhoto(photo);
    setShowPhotoDialog(true);
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
        <p className="text-gray-600">달력에서 파란색 날짜를 클릭하여 해당 날짜의 기록을 확인하거나, 빈 날짜를 클릭하여 새로운 기록을 추가하세요</p>
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
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  const dateStr = getKoreanDate(date);
                  const record = records[dateStr];
                  if (record) {
                    setSelectedDateRecord(record);
                    setShowRecordDialog(true);
                  } else {
                    // 기록이 없는 날짜 클릭 시 기록 추가 페이지로 이동
                    handleAddRecordForDate(date);
                  }
                }
              }}
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
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p>🔵 파란색 날짜: 기록이 있는 날 (클릭하면 기록 확인)</p>
              <p>⚪ 빈 날짜: 기록이 없는 날 (클릭하면 기록 추가)</p>
            </div>
          </CardContent>
        </Card>

        {/* 주간/월간 대표 사진 */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="text-green-500" size={20} />
              대표 사진들
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="weekly">이번 주</TabsTrigger>
                <TabsTrigger value="monthly">이번 달</TabsTrigger>
              </TabsList>
              
              <TabsContent value="weekly" className="mt-4">
                {weeklyPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {weeklyPhotos.map((photo, index) => (
                      <div key={index} className="relative cursor-pointer">
                        <img
                          src={photo}
                          alt={`주간 사진 ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          onClick={() => handlePhotoClick(photo)}
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
              </TabsContent>
              
              <TabsContent value="monthly" className="mt-4">
                {monthlyPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {monthlyPhotos.map((photo, index) => (
                      <div key={index} className="relative cursor-pointer">
                        <img
                          src={photo}
                          alt={`월간 사진 ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          onClick={() => handlePhotoClick(photo)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">이번 달에 업로드된 사진이 없습니다</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* 주간/월간 기록 통계 차트 */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-purple-500" size={20} />
            기록 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly">주간 통계</TabsTrigger>
              <TabsTrigger value="monthly">월간 통계</TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedDate.toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} 기준 주간
                </h3>
              </div>
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
            </TabsContent>
            
            <TabsContent value="monthly" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedDate.toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long'
                  })} 월간 통계
                </h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value}개`, '기록된 목표 수']}
                      labelFormatter={(label, payload) => {
                        const data = payload?.[0]?.payload;
                        return data ? `${label} (${data.period})` : label;
                      }}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Bar 
                      dataKey="records" 
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
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

          // 월간 기록 수 계산
          const koreanTime = new Date(selectedDate.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
          const year = koreanTime.getFullYear();
          const month = koreanTime.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          
          let monthRecordCount = 0;
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = getKoreanDate(date);
            const dayRecord = records[dateStr];
            if (dayRecord && dayRecord.notes && dayRecord.notes[goalId] && dayRecord.notes[goalId].trim() !== '') {
              monthRecordCount++;
            }
          }

          const weekPercentage = Math.round((weekRecordCount / 7) * 100);
          const monthPercentage = Math.round((monthRecordCount / daysInMonth) * 100);

          return (
            <Card key={goalId} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{getGoalEmoji(goalId)}</div>
                <h3 className="font-semibold text-lg mb-2">{getGoalLabel(goalId)}</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-xl font-bold text-purple-600">
                      {weekRecordCount}/7일
                    </div>
                    <div className="text-xs text-gray-500">
                      주간 달성률: {weekPercentage}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600">
                      {monthRecordCount}/{daysInMonth}일
                    </div>
                    <div className="text-xs text-gray-500">
                      월간 달성률: {monthPercentage}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 날짜별 기록 상세 다이얼로그 */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon size={20} />
              {selectedDateRecord && new Date(selectedDateRecord.date + 'T00:00:00').toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
              })} 기록
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              해당 날짜에 기록한 상세 내용을 확인할 수 있습니다.
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedDateRecord) {
                    const recordDate = new Date(selectedDateRecord.date + 'T00:00:00');
                    handleAddRecordForDate(recordDate);
                  }
                }}
                className="ml-auto"
              >
                <Edit size={16} className="mr-1" />
                수정하기
              </Button>
            </DialogDescription>
          </DialogHeader>
          {selectedDateRecord && (
            <div className="space-y-4">
              {profile.goals?.map((goalId: string) => {
                const note = selectedDateRecord.notes?.[goalId];
                const photos = selectedDateRecord.photos?.[goalId] || [];
                
                if (!note && photos.length === 0) return null;
                
                return (
                  <div key={goalId} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{getGoalEmoji(goalId)}</span>
                      <span className="font-semibold">{getGoalLabel(goalId)}</span>
                    </div>
                    
                    {note && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700">{note}</p>
                      </div>
                    )}
                    
                    {photos.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {photos.map((photo: string, index: number) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`${getGoalLabel(goalId)} 사진 ${index + 1}`}
                            className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                            onClick={() => handlePhotoClick(photo)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {selectedDateRecord.overallReflection && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">💭</span>
                    <span className="font-semibold">하루 회고</span>
                  </div>
                  <p className="text-sm text-gray-700">{selectedDateRecord.overallReflection}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 사진 확대 다이얼로그 */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative">
            <button
              onClick={() => setShowPhotoDialog(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
            >
              <X size={20} />
            </button>
            <img
              src={selectedPhoto}
              alt="확대된 사진"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Statistics;
