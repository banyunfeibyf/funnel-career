/**
 * 10个预设岗位数据
 * 每个岗位包含：任务列表、时间占比、6层漏斗评分、刚性/柔性判断
 */

import type { FunnelScore } from './funnelLayers';

export interface TaskFunnelScore {
  layerId: number;
  score: FunnelScore;
  isRigid?: boolean; // 不通过(score=2)时，是否为刚性壁垒
}

export interface Task {
  id: string;
  name: string;
  timeRatio: number; // 工作时间占比 0-100
  description: string;
  funnelScores: TaskFunnelScore[];
}

export interface JobTemplate {
  id: string;
  name: string;
  industry: string;
  icon: string;
  description: string;
  tasks: Task[];
}

export const JOB_TEMPLATES: JobTemplate[] = [
  {
    id: 'product-manager',
    name: '产品经理',
    industry: '互联网',
    icon: '📱',
    description: '负责产品规划、需求定义、项目管理，是用户需求和技术实现之间的桥梁',
    tasks: [
      {
        id: 'pm-1',
        name: '写PRD/需求文档',
        timeRatio: 25,
        description: '撰写产品需求文档，定义功能、交互、逻辑',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证：需要人判断需求是否合理
          { layerId: 2, score: 1 }, // 可人工修正：改改就行
          { layerId: 3, score: 1 }, // 过程即思考：写PRD就是理清需求
          { layerId: 4, score: 1 }, // 半隐性：部分需求靠经验
          { layerId: 5, score: 0 }, // 无后果：PRD写错改了就行
          { layerId: 6, score: 0 }, // 无需信任：PRD内容不依赖谁写
        ],
      },
      {
        id: 'pm-2',
        name: '数据分析与监控',
        timeRatio: 20,
        description: '看数据、做报表、监控核心指标',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证：数据对不对可验证
          { layerId: 2, score: 0 }, // 可自愈：数据算错了重算
          { layerId: 3, score: 0 }, // 纯产出型：只看数据结果
          { layerId: 4, score: 0 }, // 全显性：数据都在系统里
          { layerId: 5, score: 0 }, // 无后果：数据看错了改了就行
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'pm-3',
        name: '需求评审与跨部门协调',
        timeRatio: 20,
        description: '组织需求评审，协调开发、设计、测试等各方资源',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证：协调结果好不好没有客观标准
          { layerId: 2, score: 1 }, // 可人工修正：协调不到位可以补救
          { layerId: 3, score: 2 }, // 过程即关系：协调过程本身就是建立关系
          { layerId: 4, score: 1 }, // 半隐性：知道找谁、怎么沟通靠经验
          { layerId: 5, score: 1 }, // 组织内后果：协调不好项目延期
          { layerId: 6, score: 1 }, // 组织信任：需要PM的公信力
        ],
      },
      {
        id: 'pm-4',
        name: '竞品分析/行业调研',
        timeRatio: 15,
        description: '分析竞品动态、行业趋势，输出分析报告',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证：分析结论需要判断
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 1 }, // 过程即思考：分析过程就是认知过程
          { layerId: 4, score: 0 }, // 全显性：竞品信息大多公开
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'pm-5',
        name: '战略规划与方向判断',
        timeRatio: 10,
        description: '定义产品方向、做取舍、判断优先级',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证：方向对不对需要判断力
          { layerId: 2, score: 2, isRigid: true }, // 不可逆：方向错了浪费几个月
          { layerId: 3, score: 1 }, // 过程即思考
          { layerId: 4, score: 1 }, // 半隐性：判断需要经验+信息
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 1 }, // 组织信任：方向判断依赖PM的信用
        ],
      },
      {
        id: 'pm-6',
        name: '向上汇报与目标对齐',
        timeRatio: 10,
        description: '向老板汇报进展、对齐目标、争取资源',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 2 }, // 过程即关系：汇报本身就是维护关系
          { layerId: 4, score: 2, isRigid: true }, // 全隐性：老板偏好、组织政治
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 2, isRigid: true }, // 个人信任：同样的话不同人说效果不同
        ],
      },
    ],
  },
  {
    id: 'backend-developer',
    name: '后端程序员',
    industry: '互联网',
    icon: '💻',
    description: '负责服务端逻辑开发、系统架构设计、性能优化',
    tasks: [
      {
        id: 'dev-1',
        name: '编写业务代码',
        timeRatio: 40,
        description: '根据需求文档编写后端业务逻辑代码',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证：编译+测试
          { layerId: 2, score: 0 }, // 可自愈：bug修复后重新部署
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性：需求文档+代码库
          { layerId: 5, score: 0 }, // 无后果：bug改了就行
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'dev-2',
        name: '系统架构设计',
        timeRatio: 20,
        description: '设计系统架构、技术选型、模块划分',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证：架构好不好需要经验判断
          { layerId: 2, score: 1 }, // 可人工修正：架构可以迭代
          { layerId: 3, score: 1 }, // 过程即思考：设计过程就是思考过程
          { layerId: 4, score: 1 }, // 半隐性：需要了解历史技术债和团队情况
          { layerId: 5, score: 1 }, // 组织内后果：架构选错影响项目
          { layerId: 6, score: 1 }, // 组织信任：架构决策依赖技术信用
        ],
      },
      {
        id: 'dev-3',
        name: '代码审查(CR)',
        timeRatio: 15,
        description: 'Review团队成员的代码，发现问题',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证：代码问题可验证
          { layerId: 2, score: 0 }, // 可人工修正
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性：代码都在
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'dev-4',
        name: '线上问题排查',
        timeRatio: 15,
        description: '排查线上故障、性能问题',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证：排查结果需要验证
          { layerId: 2, score: 1 }, // 可人工修正：修复后验证
          { layerId: 3, score: 1 }, // 过程即思考：排查过程就是推理过程
          { layerId: 4, score: 1 }, // 半隐性：需要经验判断问题在哪
          { layerId: 5, score: 1 }, // 组织内后果：线上故障有影响
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'dev-5',
        name: '技术方案评审/跨团队协调',
        timeRatio: 10,
        description: '参与技术评审，协调上下游团队',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 2 }, // 过程即关系
          { layerId: 4, score: 1 }, // 半隐性
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
    ],
  },
  {
    id: 'operations-specialist',
    name: '运营专员',
    industry: '互联网',
    icon: '📊',
    description: '负责用户运营、活动运营、内容运营等日常运营工作',
    tasks: [
      {
        id: 'ops-1',
        name: '活动配置与执行',
        timeRatio: 25,
        description: '配置运营活动、优惠券、抽奖等',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证：配置对不对可验证
          { layerId: 2, score: 1 }, // 可人工修正：配置错了可修改
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 1 }, // 组织内后果：配置错可能影响用户
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'ops-2',
        name: '数据统计与报表',
        timeRatio: 20,
        description: '统计运营数据、制作报表',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证
          { layerId: 2, score: 0 }, // 可自愈
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'ops-3',
        name: '文案/内容创作',
        timeRatio: 20,
        description: '撰写活动文案、用户触达内容',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证：文案好不好需要人判断
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 0 }, // 纯产出型（文案是产出物）
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'ops-4',
        name: '用户反馈处理与策略调整',
        timeRatio: 20,
        description: '处理用户反馈，根据反馈调整运营策略',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 1 }, // 过程即思考
          { layerId: 4, score: 1 }, // 半隐性：用户反馈背后有隐含信息
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'ops-5',
        name: '跨部门资源协调',
        timeRatio: 15,
        description: '协调设计、开发、法务等资源推进运营项目',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 2 }, // 过程即关系
          { layerId: 4, score: 1 }, // 半隐性
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
    ],
  },
  {
    id: 'sales-bd',
    name: '销售/BD',
    industry: '通用',
    icon: '🤝',
    description: '负责客户拓展、商务谈判、签约达成业绩目标',
    tasks: [
      {
        id: 'sales-1',
        name: '客户开拓与关系维护',
        timeRatio: 35,
        description: '拜访客户、维护客情、建立信任关系',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 1 }, // 可人工修正：关系可以修复
          { layerId: 3, score: 2, isRigid: true }, // 过程即关系：维护关系就是核心价值
          { layerId: 4, score: 2, isRigid: true }, // 全隐性：客户偏好、人际关系
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 2, isRigid: true }, // 个人信任：客户认的是你这个人
        ],
      },
      {
        id: 'sales-2',
        name: '商务谈判',
        timeRatio: 25,
        description: '与客户谈判价格、条款、合作模式',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 2, isRigid: true }, // 不可逆：谈下来的条件改不了
          { layerId: 3, score: 2, isRigid: true }, // 过程即关系
          { layerId: 4, score: 2, isRigid: true }, // 全隐性：对方底线、内部权限
          { layerId: 5, score: 2, isRigid: true }, // 法律/商业后果
          { layerId: 6, score: 2, isRigid: true }, // 个人信任
        ],
      },
      {
        id: 'sales-3',
        name: '方案/报价撰写',
        timeRatio: 20,
        description: '撰写商务方案、报价单、合同条款',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 1 }, // 半隐性：报价策略靠经验
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'sales-4',
        name: 'CRM数据维护与报表',
        timeRatio: 10,
        description: '维护客户数据、做销售报表',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证
          { layerId: 2, score: 0 }, // 可自愈
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'sales-5',
        name: '内部资源争取与协调',
        timeRatio: 10,
        description: '争取公司内部资源支持客户项目',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 2 }, // 过程即关系
          { layerId: 4, score: 2, isRigid: true }, // 全隐性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
    ],
  },
  {
    id: 'junior-lawyer',
    name: '律师（初级）',
    industry: '法律',
    icon: '⚖️',
    description: '负责法律检索、合同审查、文书起草等基础法律工作',
    tasks: [
      {
        id: 'law-1',
        name: '法条检索与案例查找',
        timeRatio: 25,
        description: '查找相关法律条文、判例、法规',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证：法条对不对可验证
          { layerId: 2, score: 0 }, // 可自愈
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性：法条都在数据库里
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'law-2',
        name: '合同比对与审查',
        timeRatio: 25,
        description: '审查合同条款、比对模板、标注风险点',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证：条款是否合规可验证
          { layerId: 2, score: 1 }, // 可人工修正：遗漏可补
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性：合同文本都在
          { layerId: 5, score: 1 }, // 组织内后果：合同审查遗漏有风险
          { layerId: 6, score: 1 }, // 组织信任：需要律所资质
        ],
      },
      {
        id: 'law-3',
        name: '法律文书起草',
        timeRatio: 25,
        description: '起草合同、起诉状、答辩状等法律文书',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证：文书质量需人判断
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
      {
        id: 'law-4',
        name: '法律策略制定',
        timeRatio: 15,
        description: '分析案情、制定诉讼/谈判策略',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 2, isRigid: true }, // 不可逆：策略错了案件可能输
          { layerId: 3, score: 1 }, // 过程即思考
          { layerId: 4, score: 1 }, // 半隐性：需要经验判断
          { layerId: 5, score: 2, isRigid: true }, // 法律/商业后果
          { layerId: 6, score: 2, isRigid: true }, // 个人信任
        ],
      },
      {
        id: 'law-5',
        name: '庭审辩护',
        timeRatio: 10,
        description: '出庭辩护、质证、辩论',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 2, isRigid: true }, // 不可逆
          { layerId: 3, score: 2, isRigid: true }, // 过程即关系：庭审过程就是说服法官
          { layerId: 4, score: 2, isRigid: true }, // 全隐性：法官偏好、对方策略
          { layerId: 5, score: 2, isRigid: true }, // 法律/商业后果
          { layerId: 6, score: 2, isRigid: true }, // 个人信任
        ],
      },
    ],
  },
  {
    id: 'doctor',
    name: '医生',
    industry: '医疗',
    icon: '🏥',
    description: '负责疾病诊断、治疗方案制定、患者沟通',
    tasks: [
      {
        id: 'doc-1',
        name: '病历记录与文书',
        timeRatio: 15,
        description: '书写病历、开具处方、填写报告',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证：格式规范可验证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'doc-2',
        name: '影像/检验报告解读',
        timeRatio: 15,
        description: '阅读CT、MRI、血液检验报告',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证：需要专业判断
          { layerId: 2, score: 1 }, // 可人工修正：可以会诊
          { layerId: 3, score: 1 }, // 过程即思考：读片过程就是诊断推理
          { layerId: 4, score: 0 }, // 全显性：影像和检验数据都在
          { layerId: 5, score: 2, isRigid: true }, // 法律/商业后果：误诊有人身安全风险
          { layerId: 6, score: 1 }, // 组织信任：需要医师资质
        ],
      },
      {
        id: 'doc-3',
        name: '疾病诊断',
        timeRatio: 25,
        description: '根据症状、检查结果判断疾病',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证
          { layerId: 2, score: 2, isRigid: true }, // 不可逆：误诊可能导致错误治疗
          { layerId: 3, score: 1 }, // 过程即思考
          { layerId: 4, score: 1 }, // 半隐性：需要临床经验
          { layerId: 5, score: 2, isRigid: true }, // 法律/商业后果
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
      {
        id: 'doc-4',
        name: '治疗方案制定',
        timeRatio: 20,
        description: '制定手术/用药/康复方案',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 2, isRigid: true }, // 不可逆
          { layerId: 3, score: 1 }, // 过程即思考
          { layerId: 4, score: 1 }, // 半隐性
          { layerId: 5, score: 2, isRigid: true }, // 法律/商业后果
          { layerId: 6, score: 2, isRigid: true }, // 个人信任：患者信任医生
        ],
      },
      {
        id: 'doc-5',
        name: '患者沟通与安抚',
        timeRatio: 25,
        description: '告知病情、安抚情绪、建立医患信任',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 1 }, // 可人工修正：沟通可以重新来
          { layerId: 3, score: 2, isRigid: true }, // 过程即关系
          { layerId: 4, score: 2, isRigid: true }, // 全隐性：患者心理状态、家庭情况
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 2, isRigid: true }, // 个人信任
        ],
      },
    ],
  },
  {
    id: 'teacher',
    name: '教师',
    industry: '教育',
    icon: '📚',
    description: '负责教学、备课、学生评价与辅导',
    tasks: [
      {
        id: 'teach-1',
        name: '备课与课件制作',
        timeRatio: 20,
        description: '准备课程内容、制作PPT和教案',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'teach-2',
        name: '课堂教学',
        timeRatio: 30,
        description: '课堂讲授、互动、答疑',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证：教学效果需要评估
          { layerId: 2, score: 1 }, // 可人工修正：下节课可以调整
          { layerId: 3, score: 2, isRigid: true }, // 过程即关系：师生互动是教学核心
          { layerId: 4, score: 1 }, // 半隐性：需要了解学生状态
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
      {
        id: 'teach-3',
        name: '作业批改与评价',
        timeRatio: 20,
        description: '批改作业、打分、写评语',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证：有标准答案
          { layerId: 2, score: 0 }, // 可自愈：批错了可以改
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'teach-4',
        name: '学生个性化辅导',
        timeRatio: 15,
        description: '针对个别学生的辅导和心理支持',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 2, isRigid: true }, // 过程即关系
          { layerId: 4, score: 2, isRigid: true }, // 全隐性：学生心理状态
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 2, isRigid: true }, // 个人信任
        ],
      },
      {
        id: 'teach-5',
        name: '教学研究与课程设计',
        timeRatio: 15,
        description: '研究教学方法、设计课程体系',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 1 }, // 过程即思考
          { layerId: 4, score: 1 }, // 半隐性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
    ],
  },
  {
    id: 'accountant',
    name: '会计师',
    industry: '金融',
    icon: '🧮',
    description: '负责账务处理、财务报表、审计配合',
    tasks: [
      {
        id: 'acc-1',
        name: '日常账务处理',
        timeRatio: 30,
        description: '凭证录入、账目核对、报销审核',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证
          { layerId: 2, score: 0 }, // 可自愈
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'acc-2',
        name: '财务报表编制',
        timeRatio: 25,
        description: '编制资产负债表、利润表、现金流量表',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
      {
        id: 'acc-3',
        name: '税务申报',
        timeRatio: 15,
        description: '计算税费、填报税表、税务合规',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 2, isRigid: true }, // 法律/商业后果
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
      {
        id: 'acc-4',
        name: '审计配合与问题处理',
        timeRatio: 15,
        description: '配合外部审计、处理审计发现的问题',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 1 }, // 过程即思考
          { layerId: 4, score: 1 }, // 半隐性
          { layerId: 5, score: 2, isRigid: true }, // 法律/商业后果
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
      {
        id: 'acc-5',
        name: '财务分析与建议',
        timeRatio: 15,
        description: '分析财务数据、提供经营建议',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 1 }, // 过程即思考
          { layerId: 4, score: 1 }, // 半隐性
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
    ],
  },
  {
    id: 'content-editor',
    name: '内容编辑/文案',
    industry: '传媒',
    icon: '✍️',
    description: '负责内容创作、编辑、选题策划',
    tasks: [
      {
        id: 'edit-1',
        name: '内容撰写/文案创作',
        timeRatio: 35,
        description: '撰写文章、广告文案、社媒内容',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证：好不好需要人判断
          { layerId: 2, score: 1 }, // 可人工修正：改改就行
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'edit-2',
        name: '内容审核/校对',
        timeRatio: 20,
        description: '审核内容合规性、校对错别字和事实错误',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证
          { layerId: 2, score: 0 }, // 可自愈
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 1 }, // 组织内后果：漏审有合规风险
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'edit-3',
        name: '选题策划',
        timeRatio: 20,
        description: '确定内容方向、选题、策划专题',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证：选题好不好需要判断力
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 1 }, // 过程即思考
          { layerId: 4, score: 1 }, // 半隐性：需要了解受众偏好
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'edit-4',
        name: '排版与发布',
        timeRatio: 15,
        description: '排版、配图、发布到各平台',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证
          { layerId: 2, score: 0 }, // 可自愈
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'edit-5',
        name: '作者/资源关系维护',
        timeRatio: 10,
        description: '维护作者关系、约稿、协调内容资源',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 2, isRigid: true }, // 过程即关系
          { layerId: 4, score: 2, isRigid: true }, // 全隐性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 2, isRigid: true }, // 个人信任
        ],
      },
    ],
  },
  {
    id: 'traffic-stability-pm',
    name: '流量/稳定性产品经理',
    industry: '互联网',
    icon: '🎯',
    description: '负责流量分发稳定性、达标率监控、资损防控',
    tasks: [
      {
        id: 'tspm-1',
        name: '监控大盘指标',
        timeRatio: 20,
        description: '监控达标率、曝光量、资损率等核心指标',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证：数据对不对可验证
          { layerId: 2, score: 0 }, // 可自愈：看错了可以重看
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性：指标都在系统里
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'tspm-2',
        name: '配置流量规则/策略参数',
        timeRatio: 15,
        description: '配置流量分配规则、调控参数',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证：配置对不对可验证
          { layerId: 2, score: 1 }, // 可人工修正：配错了可改，但有资损窗口期
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 1 }, // 组织内后果：配置错可能影响流量
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'tspm-3',
        name: '异常排查',
        timeRatio: 20,
        description: '流量跌了、超曝光了等异常的排查和定位',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证：排查结果需要验证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 1 }, // 过程即思考：排查就是推理过程
          { layerId: 4, score: 1 }, // 半隐性：需要经验判断问题在哪
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'tspm-4',
        name: '跨团队协调（算法/工程/业务）',
        timeRatio: 15,
        description: '协调算法侧、工程侧、业务侧解决稳定性问题',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 2, isRigid: true }, // 过程即关系
          { layerId: 4, score: 2, isRigid: true }, // 全隐性：谁知道什么、找谁有效
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
      {
        id: 'tspm-5',
        name: '制定稳定性预案和兜底策略',
        timeRatio: 15,
        description: '设计熔断、降级、兜底等稳定性方案',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证：预案好不好要出事才知道
          { layerId: 2, score: 2, isRigid: true }, // 不可逆：预案没覆盖的场景=资损
          { layerId: 3, score: 1 }, // 过程即思考：预案设计就是推演过程
          { layerId: 4, score: 1 }, // 半隐性：需要知道系统边界和极端情况
          { layerId: 5, score: 2, isRigid: true }, // 法律/商业后果：资损
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
      {
        id: 'tspm-6',
        name: '复盘与资损定级',
        timeRatio: 10,
        description: '故障复盘、资损定级、改进措施',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证：定级准不准没有客观标准
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 1 }, // 过程即思考
          { layerId: 4, score: 2, isRigid: true }, // 全隐性：复盘中的政治博弈
          { layerId: 5, score: 2, isRigid: true }, // 法律/商业后果
          { layerId: 6, score: 1 }, // 组织信任
        ],
      },
      {
        id: 'tspm-7',
        name: '向上汇报与目标对齐',
        timeRatio: 5,
        description: '向管理层汇报稳定性状况、对齐达标目标',
        funnelScores: [
          { layerId: 1, score: 2 }, // 不可自证
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 2, isRigid: true }, // 过程即关系
          { layerId: 4, score: 2, isRigid: true }, // 全隐性
          { layerId: 5, score: 1 }, // 组织内后果
          { layerId: 6, score: 2, isRigid: true }, // 个人信任
        ],
      },
    ],
  },
  {
    id: 'data-entry',
    name: '数据录入员',
    industry: '通用',
    icon: '📋',
    description: '负责数据录入、整理、校验等重复性数据处理工作',
    tasks: [
      {
        id: 'entry-1',
        name: '数据录入',
        timeRatio: 45,
        description: '将纸质/非结构化数据录入系统',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证
          { layerId: 2, score: 0 }, // 可自愈
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'entry-2',
        name: '数据校验',
        timeRatio: 25,
        description: '检查录入数据的准确性和完整性',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证
          { layerId: 2, score: 0 }, // 可自愈
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'entry-3',
        name: '格式转换与整理',
        timeRatio: 20,
        description: '数据格式转换、清洗、整理',
        funnelScores: [
          { layerId: 1, score: 0 }, // 可自证
          { layerId: 2, score: 0 }, // 可自愈
          { layerId: 3, score: 0 }, // 纯产出型
          { layerId: 4, score: 0 }, // 全显性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
      {
        id: 'entry-4',
        name: '异常数据处理',
        timeRatio: 10,
        description: '处理非标准格式的异常数据',
        funnelScores: [
          { layerId: 1, score: 1 }, // 半自证：异常对不对需要判断
          { layerId: 2, score: 1 }, // 可人工修正
          { layerId: 3, score: 1 }, // 过程即思考：判断异常需要经验
          { layerId: 4, score: 1 }, // 半隐性
          { layerId: 5, score: 0 }, // 无后果
          { layerId: 6, score: 0 }, // 无需信任
        ],
      },
    ],
  },
];