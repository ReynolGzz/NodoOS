import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { SOCKET_EVENTS } from '@nodo/types'
import type { OrderUpdatedEvent, NewOrderEvent, OrderStatusChangedEvent } from '@nodo/types'
import { Order } from '../../entities/order.entity'
import { OrderStatus } from '@nodo/types'

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class OrdersGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server

  afterInit() {
    console.log('WebSocket Gateway initialized')
  }

  @SubscribeMessage(SOCKET_EVENTS.ORDER_SUBSCRIBE)
  handleOrderSubscribe(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`order:${data.orderId}`)
  }

  @SubscribeMessage(SOCKET_EVENTS.KITCHEN_JOIN)
  handleKitchenJoin(
    @MessageBody() data: { branchId: string; token: string },
    @ConnectedSocket() client: Socket,
  ) {
    const expectedToken = process.env.KITCHEN_TOKEN ?? ''
    if (expectedToken && data.token !== expectedToken) {
      client.emit('error', { message: 'Invalid kitchen token' })
      client.disconnect()
      return
    }
    client.join(`kitchen:${data.branchId}`)
  }

  @SubscribeMessage(SOCKET_EVENTS.KITCHEN_STATUS_CHANGE)
  handleStatusChange(
    @MessageBody() data: { orderId: string; newStatus: OrderStatus },
  ) {
    // This is handled via REST — kitchen uses PATCH /api/orders/:id/status
    // The gateway method here is for direct WS usage by kitchen display
  }

  emitOrderUpdated(orderId: string, status: OrderStatus, estimatedMinutes?: number) {
    const event: OrderUpdatedEvent = {
      orderId,
      status,
      estimatedMinutes,
      updatedAt: new Date().toISOString(),
    }
    this.server.to(`order:${orderId}`).emit(SOCKET_EVENTS.ORDER_UPDATED, event)
  }

  emitNewOrder(branchId: string, order: Order) {
    const event: NewOrderEvent = {
      order: {
        ...order,
        tableNumber: order.table.number,
        zoneName: order.table.zone?.name,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    }
    this.server.to(`kitchen:${branchId}`).emit(SOCKET_EVENTS.ORDER_NEW, event)
  }

  emitOrderStatusChanged(branchId: string, orderId: string, status: OrderStatus, tableNumber: number) {
    const event: OrderStatusChangedEvent = { orderId, status, tableNumber }
    this.server.to(`kitchen:${branchId}`).emit(SOCKET_EVENTS.ORDER_STATUS_CHANGED, event)
  }
}
