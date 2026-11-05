import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum RecurrenceType
{
    Hourly = 'hourly',
    Daily = 'daily',
    Weekly = 'weekly',
    Monthly = 'monthly',
    Yearly = 'yearly'
}

/**
 * The singular unit name of each recurrence type, used for display (e.g. "every 3 months").
 */
const RecurrenceUnit: Record<RecurrenceType, string> = {
    [RecurrenceType.Hourly]: 'hour',
    [RecurrenceType.Daily]: 'day',
    [RecurrenceType.Weekly]: 'week',
    [RecurrenceType.Monthly]: 'month',
    [RecurrenceType.Yearly]: 'year'
};

/**
 * Formats a recurrence for display, e.g. "monthly" or "every 3 months".
 *
 * @param {RecurrenceType} recurrence The recurrence type
 * @param {number} interval The amount of recurrence units between each occurrence
 * @returns {string} The formatted recurrence
 */
export function formatRecurrence(recurrence: RecurrenceType, interval = 1): string
{
    return interval === 1 ? recurrence : `every ${interval} ${RecurrenceUnit[recurrence]}s`;
}

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

    @Column({
        type: 'enum',
        enum: RecurrenceType,
        nullable: true,
        default: null
    })
    recurrence: RecurrenceType | null;

    /**
     * The amount of recurrence units between each occurrence, e.g. 3 with monthly recurrence = every 3 months
     */
    @Column({ default: 1 })
    recurrenceInterval: number;
}
