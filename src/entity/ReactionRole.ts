import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export default class ReactionRole extends BaseEntity
{
    constructor(partial?: Partial<ReactionRole>) {
        super();
        // noinspection TypeScriptValidateTypes - this needs to be here due to a bug in IntelliJ
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
