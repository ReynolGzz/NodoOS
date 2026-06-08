'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, type Socket } from 'socket.io-client'
import { SOCKET_EVENTS, OrderStatus } from '@nodo/types'
import type { NewOrderEvent, OrderStatusChangedEvent, Order } from '@nodo/types'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001'

interface UseKitchenSocketOptions {
  branchId: string
  onNewOrder?: (event: NewOrderEvent) => void
  onStatusChanged?: (event: OrderStatusChangedEvent) => void
}

export function useKitchenSocket({ branchId, onNewOrder, onStatusChanged }: UseKitchenSocketOptions) {
  const [connected, setConnected] = useState(false)
  const [socketRef, setSocketRef] = useState<Socket | null>(null)

  useEffect(() => {
    if (!branchId) return

    const socket: Socket = io(SOCKET_URL, { transports: ['websocket'] })

    socket.on('connect', () => {
      setConnected(true)
      const kitchenToken = (typeof window !== 'undefined' ? localStorage.getItem('nodo-kitchen-token') : null)
        ?? process.env.NEXT_PUBLIC_KITCHEN_TOKEN
        ?? ''
      socket.emit(SOCKET_EVENTS.KITCHEN_JOIN, { branchId, token: kitchenToken })
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on(SOCKET_EVENTS.ORDER_NEW, (event: NewOrderEvent) => {
      onNewOrder?.(event)
    })

    socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, (event: OrderStatusChangedEvent) => {
      onStatusChanged?.(event)
    })

    setSocketRef(socket)

    return () => { socket.disconnect() }
  }, [branchId])

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      return res.json()
    },
    [],
  )

  return { connected, updateStatus }
}
