import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity, Index } from "typeorm";

@Entity()
@Index([ "reminded" ])
export default class Reminder extends BaseEntity
{
    constructor(partial?: Partial<Reminder>) {
        super();
        // noinspection TypeScriptValidateTypes - this needs to be here due to a bug in IntelliJ
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
    @Column({ name: "created_at", default: () => "now() at time zone 'cest'", type: "timestamptz" })
    createdAt: Date;

    @Column()
    due: Date;

    @Column({ default: false })
    reminded: boolean;
}
