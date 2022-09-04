import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * A reminder entity in the database
 * 
 * @author Soni
 * @since 6.0.0
 * @see {@link BaseEntity}
 */
@Entity('reminder')
@Index([ 'active' ])
export default class ReminderEntity extends BaseEntity
{
    constructor(partial?: Partial<ReminderEntity>)
    {
        super();
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user: string;

    @Column()
    channel: string;

    @Column()
    content: string;

    // The next line looks very cursed, but it does its job
    @Column({ name: "created_at", default: () => "(now() at time zone 'cest')", type: "timestamptz" })
    createdAt: Date;

    @Column()
    due: Date;

    @Column({ default: true })
    active: boolean;
}
