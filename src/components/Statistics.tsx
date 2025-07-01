
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUserProfile, getAllRecords } from '@/utils/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';

const Statistics = () => {
  const [profile, setProfile] = useState<any>(null);
  const [records, setRecords] = useState<Record<string, any>>({});
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [goalStats, setGoalStats] = useState<any[]>([]);
  const [insights, setInsights] = useState<string>('');

  useEffect(() => {
    const userProfile = getUserProfile();
    const allRecords = getAllRecords();
    
    setProfile(userProfile);
    setRecords(allRecords);

    if (userProfile && Object.keys(allRecords).length > 0) {
      generateWeeklyData(allRecords, userProfile);
      generateGoalStats(allRecords, userProfile);
      generateInsights(allRecords, userProfile);
    }
  }, []);

  const generateWeeklyData = (records: Record<string, any>, profile: any) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRecord = records[dateStr];
      let avgScore = 0;
      
      if (dayRecord && dayRecord.achievements) {
        const scores = Object.values(dayRecord.achievements) as number[];
        avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }
      
      last7Days.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        score: Math.round(avgScore),
        fullDate: dateStr
      });
    }
    
    setWeeklyData(last7Days);
  };

  const generateGoalStats = (records: Record<string, any>, profile: any) => {
    const goalAverages = profile.goals.map((goalId: string) => {
      const goalScores: number[] = [];
      
      Object.values(records).forEach((record: any) => {
        if (record.achievements && record.achievements[goalId] !== undefined) {
          goalScores.push(record.achievements[goalId]);
        }
      });
      
      const average = goalScores.length > 0 
        ? goalScores.reduce((sum, score) => sum + score, 0) / goalScores.length 
        : 0;
      
      return {
        goal: getGoalLabel(goalId),
        average: Math.round(average),
        emoji: getGoalEmoji(goalId),
        id: goalId
      };
    });
    
    setGoalStats(goalAverages);
  };

  const generateInsights = (records: Record<string, any>, profile: any) => {
    const recordCount = Object.keys(records).length;
    const bestGoal = goalStats.reduce((best, current) => 
      current.average > (best?.average || 0) ? current : best, null);
    const worstGoal = goalStats.reduce((worst, current) => 
      current.average < (worst?.average || 100) ? current : worst, null);

    let insight = `지난 ${recordCount}일간의 기록을 분석했습니다. `;
    
    if (bestGoal) {
      insight += `${bestGoal.emoji} ${bestGoal.goal} 분야에서 가장 좋은 성과(평균 ${bestGoal.average}%)를 보이고 있습니다! `;
    }
    
    if (worstGoal && bestGoal && worstGoal.id !== bestGoal.id) {
      insight += `${worstGoal.emoji} ${worstGoal.goal} 분야는 조금 더 관심을 가져보세요. `;
    }
    
    insight += "꾸준한 기록이 성장의 첫걸음입니다. 계속 화이팅하세요! 💪";
    
    setInsights(insight);
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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

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
        <p className="text-gray-600">데이터로 보는 나의 변화와 성장</p>
      </div>

      {/* AI 인사이트 */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="text-yellow-300" size={24} />
            AI 분석 리포트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <p className="leading-relaxed">{insights}</p>
          </div>
        </CardContent>
      </Card>

      {/* 주간 트렌드 차트 */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={20} />
            최근 7일 평균 점수 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => [`${value}점`, '평균 점수']}
                  labelStyle={{ color: '#374151' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 목표별 성과 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 목표별 평균 달성률 (막대 차트) */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-green-500" size={20} />
              목표별 평균 달성률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="goal" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, '평균 달성률']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar 
                    dataKey="average" 
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 목표별 달성률 (파이 차트) */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-purple-500" size={20} />
              목표별 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={goalStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ goal, average }) => `${goal} ${average}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="average"
                  >
                    {goalStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, '평균 달성률']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 상세 목표별 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goalStats.map((goal, index) => (
          <Card key={goal.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{goal.emoji}</div>
              <h3 className="font-semibold text-lg mb-2">{goal.goal}</h3>
              <div className="text-3xl font-bold mb-2" style={{ color: COLORS[index % COLORS.length] }}>
                {goal.average}%
              </div>
              <Badge 
                variant={goal.average >= 80 ? "default" : goal.average >= 60 ? "secondary" : "outline"}
                className="text-xs"
              >
                {goal.average >= 80 ? "우수" : goal.average >= 60 ? "양호" : "개선 필요"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
