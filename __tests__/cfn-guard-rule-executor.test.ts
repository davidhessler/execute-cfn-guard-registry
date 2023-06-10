import {CfnGuardRuleExecutor} from '../src/cfn-guard-rule-executor'
import {describe, it, expect} from '@jest/globals'

describe('CfnGuardRuleExecutor', () => {
  it('installs cfn-guard', () => {
    expect(new CfnGuardRuleExecutor()).not.toBeNull()
  })
})
