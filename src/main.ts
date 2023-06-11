import * as core from '@actions/core'
import * as fs from 'fs'
import {InputValidator} from './input-validator'
import {GetObjectCommand, S3Client} from '@aws-sdk/client-s3'
import {CfnGuardRuleExecutor, OutputFormat} from './cfn-guard-rule-executor'
import {createHash} from 'crypto'

const ruleLocation = `${__dirname}/temp.guard`

interface WriteTempFileParam {
  rawRuleContent: string
  ruleRegistryBucket: string
  version: string
  ruleSetName: string
  s3Client: S3Client
}
async function writeTempFile(param: WriteTempFileParam): Promise<boolean> {
  core.notice('Writing the rule to the filesystem')
  if (param.rawRuleContent) {
    const hashResult = await param.s3Client.send(
      new GetObjectCommand({
        Bucket: param.ruleRegistryBucket,
        Key: `${param.version}/${param.ruleSetName}.sha256`
      })
    )
    const expected = await hashResult.Body?.transformToString()
    const actual = createHash('sha256')
      .update(param.rawRuleContent)
      .digest('hex')
    if (expected === actual) {
      fs.writeFileSync(ruleLocation, param.rawRuleContent)
      core.notice('Successfully wrote the rule to the filesystem')
      return true
    } else {
      core.setFailed(
        "Action Failed, reason: Guard rule doesn't equal hash value"
      )
    }
  }
  return false
}

async function run(): Promise<void> {
  try {
    const ruleRegistryBucket = core.getInput('RuleRegistryBucket')
    const ruleSetName = core.getInput('RuleSetName')
    const version = core.getInput('Version')
    const cloudFormationPath = core.getInput('CloudFormationPath')
    const outputFormatStr = core.getInput('OutputFormat')
    let outputFormat = OutputFormat.JSON

    const validator = new InputValidator()
    const failed = false
    if (!failed && !validator.isValidBucketName(ruleRegistryBucket)) {
      core.setFailed(
        `Action Failed, reason: invalid parameter RuleRegistryBucket ${ruleRegistryBucket}.  RuleRegistryBucket must be a valid bucket name`
      )
    } else {
      core.notice('RuleRegistryBucket is valid')
    }

    if (!failed && !validator.isValidVersion(version)) {
      core.setFailed(
        `Action Failed, reason: invalid parameter Version ${version}.  Version must be a valid version`
      )
    } else {
      core.notice('Version is valid')
    }

    if (!failed && !validator.isFolderValid(cloudFormationPath)) {
      core.setFailed(
        `Action Failed, reason: invalid parameter CloudFormationFolder ${cloudFormationPath}.  CloudFormationFolder must be a valid path`
      )
    } else {
      core.notice('CloudFormationFolder is valid')
    }

    if (!failed && !validator.isValidOutputFormat(outputFormatStr)) {
      core.setFailed(
        `Action Failed, reason: invalid parameter OutputFormat ${outputFormatStr}.  OutputFormat must be either JSON or SINGLE_LINE_SUMMARY`
      )
    } else {
      core.notice('OutputFormat is valid')
      outputFormat = outputFormatStr as OutputFormat
    }

    // Action Code start
    core.notice('Starting download of the rule')
    const s3Client = new S3Client({})
    const result = await s3Client.send(
      new GetObjectCommand({
        Bucket: ruleRegistryBucket,
        Key: `${version}/${ruleSetName}.guard`
      })
    )
    core.notice('Successfully downloaded the file')
    const rawRuleContent = await result.Body?.transformToString()
    core.notice('Finished transforming file')
    if (rawRuleContent) {
      const isValid = await writeTempFile({
        rawRuleContent,
        ruleRegistryBucket,
        ruleSetName,
        version,
        s3Client
      })
      if (isValid) {
        core.notice('Starting up executor')
        const executor = new CfnGuardRuleExecutor()
        await executor.install()
        core.notice('Running CloudFormation Guard')
        executor.validate(ruleLocation, cloudFormationPath, outputFormat)
      }
    }
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
