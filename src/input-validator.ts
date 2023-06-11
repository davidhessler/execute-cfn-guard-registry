import * as semver from 'semver'
import fs from 'fs'
import {OutputFormat} from './cfn-guard-rule-executor'

export class InputValidator {
  private readonly genericValidString: RegExp
  private readonly s3BucketValidString: RegExp
  private readonly emailValidString: RegExp
  private readonly linuxValidString: RegExp
  constructor() {
    this.genericValidString = new RegExp('[\\w\\s\\-\\.!@#$%^&*()\\—]+')
    this.s3BucketValidString = new RegExp(
      '(?!(^xn--|.+-s3alias$|.+--ol-s3$))^[a-z0-9][a-z0-9-.]{1,61}[a-z0-9]$'
    )
    this.emailValidString = new RegExp('^[\\w\\-\\+\\.]+@[\\w\\-\\.]+\\w+$')
    this.linuxValidString = new RegExp('^\\/*.\\w+.(\\/[\\w-]+)*$')
  }

  isValidBucketName(input: string): boolean {
    const ret = this.s3BucketValidString.exec(input)
    if (ret) {
      return ret[0] === input
    } else {
      return false
    }
  }

  isValidGenericInput(input: string): boolean {
    const ret = this.genericValidString.exec(input)
    if (ret) {
      return ret[0] === input
    } else {
      return false
    }
  }

  isValidVersion(input: string): boolean {
    return semver.valid(input) !== null
  }

  isValidEmail(input: string): boolean {
    const ret = this.emailValidString.exec(input)
    if (ret) {
      return ret[0] === input
    } else {
      return false
    }
  }

  isValidBoolean(input: string): boolean {
    switch (input) {
      case 'true':
      case 'True':
      case 'false':
      case 'False':
        return true
      default:
        return false
    }
  }

  isFolderValid(input: string): boolean {
    return (
      input === '.' ||
      (this.linuxValidString.test(input) && fs.existsSync(input))
    )
  }

  isValidOutputFormat(input: string): boolean {
    return (
      input === OutputFormat.JSON.toString() ||
      input === OutputFormat.SINGLE_LINE_SUMMARY.toString()
    )
  }
}
