import { useCallback, useContext, useState } from "react"
import { AppContext } from "src/utils/context"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const { cache } = useContext(AppContext)
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    )

    setPaginatedTransactions((previousResponse) => {
      if (response === null || previousResponse === null) {
        return response
      }

      return { data: previousResponse.data.concat(response.data), nextPage: response.nextPage }
    })
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  // update the approved value of a transaction in paginatedResults cache
  const updateCache = useCallback((newValue: boolean, transactionId: string) => {
    if (!cache?.current) return

    cache.current.forEach((value: string, key: string) => {
      if (key.includes("paginatedTransactions")) {
        const data = JSON.parse(value)
        const result = data.data.map((t: Transaction) => {
          if (t.id === transactionId) {
            return {
              ...t,
              approved: newValue,
            }
          }
          return t
        })

        data.data = result
        cache?.current.set(key, JSON.stringify(data))
      }
    })
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData, updateCache }
}
