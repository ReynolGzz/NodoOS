'use client'

import { useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { SOCKET_EVENTS, type OrderUpdatedEvent } from '@nodo/types'
import { OrderStatus } from '@nodo/types'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001'

interface UseOrderSocketOptions {
  orderId: string
  onUpdate?: (event: OrderUpdatedEvent) => void
}

export function useOrderSocket({ orderId, onUpdate }: UseOrderSocketOptions) {
  const [status, setStatus] = useState<OrderStatus | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    })

    socket.on('connect', () => {
      setConnected(true)
      socket.emit(SOCKET_EVENTS.ORDER_SUBSCRIBE, { orderId })
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on(SOCKET_EVENTS.ORDER_UPDATED, (event: OrderUpdatedEvent) => {
      setStatus(event.status)
      onUpdate?.(event)
    })

    return () => {
      socket.disconnect()
    }
  }, [orderId, onUpdate])

  return { status, connected }
}
