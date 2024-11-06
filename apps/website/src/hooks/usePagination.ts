import { useMemo } from "react"

function range(start: number, end: number) {
  const length = end - start + 1
  return Array.from({ length }, (_, index) => index + start)
}

export interface PaginationParams {
  /** Total amount of pages */
  total: number

  /** Siblings amount on left/right side of selected page, defaults to 1 */
  siblings?: number

  /** Current active page number */
  currentPage: number
}

export function usePagination({
  total,
  siblings = 1,
  currentPage,
}: PaginationParams) {
  return useMemo(() => {
    const totalPageNumbers = siblings * 2 + 5

    if (totalPageNumbers >= total) {
      return {
        leftEllipsis: false,
        middle: range(1, total),
        rightEllipsis: false,
      }
    }

    const leftSiblingIndex = Math.max(currentPage - siblings, 1)
    const rightSiblingIndex = Math.min(currentPage + siblings, total)

    const shouldShowLeftEllipsis = leftSiblingIndex > 2
    const shouldShowRightEllipsis = rightSiblingIndex < total - 2

    let middle

    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      middle = range(1, 3 + 2 * siblings)
    } else if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
      middle = range(total - (3 + 2 * siblings) + 1, total)
    } else {
      middle = range(leftSiblingIndex, rightSiblingIndex)
    }

    return {
      leftEllipsis: shouldShowLeftEllipsis,
      middle: middle,
      rightEllipsis: shouldShowRightEllipsis,
    }
  }, [total, siblings, currentPage])
}
