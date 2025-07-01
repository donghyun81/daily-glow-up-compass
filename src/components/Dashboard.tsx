
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUserProfile, getTodayRecord, getRecentRecords } from '@/utils/storage';
import { generateFeedback } from '@/utils/feedback';
import { Calendar, TrendingUp, Star, Clock } from 'lucide-react';

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [yesterdayScore, setYesterdayScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    const loadData = () => {
      const userProfile = getUserProfile();
      const today = new Date().toISOString().split('T')[0];
      const todayData = getTodayRecord(today);
      const recentRecords = getRecentRecords(7);

      setProfile(userProfile);
      setTodayRecord(todayData);

      // 어제 점수 계산
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayData = getTodayRecord(yesterday.toISOString().split('T')[0]);
      
      if (yesterdayData) {
        const avgScore = Object.values(yesterdayData.achievements).reduce((sum: number, score: any) => sum + score, 0) / Object.keys(yesterdayData.achievements).length;
        setYesterdayScore(Math.round(avgScore));
        setFeedback(generateFeedback(yesterdayData, userProfile));
      }

      // 연속 기록일 계산
      let streak = 0;
      const sortedDates = Object.keys(recentRecords).sort().reverse();
      for (const date of sortedDates) {
        if (recentRecords[date]) {
          streak++;
        } else {
          break;
        }
      }
      setStreakDays(streak);
    };

    loadData();
  }, []);

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

  if (!profile) return null;

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          안녕하세요, {profile.name || '익명'}님! 👋
        </h1>
        <p className="text-gray-600 mt-2">오늘도 목표를 향해 한 걸음 더 나아가요</p>
      </div>

      {/* 어제 점수 및 피드백 카드 */}
      {yesterdayScore !== null && (
        <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="text-yellow-300" size={24} />
              어제의 성과
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4 text-center">
              {yesterdayScore}점
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm leading-relaxed">{feedback}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 오늘 상태 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="text-blue-500" size={20} />
              오늘의 진행상황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.goals.map((goalId: string) => {
                const achievement = todayRecord?.achievements?.[goalId] || 0;
                return (
                  <div key={goalId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getGoalEmoji(goalId)}</span>
                      <span className="font-medium">{getGoalLabel(goalId)}</span>
                    </div>
                    <Badge variant={achievement > 70 ? "default" : achievement > 30 ? "secondary" : "outline"}>
                      {achievement}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="text-green-500" size={20} />
              루틴 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{streakDays}</div>
                <div className="text-sm text-gray-600">연속 기록일</div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>꾸준한 기록이 성공의 열쇠입니다!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 오늘 기록하기 버튼 */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">오늘의 기록을 작성해보세요</h3>
            <p className="text-gray-600 mb-4">작은 변화가 큰 성과를 만듭니다</p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8 py-3"
              onClick={() => window.location.href = '/record'}
            >
              기록하러 가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
