import * as core from '@actions/core'
import * as shell from 'shelljs'

// eslint-disable-next-line no-shadow
export enum OutputFormat {
  JSON = 'JSON',
  SINGLE_LINE_SUMMARY = 'SINGLE_LINE_SUMMARY'
}

export class CfnGuardRuleExecutor {
  constructor() {
    this.install()
  }

  private install(): void {
    shell.exec('curl https://sh.rustup.rs -sSf | sh -s -- -y > /dev/null')
    shell.exec('source "$HOME/.cargo/env" && cargo install cfn-guard')
    const ret = shell.exec('source "$HOME/.cargo/env" && cfn-guard --version')
    if (ret.code !== 0) {
      core.setFailed(`Unable to install cfn-guard: ${JSON.stringify(ret)}`)
    }
  }

  validate(
    rulesPath: string,
    templatesPath: string,
    output: OutputFormat
  ): void {
    let cmd = `source "$HOME/.cargo/env" && cfn-guard validate --data ${templatesPath} --rules ${rulesPath}`
    core.debug(cmd)
    switch (output) {
      case OutputFormat.JSON:
        cmd += ' --output-format json'
        break
      case OutputFormat.SINGLE_LINE_SUMMARY:
      default:
        cmd += ' --output-format single-line-summary'
        break
    }
    const result = shell.exec(cmd)
    if (result.code === 5) {
      core.setFailed(result.stdout)
    }
  }
}
