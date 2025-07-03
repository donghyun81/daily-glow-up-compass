import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, saveTodayRecord, getTodayRecord, getKoreanDate, saveUserProfile } from '@/utils/storage';
import { ArrowLeft, Save, Camera, X, Plus, Edit2, Trash2 } from 'lucide-react';

const TodayRecord = () => {
  const navigate = useNavigate();
  const { date: paramDate } = useParams();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [records, setRecords] = useState<Record<string, any>>({});
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [newGoalId, setNewGoalId] = useState('');
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);

    // URL 파라미터에서 날짜를 가져오거나 오늘 날짜 사용
    const targetDate = paramDate || getKoreanDate();
    setCurrentDate(targetDate);
    
    console.log('Target date for record:', targetDate);
    
    const existingRecord = getTodayRecord(targetDate);
    
    if (existingRecord) {
      setRecords(existingRecord);
      setPhotos(existingRecord.photos || {});
    } else {
      const initialRecords: Record<string, any> = {
        date: targetDate,
        notes: {},
        photos: {},
        overallReflection: ''
      };
      
      userProfile?.goals?.forEach((goalId: string) => {
        initialRecords.notes[goalId] = '';
      });
      
      setRecords(initialRecords);
    }
  }, [paramDate]);

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

  const handlePhotoUpload = (goalId: string, files: FileList) => {
    const newPhotos: string[] = [];
    const currentPhotos = photos[goalId] || [];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const photoUrl = e.target.result as string;
            setPhotos(prev => ({
              ...prev,
              [goalId]: [...(prev[goalId] || []), photoUrl]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removePhoto = (goalId: string, photoIndex: number) => {
    setPhotos(prev => ({
      ...prev,
      [goalId]: prev[goalId]?.filter((_, index) => index !== photoIndex) || []
    }));
  };

  const handleAddGoal = () => {
    if (!newGoalId || !newGoalLabel) {
      toast({
        title: "입력 오류",
        description: "목표 ID와 이름을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (profile?.goals?.includes(newGoalId)) {
      toast({
        title: "중복 오류",
        description: "이미 존재하는 목표입니다.",
        variant: "destructive",
      });
      return;
    }

    const updatedProfile = {
      ...profile,
      goals: [...(profile?.goals || []), newGoalId]
    };

    setProfile(updatedProfile);
    saveUserProfile(updatedProfile);

    // 새 목표에 대한 기록 초기화
    setRecords(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [newGoalId]: ''
      }
    }));

    setNewGoalId('');
    setNewGoalLabel('');

    toast({
      title: "목표 추가 완료",
      description: `${newGoalLabel} 목표가 추가되었습니다.`,
    });
  };

  const handleRemoveGoal = (goalId: string) => {
    const updatedProfile = {
      ...profile,
      goals: profile?.goals?.filter((id: string) => id !== goalId) || []
    };

    setProfile(updatedProfile);
    saveUserProfile(updatedProfile);

    // 기록에서도 해당 목표 제거
    const updatedRecords = { ...records };
    if (updatedRecords.notes) {
      delete updatedRecords.notes[goalId];
    }
    setRecords(updatedRecords);

    // 사진에서도 해당 목표 제거
    const updatedPhotos = { ...photos };
    delete updatedPhotos[goalId];
    setPhotos(updatedPhotos);

    toast({
      title: "목표 삭제 완료",
      description: `${getGoalLabel(goalId)} 목표가 삭제되었습니다.`,
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const recordToSave = {
        ...records,
        photos: photos
      };
      
      saveTodayRecord(currentDate, recordToSave);
      toast({
        title: "기록 저장 완료!",
        description: "기록이 성공적으로 저장되었습니다.",
      });
      setTimeout(() => navigate('/statistics'), 1000);
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
      meditation: '🧘',
      work: '💼',
      hobby: '🎨',
      health: '⚕️',
      social: '👥'
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
      meditation: '명상',
      work: '업무',
      hobby: '취미',
      health: '건강관리',
      social: '인간관계'
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
      meditation: '오늘 명상이나 휴식 시간을 가지셨나요? 마음이 어떠셨나요?',
      work: '오늘 업무는 어떠셨나요? 성취한 것이 있다면 알려주세요.',
      hobby: '오늘 취미 활동은 어떠셨나요? 즐거웠던 순간을 공유해주세요.',
      health: '오늘 건강관리는 어떻게 하셨나요?',
      social: '오늘 사람들과의 만남은 어떠셨나요?'
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

  // 선택된 날짜 표시용
  const displayDate = currentDate ? new Date(currentDate + 'T00:00:00').toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  const isToday = currentDate === getKoreanDate();

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-4 py-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/statistics')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          통계로 돌아가기
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {isToday ? '오늘의 기록' : '기록 수정'}
          </h1>
          <p className="text-sm text-gray-600">{displayDate}</p>
          {!isToday && (
            <p className="text-xs text-blue-600">과거 날짜의 기록을 작성/수정하고 있습니다.</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditingGoals(!isEditingGoals)}
          className="flex items-center gap-2"
        >
          <Edit2 size={16} />
          목표 관리
        </Button>
      </div>

      {/* 목표 관리 섹션 */}
      {isEditingGoals && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="text-blue-600" size={20} />
              목표 관리
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 새 목표 추가 */}
            <div className="space-y-3">
              <h3 className="font-medium">새 목표 추가</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select value={newGoalId} onValueChange={setNewGoalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="목표 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exercise">💪 운동</SelectItem>
                    <SelectItem value="reading">📚 독서</SelectItem>
                    <SelectItem value="writing">✍️ 글쓰기</SelectItem>
                    <SelectItem value="diet">🥗 다이어트</SelectItem>
                    <SelectItem value="study">📖 공부</SelectItem>
                    <SelectItem value="meditation">🧘 명상</SelectItem>
                    <SelectItem value="work">💼 업무</SelectItem>
                    <SelectItem value="hobby">🎨 취미</SelectItem>
                    <SelectItem value="health">⚕️ 건강관리</SelectItem>
                    <SelectItem value="social">👥 인간관계</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="목표 이름 입력"
                  value={newGoalLabel}
                  onChange={(e) => setNewGoalLabel(e.target.value)}
                />
                <Button onClick={handleAddGoal} className="w-full">
                  <Plus size={16} className="mr-2" />
                  추가
                </Button>
              </div>
            </div>

            {/* 현재 목표 목록 */}
            <div className="space-y-2">
              <h3 className="font-medium">현재 목표</h3>
              <div className="space-y-2">
                {profile?.goals?.map((goalId: string) => (
                  <div key={goalId} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getGoalEmoji(goalId)}</span>
                      <span className="font-medium">{getGoalLabel(goalId)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveGoal(goalId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">설정된 목표가 없습니다.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

              {/* 사진 업로드 */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  사진 업로드 (여러 장 가능)
                </label>
                
                {/* 업로드된 사진들 */}
                {photos[goalId] && photos[goalId].length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    {photos[goalId].map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`${getGoalLabel(goalId)} 사진 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(goalId, index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 사진 업로드 버튼 */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Camera size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-3">사진을 추가해보세요</p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && handlePhotoUpload(goalId, e.target.files)}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span>사진 선택</span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )) || (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 mb-4">설정된 목표가 없습니다.</p>
              <Button
                onClick={() => setIsEditingGoals(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus size={16} className="mr-2" />
                목표 추가하기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 전체 회고 */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">💭</span>
              <span>{isToday ? '오늘 하루 전체 회고' : '하루 전체 회고'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="하루를 돌아보며 느낀 점, 계획 등을 자유롭게 적어보세요..."
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
