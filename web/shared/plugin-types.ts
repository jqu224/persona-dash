// ---- plugin:feishu_bitable_onboarding_task_read_1 ----
// ============================================================
// 插件 feishu_bitable_onboarding_task_read_1 (读取入职任务多维表格数据) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface FeishuBitableOnboardingTaskReadOneBatchaddrecordsInput {
  /** [object Object] */
  records: {
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_task_read_1').call<FeishuBitableOnboardingTaskReadOneBatchaddrecordsOutput>('batchAddRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableOnboardingTaskReadOneBatchaddrecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FeishuBitableOnboardingTaskReadOneBatchupdaterecordsInput {
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_task_read_1').call<FeishuBitableOnboardingTaskReadOneBatchupdaterecordsOutput>('batchUpdateRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableOnboardingTaskReadOneBatchupdaterecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}
// ---- end:feishu_bitable_onboarding_task_read_1 ----

// ---- plugin:feishu_bitable_onboarding_role_read_1 ----
// ============================================================
// 插件 feishu_bitable_onboarding_role_read_1 (读取新人助手多维表格工种角色数据) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface FeishuBitableOnboardingRoleReadOneAggregatequeryInput {
  /** [object Object] */
  dimensions?: string[];
  /** [object Object] */
  measures?: {
    fieldName: string;
    aggregation: string;
    alias?: string;
  }[];
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  pageSize?: number;
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conditions?: {
      fieldName: string;
      operator: string;
      value?: string[];
    }[];
    conjunction?: string;
  };
  /** [object Object] */
  expandArrayDimension?: boolean;
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_role_read_1').call<FeishuBitableOnboardingRoleReadOneAggregatequeryOutput>('aggregateQuery', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { result, hasMore, pageToken } = result;
 * 返回值形如：
 *   {"result":[{}],"hasMore":false,"pageToken":"示例文本"}
 */
export interface FeishuBitableOnboardingRoleReadOneAggregatequeryOutput {
  /** [object Object] */
  result: {

  }[];
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
}

export interface FeishuBitableOnboardingRoleReadOneBatchaddrecordsInput {
  /** [object Object] */
  records: {
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_role_read_1').call<FeishuBitableOnboardingRoleReadOneBatchaddrecordsOutput>('batchAddRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableOnboardingRoleReadOneBatchaddrecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FeishuBitableOnboardingRoleReadOneBatchupdaterecordsInput {
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_role_read_1').call<FeishuBitableOnboardingRoleReadOneBatchupdaterecordsOutput>('batchUpdateRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableOnboardingRoleReadOneBatchupdaterecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FeishuBitableOnboardingRoleReadOneDeleterecordsInput {
  /** [object Object] */
  recordIDs: string[];
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_role_read_1').call<FeishuBitableOnboardingRoleReadOneDeleterecordsOutput>('deleteRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { success } = result;
 * 返回值形如：
 *   {"success":false}
 */
export interface FeishuBitableOnboardingRoleReadOneDeleterecordsOutput {
  /** [object Object] */
  success: boolean;
}

export interface FeishuBitableOnboardingRoleReadOneGetrecordInput {
  /** [object Object] */
  recordID: string;
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_role_read_1').call<FeishuBitableOnboardingRoleReadOneGetrecordOutput>('getRecord', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { id, record } = result;
 * 返回值形如：
 *   {"id":"示例文本","record":{}}
 */
export interface FeishuBitableOnboardingRoleReadOneGetrecordOutput {
  /** [object Object] */
  id: string;
  /** [object Object] */
  record?: {

  };
}

export interface FeishuBitableOnboardingRoleReadOneSearchrecordsInput {
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conjunction?: string;
    conditions?: {
      value?: string[];
      fieldName: string;
      operator: string;
    }[];
  };
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  pageSize?: number;
  /** [object Object] */
  fieldNames?: string[];
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_role_read_1').call<FeishuBitableOnboardingRoleReadOneSearchrecordsOutput>('searchRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { hasMore, pageToken, total, ... } = result;
 * 返回值形如：
 *   {"hasMore":false,"pageToken":"示例文本","total":0,"records":[{"id":"示例文本","record":{}}]}
 */
export interface FeishuBitableOnboardingRoleReadOneSearchrecordsOutput {
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  total?: number;
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
}
// ---- end:feishu_bitable_onboarding_role_read_1 ----

// ---- plugin:feishu_bitable_knowledge_quiz_read_1 ----
// ============================================================
// 插件 feishu_bitable_knowledge_quiz_read_1 (读取知识测验题库) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface FeishuBitableKnowledgeQuizReadOneAggregatequeryInput {
  /** [object Object] */
  pageSize?: number;
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conjunction?: string;
    conditions?: {
      fieldName: string;
      operator: string;
      value?: string[];
    }[];
  };
  /** [object Object] */
  expandArrayDimension?: boolean;
  /** [object Object] */
  dimensions?: string[];
  /** [object Object] */
  measures?: {
    fieldName: string;
    aggregation: string;
    alias?: string;
  }[];
  /** [object Object] */
  pageToken?: string;
}

/**
 * capabilityClient.load('feishu_bitable_knowledge_quiz_read_1').call<FeishuBitableKnowledgeQuizReadOneAggregatequeryOutput>('aggregateQuery', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { result, hasMore, pageToken } = result;
 * 返回值形如：
 *   {"result":[{}],"hasMore":false,"pageToken":"示例文本"}
 */
export interface FeishuBitableKnowledgeQuizReadOneAggregatequeryOutput {
  /** [object Object] */
  result: {

  }[];
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
}

export interface FeishuBitableKnowledgeQuizReadOneBatchaddrecordsInput {
  /** [object Object] */
  records: {
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_knowledge_quiz_read_1').call<FeishuBitableKnowledgeQuizReadOneBatchaddrecordsOutput>('batchAddRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableKnowledgeQuizReadOneBatchaddrecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FeishuBitableKnowledgeQuizReadOneBatchupdaterecordsInput {
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_knowledge_quiz_read_1').call<FeishuBitableKnowledgeQuizReadOneBatchupdaterecordsOutput>('batchUpdateRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableKnowledgeQuizReadOneBatchupdaterecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FeishuBitableKnowledgeQuizReadOneDeleterecordsInput {
  /** [object Object] */
  recordIDs: string[];
}

/**
 * capabilityClient.load('feishu_bitable_knowledge_quiz_read_1').call<FeishuBitableKnowledgeQuizReadOneDeleterecordsOutput>('deleteRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { success } = result;
 * 返回值形如：
 *   {"success":false}
 */
export interface FeishuBitableKnowledgeQuizReadOneDeleterecordsOutput {
  /** [object Object] */
  success: boolean;
}

export interface FeishuBitableKnowledgeQuizReadOneGetrecordInput {
  /** [object Object] */
  recordID: string;
}

/**
 * capabilityClient.load('feishu_bitable_knowledge_quiz_read_1').call<FeishuBitableKnowledgeQuizReadOneGetrecordOutput>('getRecord', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { id, record } = result;
 * 返回值形如：
 *   {"id":"示例文本","record":{}}
 */
export interface FeishuBitableKnowledgeQuizReadOneGetrecordOutput {
  /** [object Object] */
  id: string;
  /** [object Object] */
  record?: {

  };
}

export interface FeishuBitableKnowledgeQuizReadOneSearchrecordsInput {
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  pageSize?: number;
  /** [object Object] */
  fieldNames?: string[];
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conjunction?: string;
    conditions?: {
      fieldName: string;
      operator: string;
      value?: string[];
    }[];
  };
}

/**
 * capabilityClient.load('feishu_bitable_knowledge_quiz_read_1').call<FeishuBitableKnowledgeQuizReadOneSearchrecordsOutput>('searchRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records, hasMore, pageToken, ... } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本","record":{}}],"hasMore":false,"pageToken":"示例文本","total":0}
 */
export interface FeishuBitableKnowledgeQuizReadOneSearchrecordsOutput {
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  total?: number;
}
// ---- end:feishu_bitable_knowledge_quiz_read_1 ----

// ---- plugin:feishu_bitable_team_member_read_1 ----
// ============================================================
// 插件 feishu_bitable_team_member_read_1 (读取飞书多维表格团队成员数据) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface FeishuBitableTeamMemberReadOneAggregatequeryInput {
  /** [object Object] */
  dimensions?: string[];
  /** [object Object] */
  measures?: {
    alias?: string;
    fieldName: string;
    aggregation: string;
  }[];
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  pageSize?: number;
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conjunction?: string;
    conditions?: {
      fieldName: string;
      operator: string;
      value?: string[];
    }[];
  };
  /** [object Object] */
  expandArrayDimension?: boolean;
}

/**
 * capabilityClient.load('feishu_bitable_team_member_read_1').call<FeishuBitableTeamMemberReadOneAggregatequeryOutput>('aggregateQuery', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { result, hasMore, pageToken } = result;
 * 返回值形如：
 *   {"result":[{}],"hasMore":false,"pageToken":"示例文本"}
 */
export interface FeishuBitableTeamMemberReadOneAggregatequeryOutput {
  /** [object Object] */
  result: {

  }[];
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
}

export interface FeishuBitableTeamMemberReadOneBatchaddrecordsInput {
  /** [object Object] */
  records: {
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_team_member_read_1').call<FeishuBitableTeamMemberReadOneBatchaddrecordsOutput>('batchAddRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableTeamMemberReadOneBatchaddrecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FeishuBitableTeamMemberReadOneBatchupdaterecordsInput {
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_team_member_read_1').call<FeishuBitableTeamMemberReadOneBatchupdaterecordsOutput>('batchUpdateRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableTeamMemberReadOneBatchupdaterecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FeishuBitableTeamMemberReadOneDeleterecordsInput {
  /** [object Object] */
  recordIDs: string[];
}

/**
 * capabilityClient.load('feishu_bitable_team_member_read_1').call<FeishuBitableTeamMemberReadOneDeleterecordsOutput>('deleteRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { success } = result;
 * 返回值形如：
 *   {"success":false}
 */
export interface FeishuBitableTeamMemberReadOneDeleterecordsOutput {
  /** [object Object] */
  success: boolean;
}

export interface FeishuBitableTeamMemberReadOneGetrecordInput {
  /** [object Object] */
  recordID: string;
}

/**
 * capabilityClient.load('feishu_bitable_team_member_read_1').call<FeishuBitableTeamMemberReadOneGetrecordOutput>('getRecord', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { id, record } = result;
 * 返回值形如：
 *   {"id":"示例文本","record":{}}
 */
export interface FeishuBitableTeamMemberReadOneGetrecordOutput {
  /** [object Object] */
  id: string;
  /** [object Object] */
  record?: {

  };
}

export interface FeishuBitableTeamMemberReadOneSearchrecordsInput {
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  pageSize?: number;
  /** [object Object] */
  fieldNames?: string[];
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conjunction?: string;
    conditions?: {
      fieldName: string;
      operator: string;
      value?: string[];
    }[];
  };
}

/**
 * capabilityClient.load('feishu_bitable_team_member_read_1').call<FeishuBitableTeamMemberReadOneSearchrecordsOutput>('searchRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { pageToken, total, records, ... } = result;
 * 返回值形如：
 *   {"pageToken":"示例文本","total":0,"records":[{"id":"示例文本","record":{}}],"hasMore":false}
 */
export interface FeishuBitableTeamMemberReadOneSearchrecordsOutput {
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  total?: number;
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
  /** [object Object] */
  hasMore: boolean;
}
// ---- end:feishu_bitable_team_member_read_1 ----

// ---- plugin:feishu_bitable_work_tool_guide_read_1 ----
// ============================================================
// 插件 feishu_bitable_work_tool_guide_read_1 (读取工作工具指南数据) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface FeishuBitableWorkToolGuideReadOneAggregatequeryInput {
  /** [object Object] */
  dimensions?: string[];
  /** [object Object] */
  measures?: {
    fieldName: string;
    aggregation: string;
    alias?: string;
  }[];
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  pageSize?: number;
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conjunction?: string;
    conditions?: {
      fieldName: string;
      operator: string;
      value?: string[];
    }[];
  };
  /** [object Object] */
  expandArrayDimension?: boolean;
}

/**
 * capabilityClient.load('feishu_bitable_work_tool_guide_read_1').call<FeishuBitableWorkToolGuideReadOneAggregatequeryOutput>('aggregateQuery', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { hasMore, pageToken, result } = result;
 * 返回值形如：
 *   {"hasMore":false,"pageToken":"示例文本","result":[{}]}
 */
export interface FeishuBitableWorkToolGuideReadOneAggregatequeryOutput {
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  result: {

  }[];
}

export interface FeishuBitableWorkToolGuideReadOneBatchaddrecordsInput {
  /** [object Object] */
  records: {
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_work_tool_guide_read_1').call<FeishuBitableWorkToolGuideReadOneBatchaddrecordsOutput>('batchAddRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableWorkToolGuideReadOneBatchaddrecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FeishuBitableWorkToolGuideReadOneBatchupdaterecordsInput {
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_work_tool_guide_read_1').call<FeishuBitableWorkToolGuideReadOneBatchupdaterecordsOutput>('batchUpdateRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableWorkToolGuideReadOneBatchupdaterecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FeishuBitableWorkToolGuideReadOneDeleterecordsInput {
  /** [object Object] */
  recordIDs: string[];
}

/**
 * capabilityClient.load('feishu_bitable_work_tool_guide_read_1').call<FeishuBitableWorkToolGuideReadOneDeleterecordsOutput>('deleteRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { success } = result;
 * 返回值形如：
 *   {"success":false}
 */
export interface FeishuBitableWorkToolGuideReadOneDeleterecordsOutput {
  /** [object Object] */
  success: boolean;
}

export interface FeishuBitableWorkToolGuideReadOneGetrecordInput {
  /** [object Object] */
  recordID: string;
}

/**
 * capabilityClient.load('feishu_bitable_work_tool_guide_read_1').call<FeishuBitableWorkToolGuideReadOneGetrecordOutput>('getRecord', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { id, record } = result;
 * 返回值形如：
 *   {"id":"示例文本","record":{}}
 */
export interface FeishuBitableWorkToolGuideReadOneGetrecordOutput {
  /** [object Object] */
  id: string;
  /** [object Object] */
  record?: {

  };
}

export interface FeishuBitableWorkToolGuideReadOneSearchrecordsInput {
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conditions?: {
      operator: string;
      value?: string[];
      fieldName: string;
    }[];
    conjunction?: string;
  };
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  pageSize?: number;
  /** [object Object] */
  fieldNames?: string[];
}

/**
 * capabilityClient.load('feishu_bitable_work_tool_guide_read_1').call<FeishuBitableWorkToolGuideReadOneSearchrecordsOutput>('searchRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { hasMore, pageToken, total, ... } = result;
 * 返回值形如：
 *   {"hasMore":false,"pageToken":"示例文本","total":0,"records":[{"id":"示例文本","record":{}}]}
 */
export interface FeishuBitableWorkToolGuideReadOneSearchrecordsOutput {
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  total?: number;
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
}
// ---- end:feishu_bitable_work_tool_guide_read_1 ----

// ---- plugin:feishu_bitable_tool_tutorial_read_1 ----
// ============================================================
// 插件 feishu_bitable_tool_tutorial_read_1 (读取工具教程多维表格数据) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface FeishuBitableToolTutorialReadOneAggregatequeryInput {
  /** [object Object] */
  pageSize?: number;
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conditions?: {
      fieldName: string;
      operator: string;
      value?: string[];
    }[];
    conjunction?: string;
  };
  /** [object Object] */
  expandArrayDimension?: boolean;
  /** [object Object] */
  dimensions?: string[];
  /** [object Object] */
  measures?: {
    fieldName: string;
    aggregation: string;
    alias?: string;
  }[];
  /** [object Object] */
  pageToken?: string;
}

/**
 * capabilityClient.load('feishu_bitable_tool_tutorial_read_1').call<FeishuBitableToolTutorialReadOneAggregatequeryOutput>('aggregateQuery', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { result, hasMore, pageToken } = result;
 * 返回值形如：
 *   {"result":[{}],"hasMore":false,"pageToken":"示例文本"}
 */
export interface FeishuBitableToolTutorialReadOneAggregatequeryOutput {
  /** [object Object] */
  result: {

  }[];
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
}

export interface FeishuBitableToolTutorialReadOneBatchaddrecordsInput {
  /** [object Object] */
  records: {
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_tool_tutorial_read_1').call<FeishuBitableToolTutorialReadOneBatchaddrecordsOutput>('batchAddRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableToolTutorialReadOneBatchaddrecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FeishuBitableToolTutorialReadOneBatchupdaterecordsInput {
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_tool_tutorial_read_1').call<FeishuBitableToolTutorialReadOneBatchupdaterecordsOutput>('batchUpdateRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableToolTutorialReadOneBatchupdaterecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FeishuBitableToolTutorialReadOneDeleterecordsInput {
  /** [object Object] */
  recordIDs: string[];
}

/**
 * capabilityClient.load('feishu_bitable_tool_tutorial_read_1').call<FeishuBitableToolTutorialReadOneDeleterecordsOutput>('deleteRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { success } = result;
 * 返回值形如：
 *   {"success":false}
 */
export interface FeishuBitableToolTutorialReadOneDeleterecordsOutput {
  /** [object Object] */
  success: boolean;
}

export interface FeishuBitableToolTutorialReadOneGetrecordInput {
  /** [object Object] */
  recordID: string;
}

/**
 * capabilityClient.load('feishu_bitable_tool_tutorial_read_1').call<FeishuBitableToolTutorialReadOneGetrecordOutput>('getRecord', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { id, record } = result;
 * 返回值形如：
 *   {"id":"示例文本","record":{}}
 */
export interface FeishuBitableToolTutorialReadOneGetrecordOutput {
  /** [object Object] */
  id: string;
  /** [object Object] */
  record?: {

  };
}

export interface FeishuBitableToolTutorialReadOneSearchrecordsInput {
  /** [object Object] */
  fieldNames?: string[];
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conjunction?: string;
    conditions?: {
      fieldName: string;
      operator: string;
      value?: string[];
    }[];
  };
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  pageSize?: number;
}

/**
 * capabilityClient.load('feishu_bitable_tool_tutorial_read_1').call<FeishuBitableToolTutorialReadOneSearchrecordsOutput>('searchRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records, hasMore, pageToken, ... } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本","record":{}}],"hasMore":false,"pageToken":"示例文本","total":0}
 */
export interface FeishuBitableToolTutorialReadOneSearchrecordsOutput {
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  total?: number;
}
// ---- end:feishu_bitable_tool_tutorial_read_1 ----

// ---- plugin:feishu_bitable_onboarding_task_update_1 ----
// ============================================================
// 插件 feishu_bitable_onboarding_task_update_1 (入职任务状态更新插件) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface FeishuBitableOnboardingTaskUpdateOneAggregatequeryInput {
  /** [object Object] */
  expandArrayDimension?: boolean;
  /** [object Object] */
  dimensions?: string[];
  /** [object Object] */
  measures?: {
    aggregation: string;
    alias?: string;
    fieldName: string;
  }[];
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  pageSize?: number;
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conjunction?: string;
    conditions?: {
      operator: string;
      value?: string[];
      fieldName: string;
    }[];
  };
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_task_update_1').call<FeishuBitableOnboardingTaskUpdateOneAggregatequeryOutput>('aggregateQuery', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { hasMore, pageToken, result } = result;
 * 返回值形如：
 *   {"hasMore":false,"pageToken":"示例文本","result":[{}]}
 */
export interface FeishuBitableOnboardingTaskUpdateOneAggregatequeryOutput {
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  result: {

  }[];
}

export interface FeishuBitableOnboardingTaskUpdateOneBatchaddrecordsInput {
  /** [object Object] */
  records: {
    record: {
      '任务状态'?: string;
    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_task_update_1').call<FeishuBitableOnboardingTaskUpdateOneBatchaddrecordsOutput>('batchAddRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableOnboardingTaskUpdateOneBatchaddrecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FeishuBitableOnboardingTaskUpdateOneBatchupdaterecordsInput {
  /** [object Object] */
  records: {
    id: string;
    record: {
      '任务状态'?: string;
    };
  }[];
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_task_update_1').call<FeishuBitableOnboardingTaskUpdateOneBatchupdaterecordsOutput>('batchUpdateRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface FeishuBitableOnboardingTaskUpdateOneBatchupdaterecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface FeishuBitableOnboardingTaskUpdateOneDeleterecordsInput {
  /** [object Object] */
  recordIDs: string[];
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_task_update_1').call<FeishuBitableOnboardingTaskUpdateOneDeleterecordsOutput>('deleteRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { success } = result;
 * 返回值形如：
 *   {"success":false}
 */
export interface FeishuBitableOnboardingTaskUpdateOneDeleterecordsOutput {
  /** [object Object] */
  success: boolean;
}

export interface FeishuBitableOnboardingTaskUpdateOneGetrecordInput {
  /** [object Object] */
  recordID: string;
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_task_update_1').call<FeishuBitableOnboardingTaskUpdateOneGetrecordOutput>('getRecord', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { id, record } = result;
 * 返回值形如：
 *   {"id":"示例文本","record":{"任务状态":"示例文本"}}
 */
export interface FeishuBitableOnboardingTaskUpdateOneGetrecordOutput {
  /** [object Object] */
  id: string;
  /** [object Object] */
  record?: {
    '任务状态'?: string;
  };
}

export interface FeishuBitableOnboardingTaskUpdateOneSearchrecordsInput {
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  pageSize?: number;
  /** [object Object] */
  fieldNames?: string[];
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conjunction?: string;
    conditions?: {
      fieldName: string;
      operator: string;
      value?: string[];
    }[];
  };
}

/**
 * capabilityClient.load('feishu_bitable_onboarding_task_update_1').call<FeishuBitableOnboardingTaskUpdateOneSearchrecordsOutput>('searchRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { hasMore, pageToken, total, ... } = result;
 * 返回值形如：
 *   {"hasMore":false,"pageToken":"示例文本","total":0,"records":[{"id":"示例文本","record":{"任务状态":"示例文本"}}]}
 */
export interface FeishuBitableOnboardingTaskUpdateOneSearchrecordsOutput {
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  total?: number;
  /** [object Object] */
  records: {
    id: string;
    record: {
      '任务状态'?: string;
    };
  }[];
}
// ---- end:feishu_bitable_onboarding_task_update_1 ----

// ---- plugin:learning_module_text_to_json_1 ----
// ============================================================
// 插件 learning_module_text_to_json_1 (一句话生成学习模块) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface LearningModuleTextToJsonOneInput {
  /** 用户输入的学习模块需求描述，例如"做一个英语四级背单词模块"、"做一个入职知识测试模块" */
  module_requirement: string;
}

/**
 * capabilityClient.load('learning_module_text_to_json_1').call<LearningModuleTextToJsonOneOutput>('textToJson', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { module_type, title, items } = result;
 * 返回值形如：
 *   {"module_type":"示例文本","title":"示例文本","items":[]}
 */
export interface LearningModuleTextToJsonOneOutput {
  /** 模块类型，只能是"vocabulary"（背单词模块）或"quiz"（知识测试模块） */
  module_type: string;
  /** 学习模块的标题 */
  title: string;
  /** 模块内容列表，背单词模块为词条列表，schema: {word: string(单词), translation: string(释义)}；测试模块为题目列表，schema: {question: string(题目), options: array(4个选项), answer: string(正确答案)} */
  items: unknown[];
}
// ---- end:learning_module_text_to_json_1 ----

// ---- plugin:ai_image_reference_task_description_1 ----
// ============================================================
// 插件 ai_image_reference_task_description_1 (参考图任务描述生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface AiImageReferenceTaskDescriptionOneInput {
  /** 用户自定义的分析提示词（可选） */
  custom_prompt?: string;
  /** 用户上传的参考图片列表 */
  reference_images: string[];
}

/**
 * capabilityClient.load('ai_image_reference_task_description_1').callStream<AiImageReferenceTaskDescriptionOneOutput>('imageUnderstanding', input)
 * 每个 chunk 就是下面这个扁平对象，字段名与 AiImageReferenceTaskDescriptionOneOutput 一致，外面没有 data / choices / message 包装：
 *   {"response":"示例文本","content":"示例文本","reasoningContent":""}
 * 返回值可能是 AsyncIterable<chunk>，也可能是 { output: AsyncIterable<chunk> }，取流前先归一化。
 * 逐段累加：
 *   for await (const chunk of stream) { result += chunk.response ?? ''; }
 */
export interface AiImageReferenceTaskDescriptionOneOutput {
  /** [object Object] */
  response?: string;
  /** [object Object] */
  content: string;
  /** [object Object] */
  reasoningContent?: string;
}
// ---- end:ai_image_reference_task_description_1 ----

// ---- plugin:task_auto_split_text_to_json_1 ----
// ============================================================
// 插件 task_auto_split_text_to_json_1 (任务自动拆分) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface TaskAutoSplitTextToJsonOneInput {
  /** 任务分类 */
  task_category: string;
  /** 任务子分类 */
  task_subcategory?: string;
  /** 任务描述 */
  task_description: string;
  /** 任务名称 */
  task_name: string;
}

/**
 * capabilityClient.load('task_auto_split_text_to_json_1').call<TaskAutoSplitTextToJsonOneOutput>('textToJson', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { subtasks } = result;
 * 返回值形如：
 *   {"subtasks":[]}
 */
export interface TaskAutoSplitTextToJsonOneOutput {
  /** 子任务列表，items schema: {title: string(子任务标题,清晰明确可执行), note: string(子任务一句话说明,补充子任务的关键要求或注意事项)} */
  subtasks: unknown[];
}
// ---- end:task_auto_split_text_to_json_1 ----