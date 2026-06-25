/**
 * 六层漏斗模型 - 每层的评分标准、解释文案、判断示例
 */

export type FunnelScore = 0 | 1 | 2; // 0=通过, 1=部分通过, 2=不通过

export interface FunnelLayerOption {
  score: FunnelScore;
  label: string;
  shortDesc: string;
  detailDesc: string;
  examples: string[];
}

export interface FunnelLayer {
  id: number;
  name: string;
  shortName: string;
  question: string;
  icon: string;
  options: FunnelLayerOption[];
}

export const FUNNEL_LAYERS: FunnelLayer[] = [
  {
    id: 1,
    name: '产物自证层',
    shortName: '产物自证',
    question: '你的任务产出物，对不对能不能一眼看出来？',
    icon: '🔍',
    options: [
      {
        score: 0,
        label: '可自证',
        shortDesc: '对不对一看就知道',
        detailDesc: '产出物有明确的对错标准，验证成本极低。人或自动化工具一眼/一键可知对错。',
        examples: ['代码编译通过+测试通过', '数据计算结果可交叉验证', '格式转换后可自动比对'],
      },
      {
        score: 1,
        label: '半自证',
        shortDesc: '需要人快速扫一眼确认',
        detailDesc: '产出物有大致标准，但需要人做快速判断。风格、口味、审美类判断属于此类。',
        examples: ['文案初稿需要人看语气是否合适', '设计稿需要人判断调性', '翻译需要人校对关键术语'],
      },
      {
        score: 2,
        label: '不可自证',
        shortDesc: '对不对本身就需要判断力',
        detailDesc: '产出物的正确性没有客观标准，"对不对"本身就是核心判断。',
        examples: ['战略方向选择', '创意方案的好坏', '投资建议该不该听'],
      },
    ],
  },
  {
    id: 2,
    name: '人工修正层',
    shortName: '人工修正',
    question: '如果AI做错了，能低成本修正吗？',
    icon: '🔧',
    options: [
      {
        score: 0,
        label: '可自愈',
        shortDesc: '出错后系统能自动恢复',
        detailDesc: '错误可以被系统自动检测和修复，如重试、降级、回滚。不需要人工介入。',
        examples: ['代码bug修复后重新部署', '配置错误回滚到上一版本', '数据异常触发自动重算'],
      },
      {
        score: 1,
        label: '可人工修正',
        shortDesc: '人介入后可修正，修正成本可控',
        detailDesc: '错误需要人介入修复，但修复成本远低于从零做起。改改就行。',
        examples: ['文案草稿人改改就行', '代码初版review后可修', '翻译初稿可校对修改'],
      },
      {
        score: 2,
        label: '不可逆',
        shortDesc: '出错无法挽回',
        detailDesc: '错误一旦发生，后果不可逆转。钱花了收不回来，人伤了救不回来，判决定了改不了。',
        examples: ['法律终审判决', '手术方案执行', '流量超曝光导致的资损', '并购定价决策'],
      },
    ],
  },
  {
    id: 3,
    name: '过程价值层',
    shortName: '过程价值',
    question: '做这件事的过程本身，有没有独立于结果的额外价值？',
    icon: '💡',
    options: [
      {
        score: 0,
        label: '纯产出型',
        shortDesc: '只看结果，过程没有独立价值',
        detailDesc: '过程只是达到目的的手段，谁做、怎么做不重要，重要的是结果。',
        examples: ['数据录入（只看录入对不对）', '格式排版（只看排版效果）', '信息搬运（只看搬没搬对）'],
      },
      {
        score: 1,
        label: '过程即思考',
        shortDesc: '做的过程就是思考/认知过程',
        detailDesc: '写的过程本身就是梳理逻辑、发现矛盾、对齐认知的过程。AI写出结果 ≠ 人想清楚了。',
        examples: ['写PRD（写的过程就是理清需求）', '战略规划（规划过程就是思考过程）', '研究选题（选题过程就是判断过程）'],
      },
      {
        score: 2,
        label: '过程即关系',
        shortDesc: '做的过程就是关系建立/维护过程',
        detailDesc: '过程的社交价值大于产出本身。你做的不是事情，是关系。',
        examples: ['客户关系维护', '团队激励', '跨部门谈判', '向上汇报对齐'],
      },
    ],
  },
  {
    id: 4,
    name: '信息可见度层',
    shortName: '信息可见度',
    question: '完成这个任务需要的信息，AI都能看到吗？',
    icon: '👁️',
    options: [
      {
        score: 0,
        label: '全显性',
        shortDesc: '所有信息都在文档/系统/数据中',
        detailDesc: '完成任务所需的全部信息都已文档化、结构化，或可通过系统/API获取。AI能完整看到。',
        examples: ['合同条款比对', '报表填写', '规则检查', '数据查询'],
      },
      {
        score: 1,
        label: '半隐性',
        shortDesc: '部分信息靠经验积累，老兵知道但没写下来',
        detailDesc: '核心信息有一部分在文档里，但关键细节靠经验。需要"问人"才能获取完整信息。',
        examples: ['异常排查（知道找谁问、怎么问）', '需求评审（知道哪些需求是坑）', '项目排期（知道哪个团队会拖延）'],
      },
      {
        score: 2,
        label: '全隐性',
        shortDesc: '关键信息只存在于人的体感记忆中',
        detailDesc: '信息不存在于任何文档中：利益结构、权力格局、历史恩怨、团队士气。只有身在其中的人才知道。',
        examples: ['跨部门协作时"谁说了算"', '推动变革时"该先找谁聊"', '利益勾兑和复杂潜规则', '"现在不是推这件事的时机"'],
      },
    ],
  },
  {
    id: 5,
    name: '责任归属层',
    shortName: '责任归属',
    question: '如果AI做错了，后果谁来扛？',
    icon: '⚖️',
    options: [
      {
        score: 0,
        label: '无后果/低后果',
        shortDesc: '出错了改了就行',
        detailDesc: '错误后果有限，组织内部可消化。重做、修改、小范围影响。',
        examples: ['内部周报写错', '数据统计小错', '文案措辞不当'],
      },
      {
        score: 1,
        label: '组织内后果',
        shortDesc: '有影响但组织内部可消化',
        detailDesc: '错误会造成一定影响，需要汇报、复盘、修正，但在组织层面可处理。',
        examples: ['项目延期一周', '运营活动配置失误', '内部流程审批错误'],
      },
      {
        score: 2,
        label: '法律/商业后果',
        shortDesc: '出错有法律诉讼、监管处罚、重大商业损失',
        detailDesc: '错误的后果超出组织消化能力，涉及法律责任、监管处罚、重大资损。组织无法承受"AI干的"这个答案。',
        examples: ['审计意见签字', '合规认定', '医疗诊断', '超曝光资损', '法律终审'],
      },
    ],
  },
  {
    id: 6,
    name: '信任锚定层',
    shortName: '信任锚定',
    question: '这个任务的结果，跟"谁做的"有关系吗？',
    icon: '🤝',
    options: [
      {
        score: 0,
        label: '无需信任',
        shortDesc: '谁做结果都一样',
        detailDesc: '结果自证，不依赖做的人的身份、信用、关系。1+1=2，谁算都对。',
        examples: ['代码review（代码对不对和谁review无关）', '数据计算', '标准化质检'],
      },
      {
        score: 1,
        label: '组织信任',
        shortDesc: '需要组织背书（品牌、资质、认证）',
        detailDesc: '结果的有效性依赖组织信用，但不依赖特定个人。大公司盖章 vs 小公司盖章效果不同。',
        examples: ['审计报告（四大会计师事务所盖章）', '产品认证', '标准化合规检查'],
      },
      {
        score: 2,
        label: '个人信任',
        shortDesc: '同样的话，不同人说效果不同',
        detailDesc: '结果的有效性依赖特定个人的信用、判断力、关系积累。换个人做，同样的内容效果完全不同。',
        examples: ['战略顾问建议', '投资决策', '关键客户谈判', 'CEO的战略判断'],
      },
    ],
  },
];