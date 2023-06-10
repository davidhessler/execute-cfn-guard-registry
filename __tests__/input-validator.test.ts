import {InputValidator} from '../src/input-validator'
import {describe, it, expect} from '@jest/globals'

describe('Input Validator -- BucketName', () => {
  const validator = new InputValidator()

  it('should say a valid bucket name is valid', () => {
    expect(validator.isValidBucketName('my-bucket')).toBeTruthy()
    expect(validator.isValidBucketName('mybucket')).toBeTruthy()
    expect(validator.isValidBucketName('0123456789012mybucket')).toBeTruthy()
    expect(validator.isValidBucketName('mybucket0123456789012')).toBeTruthy()
    expect(
      validator.isValidBucketName('mybucket.mybucket0123485638')
    ).toBeTruthy()
  })

  // From https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html
  it('should say a bucket name starting with xn-- is invalid', () => {
    expect(validator.isValidBucketName('xn--mybucket')).toBeFalsy()
  })
  it('should say a bucket name ending with -s3alias is invalid', () => {
    expect(validator.isValidBucketName('mybucket-s3alias')).toBeFalsy()
  })
  it('should say a bucket name cannot end or start with a . is invalid', () => {
    expect(validator.isValidBucketName('mybucket.')).toBeFalsy()
    expect(validator.isValidBucketName('.mybucket')).toBeFalsy()
  })
  it('should say a bucket name cannot contain two adjacent periods is invalid', () => {
    expect(validator.isValidBucketName('mybucket..')).toBeFalsy()
    expect(validator.isValidBucketName('..mybucket')).toBeFalsy()
  })
  it('should say a bucket name cannot contain symbols other than . is invalid', () => {
    expect(validator.isValidBucketName('my&bucket')).toBeFalsy()
  })
  it('should say a bucket name cannot end with --ol-s3', () => {
    expect(validator.isValidBucketName('mybucket--ol-s3')).toBeFalsy()
  })
})

describe('InputValidator -- Generic Input', () => {
  const validator = new InputValidator()
  it('should say generic input is valid if it is a full sentence', () => {
    expect(
      validator.isValidGenericInput(
        'The quick brown fox jumps over the lazy dog is an English-language pangram — a sentence that contains all the letters of the alphabet.'
      )
    ).toBeTruthy()
  })

  it('should say generic input is valid if it contains !@#$%^&*()', () => {
    expect(
      validator.isValidGenericInput(
        '!T@he# qui$ck bro%wn fox ^jumps o&ver the* lazy (dog is an English-0language pangram — a sentence that contains all the letters of the alphabet.'
      )
    ).toBeTruthy()
  })

  it('should say emails are valid if it uses alpha numeric characters, + and @', () => {
    expect(validator.isValidEmail('alias@amazon.com')).toBeTruthy()
    expect(validator.isValidEmail('alias+hello@amazon.com')).toBeTruthy()
    expect(validator.isValidEmail('name-other@acme.io')).toBeTruthy()
    expect(validator.isValidEmail('last.first@acme.aero')).toBeTruthy()
    expect(validator.isValidEmail('bad@amazon.com;input')).toBeFalsy()
  })

  it('should say paths are valid if they are linux paths', () => {
    expect(validator.isFolderValid('/tmp')).toBeTruthy()
    expect(validator.isFolderValid('/tmp;ls -laRT /')).toBeFalsy()
    expect(validator.isValidVersion('C:\\windows')).toBeFalsy()
  })
})
