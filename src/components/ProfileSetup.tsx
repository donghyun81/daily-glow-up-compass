
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { saveUserProfile } from '@/utils/storage';
import { User, Target } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: () => void;
}

const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    goals: [] as string[],
  });

  const goalOptions = [
    { id: 'exercise', label: '운동', emoji: '💪' },
    { id: 'reading', label: '독서', emoji: '📚' },
    { id: 'writing', label: '글쓰기', emoji: '✍️' },
    { id: 'diet', label: '다이어트', emoji: '🥗' },
    { id: 'study', label: '공부', emoji: '📖' },
    { id: 'meditation', label: '명상', emoji: '🧘' },
  ];

  const handleGoalToggle = (goalId: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleComplete = () => {
    if (profile.goals.length === 0) return;
    
    saveUserProfile(profile);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/95">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full w-16 h-16 flex items-center justify-center">
            {step === 1 ? <User className="text-white" size={32} /> : <Target className="text-white" size={32} />}
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {step === 1 ? '프로필 설정' : '목표 선택'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 ? (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">이름 (선택)</Label>
                  <Input
                    id="name"
                    placeholder="닉네임을 입력하세요"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="text-sm font-medium text-gray-700">연령대 (선택)</Label>
                  <select
                    id="age"
                    value={profile.age}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="10s">10대</option>
                    <option value="20s">20대</option>
                    <option value="30s">30대</option>
                    <option value="40s">40대</option>
                    <option value="50s+">50대 이상</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">성별 (선택)</Label>
                  <div className="mt-2 flex gap-4">
                    {['남성', '여성', '기타'].map((option) => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={option}
                          checked={profile.gender === option}
                          onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium py-3"
              >
                다음 단계
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-4 block">
                  어떤 목표를 달성하고 싶으신가요? (복수 선택 가능)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {goalOptions.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => handleGoalToggle(goal.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        profile.goals.includes(goal.id)
                          ? 'border-blue-500 bg-blue-50 scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{goal.emoji}</div>
                        <div className="text-sm font-medium text-gray-700">{goal.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  이전
                </Button>
                <Button 
                  onClick={handleComplete}
                  disabled={profile.goals.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium"
                >
                  시작하기
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
