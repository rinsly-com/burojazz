/** `Response.json()` is `Promise<any>`. Returning it from `Promise<unknown>` keeps the value untyped without an assertion. */
export function readJson(response: Response): Promise<unknown> {
  return response.json()
}
