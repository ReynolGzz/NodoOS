import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm'

@Entity('playlist_votes')
export class PlaylistVote {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'branch_id' })
  branchId: string

  @Column({ name: 'playlist_id', length: 100 })
  playlistId: string

  @Column({ name: 'playlist_name', length: 200 })
  playlistName: string

  @Column({ name: 'user_id', nullable: true })
  userId: string | null

  @CreateDateColumn({ name: 'voted_at' })
  votedAt: Date
}
