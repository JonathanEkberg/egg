"use client"

import React from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationEllipsis,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination"
import { usePagination } from "@/hooks/usePagination"

interface ProductListPaginationProps {
  page: number
  total: number
}

export function ProductListPagination({
  page,
  total,
}: ProductListPaginationProps) {
  const pagination = usePagination({
    currentPage: page,
    total,
    // siblings: 3,
  })
  const createLink = (page: number) =>
    `/?page=${encodeURIComponent(Math.min(Math.max(1, page), total))}`

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={createLink(page - 1)} />
        </PaginationItem>

        {pagination.leftEllipsis && (
          <>
            <PaginationItem>
              <PaginationLink href={createLink(1)} isActive={page === 1}>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationEllipsis />
          </>
        )}

        {pagination.middle.map(num => (
          <PaginationItem key={num}>
            <PaginationLink href={createLink(num)} isActive={page === num}>
              {num}
            </PaginationLink>
          </PaginationItem>
        ))}

        {pagination.rightEllipsis && (
          <>
            <PaginationEllipsis />
            <PaginationItem>
              <PaginationLink
                href={createLink(total)}
                isActive={page === total}
              >
                {total}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext href={createLink(page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
