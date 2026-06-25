/**
 * 刚性/柔性判断规则表
 * 每一层的"未通过"状态，都有默认的刚性/柔性判断和追问
 */

export interface RigidRule {
  layerId: number;
  /** 层名称缩写 */
  shortName: string;
  /** 该层未通过时（score > 0），默认是刚性还是柔性 */
  defaultType: 'rigid' | 'flexible';
  /** 默认判断的理由 */
  defaultReason: string;
  /** 追问：帮助用户确认是否真的是刚性/柔性 */
  followUpQuestion: string;
  /** 什么情况下刚性→柔性（降级条件） */
  downgradeCondition: string;
  /** 什么情况下柔性→刚性（升级条件） */
  upgradeCondition: string;
  /** 典型刚性岗位举例 */
  rigidExamples: string[];
  /** 典型柔性岗位举例 */
  flexibleExamples: string[];
}

export const RIGID_RULES: RigidRule[] = [
  {
    layerId: 2,
    shortName: '人工修正',
    defaultType: 'flexible',
    defaultReason: '容错性通常可以通过增加流程、灰度、回滚等机制改造，大多数组织有动力做这种改造。',
    followUpQuestion: '你的任务出错后，组织能否通过加流程（如灰度发布、自动回滚、审批流）来降低错误影响？',
    downgradeCondition: '组织可以通过加流程降低错误影响 → 柔性（容错可改造）',
    upgradeCondition: '错误造成不可逆的物理后果（如医疗事故）或法律后果（如合同已签署） → 刚性',
    rigidExamples: ['外科医生', '法官', '审计师（签署法律文件）', '飞行员'],
    flexibleExamples: ['运营配置员', '内容审核员', '数据分析师', '测试工程师'],
  },
  {
    layerId: 3,
    shortName: '过程价值',
    defaultType: 'rigid',
    defaultReason: '过程价值通常难以被绕过——如果过程本身就是产出，那跳过过程就失去了核心价值。',
    followUpQuestion: '你的工作过程中，人际互动、情感连接、创意探索等是否本身就是核心产出，而不仅仅是手段？',
    downgradeCondition: '过程只是手段而非目的，且最终产物可以自证质量 → 可能为柔性',
    upgradeCondition: '过程即关系（如客户信任的建立）或过程即思考（如关键决策） → 刚性',
    rigidExamples: ['心理咨询师', '销售（关系型）', '高管决策', '教师（育人过程）'],
    flexibleExamples: ['程序员（过程是手段）', '数据录入员', '客服（话术型）', '会计（规则型）'],
  },
  {
    layerId: 4,
    shortName: '信息可见度',
    defaultType: 'flexible',
    defaultReason: '隐性信息有天然显性化的趋势——组织总有动力将经验SOP化、文档化，尤其是AI能力提升后。',
    followUpQuestion: '你依赖的隐性信息，是组织正在推动显性化的（如写文档、做SOP），还是因为其本质难以显性化？',
    downgradeCondition: '隐性信息正在被SOP化/文档化，或可以通过培训传递 → 柔性',
    upgradeCondition: '信息本质上是关系性的（如客户偏好、组织政治），无法文档化 → 刚性',
    rigidExamples: ['高级销售（客户关系）', '战略顾问（组织政治）', '投资合伙人（判断力）'],
    flexibleExamples: ['运维工程师（经验可文档化）', '产品经理（用户调研可流程化）', '审计员（检查清单化）'],
  },
  {
    layerId: 5,
    shortName: '责任归属',
    defaultType: 'flexible',
    defaultReason: '责任归属是制度设计的产物——组织可以调整制度将责任从人转移到系统。',
    followUpQuestion: '你的任务出了问题，追责对象是法律/监管规定的（刚性），还是组织内部制度规定的（柔性）？',
    downgradeCondition: '责任是组织内制度规定的，组织可以调整 → 柔性',
    upgradeCondition: '责任由法律/监管/商业合同规定，必须由自然人承担 → 刚性',
    rigidExamples: ['律师', '审计师', '医生', '飞行员', '法官'],
    flexibleExamples: ['产品经理', '运营', '项目经理', '数据分析师'],
  },
  {
    layerId: 6,
    shortName: '信任锚定',
    defaultType: 'flexible',
    defaultReason: '组织信任比个人信任更容易转移——随着AI系统可靠性提升，组织可能信任系统而非个人。',
    followUpQuestion: '你的任务需要的信任，是必须落到你个人身上的（个人信用、关系），还是落到你代表的组织/资质上的？',
    downgradeCondition: '信任基于组织资质/流程（如审计机构的资质），而非个人 → 柔性',
    upgradeCondition: '信任基于个人信用、长期关系、独特判断力 → 刚性',
    rigidExamples: ['创始人', '高级合伙人', '顶级医生（个人品牌）', '独立顾问'],
    flexibleExamples: ['大公司中层', '审计员（事务所品牌）', '银行柜员', '质检员'],
  },
];

/**
 * 层1（产物自证）不做刚性/柔性判断
 * 层1：产物能否自证是客观事实，不涉及刚性/柔性
 */

/**
 * 根据层ID获取刚性/柔性规则
 */
export function getRigidRuleByLayer(layerId: number): RigidRule | undefined {
  return RIGID_RULES.find(r => r.layerId === layerId);
}

/**
 * 获取用户在某层的默认刚性/柔性判断
 * 仅对层2-6有效，层1不需要判断
 */
export function getDefaultRigidType(layerId: number, score: number): 'rigid' | 'flexible' | null {
  if (layerId === 1) return null; // 层1不判断
  if (score === 0) return null; // 通过了漏斗，不需要判断
  const rule = getRigidRuleByLayer(layerId);
  return rule?.defaultType ?? null;
}