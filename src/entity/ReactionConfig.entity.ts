import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * The mute part of a reaction config, embedded in {@link ReactionConfigEntity}
 *
 * @author Soni
 * @since 7.6.0
 */
export class ReactionMuteConfig
{
    /**
     * Whether reaction mutes are enabled
     */
    @Column()
    enabled: boolean;

    /**
     * The emote used to vote for a mute
     */
    @Column({ type: 'varchar', nullable: true })
    emote: string | null;

    /**
     * How many reactions are needed to mute the user
     */
    @Column()
    count: number;

    /**
     * How many minutes to mute the user for
     */
    @Column()
    minutes: number;

    /**
     * Whether to send a DM to users that get muted
     */
    @Column()
    notify: boolean;

    /**
     * Optional reason from the server, added to the DM sent to muted users
     */
    @Column({ type: 'varchar', nullable: true })
    reason: string | null;
}

/**
 * The pin part of a reaction config, embedded in {@link ReactionConfigEntity}
 *
 * @author Soni
 * @since 7.6.0
 */
export class ReactionPinConfig
{
    /**
     * Whether reaction pins are enabled
     */
    @Column()
    enabled: boolean;

    /**
     * The emote used to vote for a pin
     */
    @Column({ type: 'varchar', nullable: true })
    emote: string | null;

    /**
     * How many reactions are needed to pin the message
     */
    @Column()
    count: number;

    /**
     * The ID of the channel pinned messages are sent to
     */
    @Column({ type: 'varchar', nullable: true })
    channel: string | null;
}

/**
 * A per-server reaction action config entity in the database
 *
 * @author Soni
 * @since 7.6.0
 * @see {@link BaseEntity}
 */
@Entity('reaction_config')
export default class ReactionConfigEntity extends BaseEntity
{
    constructor(partial?: Partial<ReactionConfigEntity>)
    {
        super();
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * The ID of the guild this config belongs to
     */
    @Column({ unique: true })
    guild: string;

    /**
     * The mute settings, stored as the mute_* columns
     */
    @Column(() => ReactionMuteConfig)
    mute: ReactionMuteConfig;

    /**
     * The pin settings, stored as the pin_* columns
     */
    @Column(() => ReactionPinConfig)
    pin: ReactionPinConfig;
}
