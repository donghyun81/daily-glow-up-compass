
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUserProfile, getTodayRecord, getRecentRecords, getKoreanDate, getStreakDays } from '@/utils/storage';
import { Calendar, TrendingUp, Star, Clock, Camera, Target } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [yesterdayScore, setYesterdayScore] = useState<number | null>(null);
  const [yesterdayFeedback, setYesterdayFeedback] = useState<string>('');
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [overallFeedback, setOverallFeedback] = useState<string>('');
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    const loadData = () => {
      const userProfile = getUserProfile();
      
      // 정확한 한국 시간 기준 날짜 계산
      const today = getKoreanDate();
      console.log('Dashboard today (Korean time):', today);
      
      const todayData = getTodayRecord(today);
      const recentRecords = getRecentRecords(7);

      setProfile(userProfile);
      setTodayRecord(todayData);

      // 어제 점수 및 피드백 계산 (정확한 한국 시간 기준)
      const koreanTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
      const yesterday = new Date(koreanTime);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = getKoreanDate(yesterday);
      
      const yesterdayData = getTodayRecord(yesterdayDate);
      
      if (yesterdayData && yesterdayData.notes) {
        const goalCount = Object.keys(yesterdayData.notes).length;
        const recordedGoals = Object.values(yesterdayData.notes).filter(note => note && note.trim() !== '').length;
        const score = goalCount > 0 ? Math.round((recordedGoals / goalCount) * 100) : 0;
        
        setYesterdayScore(score);
        setYesterdayFeedback(generateSimpleFeedback(yesterdayData, userProfile, score));
      }

      // 전체 평균 점수 및 피드백 계산
      const allRecords = Object.values(recentRecords);
      if (allRecords.length > 0) {
        let totalScore = 0;
        let validDays = 0;
        
        allRecords.forEach((record: any) => {
          if (record.notes) {
            const goalCount = Object.keys(record.notes).length;
            const recordedGoals = Object.values(record.notes).filter(note => note && (note as string).trim() !== '').length;
            if (goalCount > 0) {
              totalScore += (recordedGoals / goalCount) * 100;
              validDays++;
            }
          }
        });
        
        if (validDays > 0) {
          const avgScore = Math.round(totalScore / validDays);
          setOverallScore(avgScore);
          setOverallFeedback(getOverallFeedback(avgScore, validDays));
        }
      }

      // 연속 기록일 설정
      setStreakDays(getStreakDays());
    };

    loadData();
  }, []);

  const generateSimpleFeedback = (record: any, profile: any, score: number) => {
    if (score >= 80) {
      return `어제 정말 잘하셨네요! ${score}점으로 목표들을 거의 완벽하게 달성하셨어요. 이런 하루가 큰 변화를 만들어냅니다! 🌟`;
    } else if (score >= 60) {
      return `어제 ${score}점으로 꽤 좋은 하루를 보내셨어요! 몇 가지 목표를 더 챙기면 더욱 완벽한 하루가 될 것 같아요. 💪`;
    } else {
      return `어제는 ${score}점이었네요. 완벽하지 않아도 괜찮아요! 오늘은 작은 목표부터 하나씩 실천해보세요. 🌱`;
    }
  };

  const getOverallFeedback = (score: number, days: number) => {
    if (score >= 80) {
      return `지난 ${days}일간 정말 꾸준히 잘 해오셨네요! 평균 ${score}점으로 훌륭한 성과를 보이고 있습니다. 이런 습관이 큰 변화를 만들어낼 거예요! 🌟`;
    } else if (score >= 60) {
      return `지난 ${days}일 동안 ${score}점으로 꾸준한 노력을 보이고 계세요. 조금 더 일관성을 유지하면 더 좋은 결과를 얻을 수 있을 것 같아요! 💪`;
    } else {
      return `지난 ${days}일간의 기록을 보니 ${score}점이네요. 완벽하지 않아도 괜찮아요. 작은 변화부터 시작해서 조금씩 늘려가보세요! 🌱`;
    }
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
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          안녕하세요, {profile?.name || '익명'}님! 👋
        </h1>
        <p className="text-gray-600 mt-2">오늘도 목표를 향해 한 걸음 더 나아가요</p>
      </div>

      {/* 오늘의 목표 */}
      {profile?.goals && Array.isArray(profile.goals) && profile.goals.length > 0 && (
        <Card className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-yellow-300" size={24} />
              오늘의 목표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {profile.goals.map((goal: string, index: number) => {
                const hasRecord = todayRecord?.notes?.[goal] && todayRecord.notes[goal].trim() !== '';
                return (
                  <div key={index} className="flex items-center justify-between bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                    <span className="text-sm font-medium">{goal}</span>
                    {hasRecord ? (
                      <Badge variant="secondary" className="bg-green-500 text-white">
                        완료 ✓
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-white/50 text-white">
                        진행중
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => navigate('/record')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/50"
              >
                목표 기록하기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 어제 평가 및 피드백 */}
      {yesterdayScore !== null && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="text-yellow-300" size={24} />
              어제의 평가 및 피드백
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-2">{yesterdayScore}점</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm leading-relaxed">{yesterdayFeedback}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 종합 평가 및 피드백 */}
      {overallScore !== null && (
        <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-yellow-300" size={24} />
              종합 평가 및 피드백
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-2">{overallScore}점</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm leading-relaxed">{overallFeedback}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 연속 기록일 */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="text-green-500" size={20} />
            루틴 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{streakDays}</div>
            <div className="text-sm text-gray-600">연속 기록일</div>
          </div>
        </CardContent>
      </Card>

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
              onClick={() => navigate('/record')}
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
