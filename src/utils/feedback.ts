
// AI 피드백 생성 로직

export interface FeedbackContext {
  achievements: Record<string, number>;
  notes: Record<string, string>;
  overallReflection: string;
  date: string;
}

export interface UserProfile {
  name: string;
  goals: string[];
}

// 목표별 피드백 템플릿
const GOAL_FEEDBACK_TEMPLATES = {
  exercise: {
    excellent: (score: number) => `운동을 정말 열심히 하셨네요! ${score}%의 성과는 대단합니다. 💪`,
    good: (score: number) => `꾸준한 운동 습관이 보기 좋아요. ${score}%도 좋은 성과입니다!`,
    needs_improvement: (score: number) => `운동이 조금 아쉬웠지만, 내일은 더 활동적으로 보내보세요.`
  },
  reading: {
    excellent: (score: number) => `독서를 많이 하셨네요! 지식이 차곡차곡 쌓이고 있어요. 📚`,
    good: (score: number) => `꾸준한 독서 습관이 인상적이에요. 계속 이어가세요!`,
    needs_improvement: (score: number) => `오늘은 독서가 부족했지만, 짧은 시간이라도 책을 펼쳐보세요.`
  },
  writing: {
    excellent: (score: number) => `글쓰기를 열심히 하셨네요! 생각을 글로 표현하는 능력이 늘고 있어요. ✍️`,
    good: (score: number) => `꾸준한 글쓰기가 좋은 습관이 되고 있어요.`,
    needs_improvement: (score: number) => `오늘은 글쓰기가 아쉬웠네요. 간단한 일기라도 써보세요.`
  },
  diet: {
    excellent: (score: number) => `식단 관리를 완벽하게 하셨네요! 건강한 선택들이 빛나고 있어요. 🥗`,
    good: (score: number) => `건강한 식습관을 잘 유지하고 계시네요.`,
    needs_improvement: (score: number) => `식단이 조금 아쉬웠지만, 작은 변화부터 시작해보세요.`
  },
  study: {
    excellent: (score: number) => `공부를 정말 열심히 하셨네요! 성장하는 모습이 보입니다. 📖`,
    good: (score: number) => `꾸준한 학습 태도가 인상적이에요.`,
    needs_improvement: (score: number) => `오늘은 공부가 부족했지만, 조금씩이라도 계속해보세요.`
  },
  meditation: {
    excellent: (score: number) => `마음 챙김을 잘 실천하셨네요! 내면의 평화를 찾아가고 있어요. 🧘`,
    good: (score: number) => `명상과 휴식을 잘 챙기고 계시네요.`,
    needs_improvement: (score: number) => `바쁜 하루였지만, 잠시라도 마음을 돌아보는 시간을 가져보세요.`
  }
};

// 전체적인 격려 메시지
const ENCOURAGEMENT_MESSAGES = [
  "매일 기록하는 것 자체가 대단한 일이에요!",
  "작은 변화가 모여 큰 성장을 만듭니다.",
  "완벽하지 않아도 괜찮아요. 꾸준함이 더 중요해요.",
  "오늘 하루도 자신을 위해 노력한 당신이 멋져요!",
  "성장하는 모습이 정말 인상적이에요.",
  "하루하루 발전하는 모습이 보기 좋습니다!"
];

// 개선 제안 메시지
const IMPROVEMENT_SUGGESTIONS = {
  exercise: [
    "내일은 10분만 더 걸어보는 건 어떨까요?",
    "계단을 이용해보거나 스트레칭부터 시작해보세요.",
    "좋아하는 음악과 함께 가벼운 운동을 해보세요."
  ],
  reading: [
    "잠들기 전 10분 독서 시간을 만들어보세요.",
    "관심 있는 주제의 짧은 글부터 시작해보세요.",
    "통근 시간을 활용해 전자책을 읽어보세요."
  ],
  writing: [
    "오늘 있었던 일 한 줄이라도 써보세요.",
    "감사했던 일 세 가지를 적어보는 건 어떨까요?",
    "떠오르는 생각을 자유롭게 적어보세요."
  ],
  diet: [
    "물을 조금 더 마시는 것부터 시작해보세요.",
    "간식 대신 과일을 선택해보는 것은 어떨까요?",
    "식사 시간을 규칙적으로 가져보세요."
  ],
  study: [
    "15분이라도 새로운 것을 배워보세요.",
    "관심 있는 온라인 강의를 찾아보는 건 어떨까요?",
    "오늘 배운 것을 누군가에게 설명해보세요."
  ],
  meditation: [
    "5분간 깊게 숨쉬는 시간을 가져보세요.",
    "자연 소리를 들으며 잠시 휴식을 취해보세요.",
    "감사한 일들을 떠올리며 마음을 정리해보세요."
  ]
};

// 피드백 생성 메인 함수
export const generateFeedback = (record: FeedbackContext, profile: UserProfile): string => {
  if (!record.achievements || Object.keys(record.achievements).length === 0) {
    return "오늘 하루도 수고하셨어요! 내일은 목표를 향한 작은 발걸음을 내딛어보세요. 😊";
  }

  const achievements = record.achievements;
  const goalScores = Object.entries(achievements);
  const averageScore = goalScores.reduce((sum, [_, score]) => sum + score, 0) / goalScores.length;

  let feedback = "";

  // 1. 전체적인 평가
  if (averageScore >= 80) {
    feedback += "오늘 정말 대단한 하루를 보내셨네요! ✨ ";
  } else if (averageScore >= 60) {
    feedback += "오늘도 꾸준히 노력하신 모습이 보기 좋아요! 👍 ";
  } else {
    feedback += "오늘 하루도 기록해주셔서 고마워요. ";
  }

  // 2. 가장 잘한 목표 칭찬
  const bestGoal = goalScores.reduce((best, current) => 
    current[1] > best[1] ? current : best
  );

  if (bestGoal[1] >= 70) {
    const goalId = bestGoal[0];
    const score = bestGoal[1];
    const template = GOAL_FEEDBACK_TEMPLATES[goalId as keyof typeof GOAL_FEEDBACK_TEMPLATES];
    
    if (template) {
      if (score >= 85) {
        feedback += template.excellent(score) + " ";
      } else {
        feedback += template.good(score) + " ";
      }
    }
  }

  // 3. 개선이 필요한 영역 제안
  const needsImprovement = goalScores.filter(([_, score]) => score < 50);
  
  if (needsImprovement.length > 0 && averageScore >= 50) {
    const worstGoal = needsImprovement[0][0];
    const suggestions = IMPROVEMENT_SUGGESTIONS[worstGoal as keyof typeof IMPROVEMENT_SUGGESTIONS];
    
    if (suggestions && suggestions.length > 0) {
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      feedback += randomSuggestion + " ";
    }
  }

  // 4. 격려 메시지
  const randomEncouragement = ENCOURAGEMENT_MESSAGES[
    Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)
  ];
  feedback += randomEncouragement;

  return feedback.trim();
};

// 간단한 점수 기반 피드백 (백업용)
export const getSimpleFeedback = (averageScore: number): string => {
  if (averageScore >= 90) {
    return "완벽한 하루였어요! 이런 날들이 모여 큰 변화를 만들어갑니다. 🌟";
  } else if (averageScore >= 75) {
    return "정말 잘하고 계세요! 꾸준함이 성공의 열쇠입니다. 💪";
  } else if (averageScore >= 60) {
    return "좋은 흐름이에요! 조금씩 더 나아가고 있습니다. 👍";
  } else if (averageScore >= 40) {
    return "오늘은 조금 아쉬웠지만, 기록한 것만으로도 의미가 있어요. 내일 화이팅! 😊";
  } else {
    return "완벽하지 않아도 괜찮아요. 작은 시작이 큰 변화의 첫걸음입니다. 🌱";
  }
};
