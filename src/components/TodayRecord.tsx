import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, saveTodayRecord, getTodayRecord } from '@/utils/storage';
import { ArrowLeft, Save, Camera } from 'lucide-react';

const TodayRecord = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [records, setRecords] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);

    console.log('TodayRecord profile:', userProfile);

    // 오늘 기록이 있다면 불러오기
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = getTodayRecord(today);
    
    console.log('Existing record:', existingRecord);
    
    if (existingRecord) {
      setRecords(existingRecord);
    } else {
      // 초기 기록 구조 생성
      const initialRecords: Record<string, any> = {
        date: today,
        achievements: {},
        notes: {},
        overallReflection: ''
      };
      
      userProfile?.goals?.forEach((goalId: string) => {
        initialRecords.achievements[goalId] = 50;
        initialRecords.notes[goalId] = '';
      });
      
      setRecords(initialRecords);
    }
  }, []);

  const handleAchievementChange = (goalId: string, value: number[]) => {
    setRecords(prev => ({
      ...prev,
      achievements: {
        ...prev.achievements,
        [goalId]: value[0]
      }
    }));
  };

  const handleNoteChange = (goalId: string, value: string) => {
    setRecords(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [goalId]: value
      }
    }));
  };

  const handleReflectionChange = (value: string) => {
    setRecords(prev => ({
      ...prev,
      overallReflection: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      saveTodayRecord(records.date, records);
      toast({
        title: "기록 저장 완료!",
        description: "오늘의 기록이 성공적으로 저장되었습니다.",
      });
      // 저장 후 대시보드로 이동
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "저장 실패",
        description: "기록 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  const getGoalQuestion = (goalId: string) => {
    const questionMap: Record<string, string> = {
      exercise: '오늘 어떤 운동을 하셨나요? 어떤 기분이었는지 알려주세요.',
      reading: '오늘 무엇을 읽으셨나요? 어떤 내용이 인상 깊었나요?',
      writing: '오늘 어떤 글을 쓰셨나요? 어떤 주제에 대해 생각해보셨나요?',
      diet: '오늘 식단은 어떠셨나요? 건강한 선택을 하셨나요?',
      study: '오늘 무엇을 공부하셨나요? 새로 배운 것이 있다면 알려주세요.',
      meditation: '오늘 명상이나 휴식 시간을 가지셨나요? 마음이 어떠셨나요?'
    };
    return questionMap[goalId] || `오늘 ${getGoalLabel(goalId)} 목표는 어떠셨나요?`;
  };

  if (!profile) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">프로필을 불러오는 중...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-4 py-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          돌아가기
        </Button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          오늘의 기록
        </h1>
      </div>

      {/* 목표별 기록 카드들 */}
      <div className="space-y-6">
        {profile.goals?.map((goalId: string) => (
          <Card key={goalId} className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{getGoalEmoji(goalId)}</span>
                <span>{getGoalLabel(goalId)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 달성률 슬라이더 */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">달성률</label>
                  <span className="text-lg font-bold text-blue-600">
                    {records.achievements?.[goalId] || 50}%
                  </span>
                </div>
                <Slider
                  value={[records.achievements?.[goalId] || 50]}
                  onValueChange={(value) => handleAchievementChange(goalId, value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 기록 텍스트 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {getGoalQuestion(goalId)}
                </label>
                <Textarea
                  placeholder="오늘의 경험을 자세히 적어보세요..."
                  value={records.notes?.[goalId] || ''}
                  onChange={(e) => handleNoteChange(goalId, e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* 사진 업로드 (향후 구현) */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
                <Camera size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm">사진 업로드 (준비 중)</p>
              </div>
            </CardContent>
          </Card>
        )) || (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">설정된 목표가 없습니다.</p>
            </CardContent>
          </Card>
        )}

        {/* 전체 회고 */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">💭</span>
              <span>오늘 하루 전체 회고</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="오늘 하루를 돌아보며 느낀 점, 내일의 계획 등을 자유롭게 적어보세요..."
              value={records.overallReflection || ''}
              onChange={(e) => handleReflectionChange(e.target.value)}
              className="min-h-[120px] resize-none bg-white"
            />
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="sticky bottom-4 z-10">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-4 shadow-lg"
          >
            <Save className="mr-2" size={20} />
            {isLoading ? '저장 중...' : '기록 저장하기'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TodayRecord;
