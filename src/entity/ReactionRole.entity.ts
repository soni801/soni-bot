import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * A reaction role entity in the database
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link BaseEntity}
 */
@Entity('reaction_role')
export default class ReactionRoleEntity extends BaseEntity
{
    constructor(partial?: Partial<ReactionRoleEntity>)
    {
        super();
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column()
    role: string;

    @Column()
    reaction: string;
}
