import { IsString, IsOptional, IsArray, ValidateNested, IsEnum, IsUUID, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { PaymentMethod } from '@nodo/types'

export class CreateOrderItemCustomizationDto {
  @IsUUID()
  optionId: string

  @IsUUID()
  valueId: string
}

export class CreateOrderItemDto {
  @IsUUID()
  productId: string

  @IsInt()
  @Min(1)
  quantity: number

  @IsOptional()
  @IsString()
  notes?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemCustomizationDto)
  customizations: CreateOrderItemCustomizationDto[]
}

export class CreateOrderDto {
  @IsString()
  tableToken: string

  @IsOptional()
  @IsString()
  sessionToken?: string

  @IsOptional()
  @IsUUID()
  userId?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[]

  @IsOptional()
  @IsString()
  notes?: string

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod
}
