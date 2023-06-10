import {CfnGuardRuleExecutor} from '../src/cfn-guard-rule-executor'
import {describe, it, expect} from '@jest/globals'

describe('CodeCatalyst action CfnGuardRegistryExecute', () => {
  it('should test the action', () => {
    expect(new CfnGuardRuleExecutor()).not.toBeNull()
  })
})
