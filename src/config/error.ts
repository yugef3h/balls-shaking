export const handleTryCatch = (fn: (...args: any[]) => Promise<{}>) => async (
  ...args: any[]
) => {
  try {
    return [null, await fn(...args)]
  } catch (e) {
    console.log(e, 'e.messagee')
    return [e]
  }
}

class DbError extends Error {
  public errmsg: string
  public errno: number
  constructor(msg: string, code: number) {
    super(msg)
    this.errmsg = msg || 'db_error_msg'
    this.errno = code || 20010
  }
}
class ValidatedError extends Error {
  public errmsg: string
  public errno: number
  constructor(msg: string, code: number) {
    super(msg)
    this.errmsg = msg || 'validated_error_msg'
    this.errno = code || 20010
  }
}

// 3. 错误处理的逻辑，这可能只是其中一类。通常错误处理都是按功能需求来划分
//    比如请求失败（200 但是返回值有错误信息），比如 node 中写 db 失败等。
export const errorHandle = (e: Error) => {
  // do something
  if (e instanceof ValidatedError || e instanceof DbError) {
    // do sth
    return e
  }
  return {
    code: 101,
    errmsg: 'unKnown'
  }
}
