import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

/**
 * An uptime result entity in the database, used to track how long the uptime has been throughout several launches
 *
 * @author Soni
 * @since 7.0.0
 * @see {@link BaseEntity}
 */
@Entity('uptime_result')
export default class UptimeResultEntity extends BaseEntity
{
    constructor(partial?: Partial<UptimeResultEntity>)
    {
        super();
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * The uptime that was achieved, in milliseconds
     */
    @Column()
    uptime: number;

    /**
     * The UUID of the session in which this uptime was achieved
     */
    @Column()
    session: string;

    /**
     * The timestamp of when this uptime was updated
     */
    @Column({ type: "timestamptz" })
    achieved: Date;
}
