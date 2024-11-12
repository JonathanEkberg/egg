export async function prefetchTimeout(
  func: Promise<unknown>[],
  timeoutMS: number = 300,
): Promise<unknown> {
  return Promise.race<unknown>([
    Promise.allSettled(func),
    new Promise<void>(res => setTimeout(res, timeoutMS)),
  ])
}
