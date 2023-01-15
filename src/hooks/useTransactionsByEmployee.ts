import { useCallback, useContext, useState } from "react"
import { AppContext } from "src/utils/context"
import { RequestByEmployeeParams, Transaction } from "../utils/types"
import { TransactionsByEmployeeResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function useTransactionsByEmployee(): TransactionsByEmployeeResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const { cache } = useContext(AppContext)
  const [transactionsByEmployee, setTransactionsByEmployee] = useState<Transaction[] | null>(null)

  const fetchById = useCallback(
    async (employeeId: string) => {
      const data = await fetchWithCache<Transaction[], RequestByEmployeeParams>(
        "transactionsByEmployee",
        {
          employeeId,
        }
      )

      setTransactionsByEmployee(data)
    },
    [fetchWithCache]
  )

  const invalidateData = useCallback(() => {
    setTransactionsByEmployee(null)
  }, [])

  // update the approved value of a transaction in that transaction byemployee cache
  const updateCache = useCallback((employeeId: string, value: boolean, transactionId: string) => {
    const cacheKey = `transactionsByEmployee@{"employeeId":"${employeeId}"}`
    const cacheResponse = cache?.current.get(cacheKey)

    if (cacheResponse) {
      const data = JSON.parse(cacheResponse)
      const result = data.map((t: Transaction) => {
        if (t.id === transactionId) {
          return {
            ...t,
            approved: value,
          }
        }
        return t
      })

      cache?.current.set(cacheKey, JSON.stringify(result))
    }
  }, [])

  return { data: transactionsByEmployee, loading, fetchById, invalidateData, updateCache }
}
