import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * A reaction action that has been performed on a message, used to make sure each action only happens once per message
 *
 * @author Soni
 * @since 7.6.0
 * @see {@link BaseEntity}
 */
@Entity('reaction_action')
@Index([ 'message', 'action' ], { unique: true })
export default class ReactionActionEntity extends BaseEntity
{
    constructor(partial?: Partial<ReactionActionEntity>)
    {
        super();
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * The ID of the message the action was performed on
     */
    @Column()
    message: string;

    /**
     * The action that was performed
     */
    @Column({ type: 'varchar' })
    action: 'mute' | 'pin';
}
