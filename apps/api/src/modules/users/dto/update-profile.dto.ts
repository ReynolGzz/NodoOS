import { IsOptional, IsString, IsObject, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class PreferencesDto {
  @IsOptional() @IsString() locale?: string
  @IsOptional() @IsString() theme?: string
  @IsOptional() @IsString() preferredMilk?: string
  @IsOptional() @IsString() preferredSugar?: string
}

export class UpdateProfileDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsString() phone?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto
}
