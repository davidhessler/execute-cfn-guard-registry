import * as core from '@actions/core'
import * as shell from 'shelljs'

// eslint-disable-next-line no-shadow
export enum OutputFormat {
  JSON = 'JSON',
  SINGLE_LINE_SUMMARY = 'SINGLE_LINE_SUMMARY'
}

export class CfnGuardRuleExecutor {
  async install(): Promise<void> {
    shell.exec(
      'sudo apt-get update && sudo apt-get install -y bash coreutils curl gcc'
    )
    shell.exec(
      'curl https://static.rust-lang.org/rustup/dist/x86_64-unknown-linux-gnu/rustup-init > rustup-init'
    )
    shell.exec('chmod +x rustup-init && ./rustup-init -y')
    shell.exec('$HOME/.cargo/bin/cargo install cfn-guard')
    const ret = shell.exec('$HOME/.cargo/bin/cfn-guard --version')
    if (ret.code !== 0) {
      core.setFailed(`Unable to install cfn-guard: ${JSON.stringify(ret)}`)
    }
  }

  async validate(
    rulesPath: string,
    templatesPath: string,
    output: OutputFormat
  ): Promise<void> {
    let cmd = `$HOME/.cargo/bin/cfn-guard validate --data ${templatesPath} --rules ${rulesPath}`
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
      core.setFailed('CloudFormation Guard detected an error')
    }

    if(result.code === 0){
      core.notice('CloudFormation Guard detected no errors')
    }
  }
}
